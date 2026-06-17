// ===========================
// 問題生成 APIエンドポイント
// app/api/generate/route.ts
//
// 配信ロジック：
//  1) ストック（Supabase）から条件に合う問題をランダム取得
//  2) 足りなければ、不足分だけ全体上限を確認のうえ Lite で新規生成
//  3) 生成分はストックへ保存（次回以降の再利用でコスト逓減）
//  4) ストックと生成分を結合して返す
// ===========================

import { NextRequest, NextResponse } from 'next/server'
import { generateQuiz } from '@/lib/gemini'
import { buildPrompt, DEFAULT_EXAM_FORMAT } from '@/lib/prompts'
import { SUBJECTS } from '@/lib/subjects'
import {
    saveQuestionsToStock,
    checkAndIncrementDailyUsage,
} from '@/lib/stock'
import { getMasterData } from '@/lib/master'
import { generateQuestions } from '@/lib/quizgen'
import { shuffleQuiz } from '@/lib/shuffle'
import { DAILY_GEN_LIMIT_GLOBAL, ALL_COUNT, ALL_COUNT_CAP } from '@/lib/config'
import type { QuizSettings, Question } from '@/types/quiz'

const log = (stage: string, data?: unknown) =>
    console.log(`[api/generate] ${stage}`, data ?? '')

export async function POST(req: NextRequest) {
    log('リクエスト受信', { SITE_MODE: process.env.SITE_MODE ?? '(未設定)' })

    try {
        const settings: QuizSettings & { mode?: 'stock' | 'generate' } = await req.json()
        log('設定値', settings)

        // ユーザーが選んだモードを尊重する（既定は 'stock'）。
        //   'stock'    … 用意済みストックから出題（AI生成しない）
        //   'generate' … AIで新規生成（ストックは使わず、最初からプロンプト生成）
        const mode: 'stock' | 'generate' = settings.mode === 'generate' ? 'generate' : 'stock'

        const subject = SUBJECTS.find((s) => s.id === settings.subjectId)
        if (!subject) {
            return NextResponse.json(
                { error: `科目が見つかりません: ${settings.subjectId}` },
                { status: 400 },
            )
        }

        // 「すべての◯◯」(ALL_COUNT) のときは上限いっぱい（県47/区23/地方8を全てカバー）。
        const need = settings.questionCount === ALL_COUNT
            ? ALL_COUNT_CAP
            : settings.questionCount
        let questions: Question[] = []

        // ============================================================
        // モード別の出題ロジック
        // ============================================================

        if (mode === 'stock') {
            // 【マスタ生成モード（小学生社会版の主経路）】
            //   固定問題を持たず、DBのマスタ（県・地方・区）から quizgen が毎回4択を組む。
            //   DB未接続・失敗時は getMasterData が seed にフォールバックする。
            const masters = await getMasterData()

            // 対象単元（id＋label＋questionType）。未指定なら科目の全単元。
            const targetUnits =
                settings.unitIds.length > 0
                    ? subject.units.filter((u) => settings.unitIds.includes(u.id))
                    : subject.units

            // 各単元の出題形式で生成し、結合してから need 問だけ取り出す。
            //   単元が複数あるときは均等めに（端数は先頭単元へ）割り振る。
            const usable = targetUnits.filter((u) => !!u.questionType)
            if (usable.length === 0) {
                return NextResponse.json(
                    { error: '出題できる単元がありません。単元を選び直してください。' },
                    { status: 400 },
                )
            }
            const perUnit = Math.ceil(need / usable.length)
            let pool: Question[] = []
            for (const u of usable) {
                pool = pool.concat(
                    generateQuestions(u.questionType!, u.id, u.label, perUnit, masters),
                )
            }
            // 全体をシャッフルして need 問に切り、id を 1..N に振り直す。
            questions = shuffleQuiz(pool)
                .slice(0, need)
                .map((q, i) => ({ ...q, id: i + 1 }))
            log('マスタ生成モード：作成', { got: questions.length, need })

            if (questions.length === 0) {
                return NextResponse.json(
                    {
                        error:
                            '問題を作成できませんでした。科目・単元を変えてお試しください。',
                    },
                    { status: 404 },
                )
            }

            return NextResponse.json({
                questions,
                partial: questions.length < need,
            })
        }

        // 【AI生成モード】ストックは使わず、最初からプロンプトで新規生成する。
        log('AI生成モード')

        // 審査モード（SITE_MODE=review）では新規AI生成を停止する。
        if (process.env.SITE_MODE === 'review') {
            log('reviewモード：AI生成を停止')
            return NextResponse.json(
                {
                    error:
                        '現在、新規の問題作成は一時的にお休みしています。「用意済みの問題から出題」をご利用ください。',
                },
                { status: 503 },
            )
        }

        // 全体の1日上限をチェック
        const usage = await checkAndIncrementDailyUsage(DAILY_GEN_LIMIT_GLOBAL)
        if (!usage.allowed) {
            log('全体上限に到達', usage)
            return NextResponse.json(
                {
                    error:
                        '本日の生成上限に達しました。時間をおいて、用意済みの問題からお試しください。',
                },
                { status: 429 },
            )
        }

        // プロンプトに渡す対象単元（id＋label）。単元未指定なら科目の全単元を対象にする。
        const targetUnits =
            settings.unitIds.length > 0
                ? subject.units.filter((u) => settings.unitIds.includes(u.id))
                : subject.units

        const prompt = buildPrompt(
            settings.examFormat ?? DEFAULT_EXAM_FORMAT,
            subject.label,
            targetUnits.map((u) => ({ id: u.id, label: u.label })),
            need,
        )
        log('新規生成', { need })

        const generated = await generateQuiz(prompt)

        // ★方式B：AIが各問に返した unitId を正として採用する（ラベル照合をしない）。
        //   ただしAIが誤ったidや表記ゆれを返す可能性に備え、必ず検証する：
        //     1) 単元が1つだけ選ばれていれば、その1つで確定（AIの値は使わない＝最も安全）
        //     2) 複数指定/未指定なら、AIの unitId が「科目の正規のid集合」に一致するものだけ採用
        //   採用できた unitId からは、表示ラベル(unit_label)も科目定義側から確定で引き直す
        //   （AIの自由テキストを表示・保存に使わない）。
        const idToLabel = new Map(subject.units.map((u) => [u.id, u.label]))
        const validIds = new Set(subject.units.map((u) => u.id))
        const soleUnitId = settings.unitIds.length === 1 ? settings.unitIds[0] : undefined

        const unresolved: string[] = []
        const generatedWithIds: Question[] = generated.questions.map((q) => {
            // 1) 単一単元なら確定。2) それ以外はAIのunitIdを検証して採用。
            const aiId = typeof q.unitId === 'string' ? q.unitId.trim() : ''
            const unitId = soleUnitId ?? (validIds.has(aiId) ? aiId : undefined)
            // 表示ラベルは id から正引き（無ければAIのunit予備、それも無ければ空）。
            const unit = unitId ? (idToLabel.get(unitId) ?? q.unit ?? '') : (q.unit ?? '')
            if (!unitId) unresolved.push(aiId || '(空)')
            return { ...q, unitId, unit }
        })
        if (unresolved.length > 0) {
            // AIが正規id以外を返したケース。idは短い固定文字列なので通常はほぼ起きない。
            // 出たら対応表の提示方法かプロンプトの見直しで根治できる。
            log('unitId未解決（AIが正規id以外を返した）', {
                count: unresolved.length,
                got: unresolved,
                validIds: [...validIds],
            })
        }

        // 生成分をストックへ保存する。
        //   ★必ず await する。Vercel等のサーバーレスでは、レスポンスを返した瞬間に
        //     関数の実行が凍結/終了することがあり、await しない（投げっぱなしの）保存は
        //     insert 完了前にプロセスが終わって「保存されない」事故になる
        //     （ローカルの常駐Nodeでは最後まで走るため、ローカルだけ保存される症状になる）。
        //   保存は失敗してもユーザー応答は止めない（中で握りつぶしてログのみ）。
        await saveQuestionsToStock(settings.subjectId, generatedWithIds)

        // idを1..Nに振り直して返す
        const renumbered = generatedWithIds
            .slice(0, need)
            .map((q, i) => ({ ...q, id: i + 1 }))

        log('AI生成モード：返却', { count: renumbered.length })
        return NextResponse.json({ questions: renumbered })

    } catch (error) {
        log('エラー', error)
        return NextResponse.json(
            { error: '問題の生成に失敗しました。もう一度お試しください。' },
            { status: 500 },
        )
    }
}