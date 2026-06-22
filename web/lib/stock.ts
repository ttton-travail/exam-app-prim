// ===========================
// 問題ストックのデータ層
// lib/stock.ts
//
// Supabaseの questions テーブルと、アプリ内部形式 Question を相互変換する。
// ・getStockQuestions: ストックからランダム取得
// ・saveQuestionsToStock: 生成した問題をストックへ保存（source='user'）
// ・checkAndIncrementDailyUsage: 全体の1日上限チェック＋カウント
// ===========================

import { getReadClient, getServiceClient } from '@/lib/supabase'
import { stripChoicePrefix, stripEnumeratedChoicesFromQuestion } from '@/lib/gemini'
import type { Question, Choice, ChoiceId } from '@/types/quiz'

/** DBの1行の形 */
interface QuestionRow {
    id: number
    subject_id: string
    unit_id: string
    unit_label: string
    question: string
    choices: string[]      // jsonb: 選択肢テキストの配列
    answer_index: number   // 正解の配列インデックス
    explanation: string
    keywords: string[]     // jsonb: 復習用キーワード
}

/** DB行 → アプリ内部形式（choices配列＋answerはID） */
function rowToQuestion(row: QuestionRow): Question {
    const choices: Choice[] = row.choices.map((text, i) => ({
        id: i as ChoiceId,
        text,
    }))
    return {
        id: row.id,
        unit: row.unit_label,
        unitId: row.unit_id,   // ★ID紐付けの正。表示はunit_labelだが検索・保存はこのIDで行う
        question: row.question,
        choices,
        answer: (row.answer_index as ChoiceId),
        explanation: row.explanation,
        keywords: Array.isArray(row.keywords) ? row.keywords : [],
    }
}

/**
 * ストックから条件に合う問題をランダムにN問取得する。
 * unitIds が空なら科目全体から。足りなければ取れた分だけ返す（呼び出し側で不足分を生成）。
 */
export async function getStockQuestions(
    subjectId: string,
    unitIds: string[],
    limit: number,
): Promise<Question[]> {
    const supabase = getReadClient()
    if (!supabase) {
        console.warn('[stock] readClient が null（Supabase環境変数未設定の可能性）')
        return []
    }
    try {
        const { data, error } = await supabase.rpc('pick_random_questions', {
            p_subject_id: subjectId,
            p_unit_ids: unitIds,
            p_limit: limit,
        })
        if (error) {
            console.error('[stock] 取得エラー', error.message)
            return []
        }
        return (data as QuestionRow[]).map(rowToQuestion)
    } catch (e) {
        // RPC自体が例外を投げても route 全体は落とさず、空で返してフォールバックさせる。
        console.error('[stock] 取得で例外', e)
        return []
    }
}

/**
 * 生成した問題をストックに保存する（source='user'）。
 * service_role が無ければ何もしない（保存はベストエフォート）。
 *
 * baseYear は「問題作成時に基準とした最新資料の年度（年度＝4月始まり）」。
 * questions.base_year に記録し、学習指導要領の改訂などで古くなった問題の
 * 精査・入替の判断に使う。未指定なら null（基準年度不明）で保存する。
 */
export async function saveQuestionsToStock(
    subjectId: string,
    questions: Question[],
    baseYear?: number,
): Promise<void> {
    const admin = getServiceClient()
    if (!admin) {
        // ★沈黙させない：なぜ特権クライアントが作れなかったかを必ず出す。
        //   url/serviceKey のどちらが欠けているかで、環境変数の登録漏れか反映漏れかを切り分けられる。
        console.error('[stock] 保存スキップ：service client が null（環境変数を確認）', {
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        })
        return
    }

    // ★unit_id には必ず単元ID（例: bio_base_02）を入れる。ラベルは入れない。
    //   unitId が無い問題は、誤ってラベルを unit_id に書き込む事故を防ぐため保存対象から外す
    //   （ID紐付けの原則違反を避ける。生成経路では route.ts が必ず unitId を付与する）。
    const withUnitId = questions.filter((q) => typeof q.unitId === 'string' && q.unitId.length > 0)
    const droppedNoUnit = questions.length - withUnitId.length
    if (droppedNoUnit > 0) {
        console.warn(`[stock] unitId 欠落のため ${droppedNoUnit}問を保存スキップ（unit_idにラベルを書かない安全策）`)
    }

    // ★選択肢が重複している問題はストックに保存しない（4択として不成立のため）。
    //   ただし表示は止めない（route.ts はこの関数の結果に依存せず全問返す）＝
    //   「保存スキップだがユーザーには出す」方針。
    //   比較は表示テキストを正規化（前後空白除去＋連続空白圧縮）して行い、表記の揺れではなく
    //   実質同一の選択肢だけを重複と判定する。
    const hasDuplicateChoices = (q: Question): boolean => {
        const norm = (s: string) => (s ?? '').replace(/\s+/g, ' ').trim()
        const seen = new Set<string>()
        for (const c of q.choices) {
            const key = norm(c.text)
            if (seen.has(key)) return true
            seen.add(key)
        }
        return false
    }
    const savable = withUnitId.filter((q) => !hasDuplicateChoices(q))
    const droppedDup = withUnitId.length - savable.length
    if (droppedDup > 0) {
        console.warn(`[stock] 選択肢重複のため ${droppedDup}問を保存スキップ（表示はする・ストックには入れない）`)
    }
    if (savable.length === 0) {
        console.warn('[stock] 保存対象が0問（全問 unitId 欠落の可能性）')
        return
    }

    const rows = savable.map((q) => {
        // 保存前クリーニング（DBに常にきれいなデータだけを入れる）:
        //  - 選択肢本文の先頭に紛れた番号プレフィックス（（１）①ア 1. 等）を剥がす
        //  - question に再掲された選択肢の列挙を、確定 choices と一致する行だけ安全に取り除く
        const cleanChoices = q.choices.map((c) => stripChoicePrefix(c.text))
        const cleanQuestion = stripEnumeratedChoicesFromQuestion(q.question, cleanChoices)
        return {
            subject_id: subjectId,
            unit_id: q.unitId,        // ★単元ID（ラベルではない）
            unit_label: q.unit,       // 表示用ラベル
            question: cleanQuestion,
            choices: cleanChoices,
            answer_index: q.choices.findIndex((c) => c.id === q.answer),
            explanation: q.explanation,
            keywords: q.keywords ?? [],
            source: 'user',
            // 基準年度（問題作成時に参照した最新資料の年度）。古くなった問題の精査・入替判断に使う。
            base_year: baseYear ?? null,
            // AI生成直後は未精査。将来の定期ストック整理（重複除去等）で kept/flagged/removed に更新する。
            review_status: 'unchecked',
        }
    })

    const { error } = await admin.from('questions').insert(rows)
    if (error) {
        console.error('[stock] 保存エラー', error.message)
    } else {
        console.log(`[stock] 保存成功 ${rows.length}問（subject=${subjectId}）`)
    }
}

/**
 * 全体の1日生成上限をチェックし、未超過なら1カウントして true を返す。
 * service_role が無い／エラー時は安全側に倒して true（生成を止めない）。
 * 端末ごとの回数制限は別途クライアント側(localStorage)で行う。
 *
 * Supabaseは全アプリ共通DBのため、集計を分けられるよう app='prim' を明示で渡す
 * （daily_usage.app に 'prim' として記録）。戻り値 count はその日の全アプリ合計で、
 * これを全体上限と比較する（同じGeminiキーDB＝同じ予算を共有するため合計で判定）。
 */
export async function checkAndIncrementDailyUsage(
    dailyLimit: number,
): Promise<{ allowed: boolean; count: number }> {
    const admin = getServiceClient()
    if (!admin) return { allowed: true, count: 0 }

    const { data, error } = await admin.rpc('increment_daily_usage', { p_app: 'prim' })
    if (error) {
        console.error('[stock] usageカウントエラー', error.message)
        return { allowed: true, count: 0 }
    }
    const count = data as number
    return { allowed: count <= dailyLimit, count }
}

/** 単元ごとのストック概数（10の位に丸めた「約○○問」表示用） */
export interface UnitStockCount {
    unitId: string
    approxCount: number   // 10の位に丸めた概数（例：87問→80）
}

/**
 * unit_stats（定期更新される集計テーブル）から、指定科目の単元別ストック概数を取得する。
 * 件数は10の位に丸めて「現在約○○問」として表示する。集計テーブルを読むだけなので軽い。
 */
export async function getUnitStockCounts(
    subjectId: string,
): Promise<Record<string, number>> {
    const supabase = getReadClient()
    if (!supabase) return {}
    const { data, error } = await supabase
        .from('unit_stats')
        .select('unit_id, question_count')
        .eq('subject_id', subjectId)

    if (error) {
        console.error('[stock] unit_stats取得エラー', error.message)
        return {}
    }

    const result: Record<string, number> = {}
    for (const row of data as { unit_id: string; question_count: number }[]) {
        // 10の位に丸める（端数切り捨て）。0問のときは0のまま。
        result[row.unit_id] = Math.floor(row.question_count / 10) * 10
    }
    return result
}