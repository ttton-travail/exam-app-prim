// ===========================
// 問題生成（マスタ → 4択）
// lib/quizgen.ts
//
// 小学生社会版：固定問題を持たず、マスタ（県・地方・区）から毎回4択を組む。
// 各 questionType ごとに「正解1 + ランダム誤答3」を作り、既存の Question 型で返す。
// → 出力は QuizScreen / ResultScreen をそのまま流用できる。
//
// 重要な原則：
//  ・特産品はりんご（青森・長野）等が複数県にまたがる。誤答候補は
//    「正解の集合と1つでも重複するもの」を必ず除外する（pickWrong の exclude）。
//  ・地図系の出題は question 文に mapNo を載せ、地図UI側が data-* でハイライトする。
//  ・answer は中身のID（位置ではない）。shuffle 後も正解判定がズレない。
// ===========================

import type {
    Question, Choice, ChoiceId, ChoiceRender, QuestionType,
    Prefecture, Region, Ward,
} from '@/types/quiz'
import { shuffle } from '@/lib/shuffle'

/** 表記モード（フリガナチップ3段階） */
export type KanaMode = 'grade4' | 'kanji' | 'ruby'

/** quizgen に渡すマスタ一式（データ源＝DB/seed は呼び出し側が決める） */
export interface QuizMasters {
    prefectures: Prefecture[]
    regions: Region[]
    wards: Ward[]
}

/** 1問を組み立てるための素材（正解テキスト・誤答テキスト群・問題文・付随メタ） */
interface BuildArgs {
    unitId: string
    unitLabel: string
    question: string
    correct: string
    wrongs: string[]
    explanation: string
    keywords: string[]
    /** 地図ハイライト用（任意）：対象の種類と番号。地図UIが使う。 */
    mapKind?: 'pref' | 'region' | 'ward' | 'pref-shape'
    mapNo?: number
    mapHighlight?: boolean
    showCapitals?: boolean
    /**
     * 選択肢を画像で出す出題（名前→県の形 等）のとき指定。
     *   choiceRender … 'pref-shape' | 'pref-map' | 'region-map' | 'ward-map'
     *   correctMapNo … 正解の対象番号
     *   wrongMapNos  … 誤答の対象番号（3件）
     *   correct/wrongs（テキスト）は結果画面・読み上げ用に併せて渡す（順番を合わせる）。
     */
    choiceRender?: ChoiceRender
    correctMapNo?: number
    wrongMapNos?: number[]
}

let __qid = 1
function nextId(): number {
    return __qid++
}

/** 素材から Question を作る（選択肢は後で shuffle される前提） */
function build(a: BuildArgs): Question {
    const render = a.choiceRender ?? 'text'
    let choices: Choice[]
    if (render !== 'text' && a.correctMapNo != null && a.wrongMapNos) {
        // 画像選択肢：text（名前）と mapNo（描画対象）をペアで持たせる。
        const texts = [a.correct, ...a.wrongs]
        const nos = [a.correctMapNo, ...a.wrongMapNos]
        choices = texts.map((text, i) => ({ id: i as ChoiceId, text, mapNo: nos[i] }))
    } else {
        const texts = [a.correct, ...a.wrongs]
        choices = texts.map((text, i) => ({ id: i as ChoiceId, text }))
    }
    return {
        id: nextId(),
        unit: a.unitLabel,
        unitId: a.unitId,
        question: a.question,
        choices,
        answer: 0 as ChoiceId,   // 正解は常に index0 の中身ID（= 0）。位置はshuffleで動く
        choiceRender: render,
        explanation: a.explanation,
        keywords: a.keywords,
        mapKind: a.mapKind,
        mapNo: a.mapNo,
        mapHighlight: a.mapHighlight,
        showCapitals: a.showCapitals,
    }
}

/**
 * 誤答を size 件、母集団 pool から選ぶ。
 * exclude に含まれる値は選ばない（重複・正解との衝突を防ぐ）。
 */
function pickWrong(pool: string[], exclude: Set<string>, size: number): string[] {
    const cand = shuffle(pool.filter((x) => !exclude.has(x)))
    return cand.slice(0, size)
}

/**
 * 画像選択肢用：母集団 pool（県/地方/区オブジェクト）から、excludeId を除いて size 件選ぶ。
 * mapNo と name の両方が要る画像選択肢のために、オブジェクトのまま返す。
 */
function pickWrongItems<T extends { id: string }>(pool: T[], excludeId: string, size: number): T[] {
    return shuffle(pool.filter((x) => x.id !== excludeId)).slice(0, size)
}

/** 特産品を「、」区切り1テキストに（将来 代表1品化するなら slice(0,1)）。 */
function specialtyText(p: Prefecture): string {
    return p.specialties.join('、')
}

/** 県の「県＋県庁」「県＋特産」等のセット表記。正しい組／誤った組を作る基礎。 */
function setText(parts: string[]): string {
    return parts.join(' - ')
}

/**
 * ダミー県庁所在地を作る。
 * 「県名 ≠ 県庁名」の県について、「[県名の頭]市」という“ひっかけ”を返す。
 *   例：愛知県 → 愛知市 ／ 神奈川県 → 神奈川市 ／ 青森県 → null（青森市が本物）
 * 県名そのまま＋市 が本物の県庁になる県（青森・千葉・京都市 など）は null。
 * ・このダミーは「その県自身」とのペアでのみ誤答に使う（他県とは組ませない）。
 */
function dummyCapital(p: Prefecture): string | null {
    // 県名から末尾の「都/道/府/県」を外した頭部
    const head = p.name.replace(/[都道府県]$/, '')
    const dummy = `${head}市`
    // 本物の県庁と一致するならダミーにならない
    return dummy === p.capital ? null : dummy
}

/** ダミー県庁を持つ県（県名≠県庁名）の一覧 */
function prefsWithDummy(prefs: Prefecture[]): Prefecture[] {
    return prefs.filter((p) => dummyCapital(p) !== null)
}

// ============================================================
// 組み合わせ問題の共通ジェネレータ
//   ・4択すべてが「県 - ○○」のペア。県も相手もランダムにバラける。
//   ・正解＝正しい組。誤答＝相手がその県のものではない“誤った組”。
//   ・県庁が絡む組では、誤答に必ず1つ「ダミーペア（ダミー元県 - その県のダミー県庁）」を入れる。
//     （ダミーは正解の県と無関係でよい。例：正解が岐阜県-岐阜市でも 愛知県-愛知市 を入れてよい）
// ============================================================

/** ペアの種類：県庁を相手にするか／特産品を相手にするか／両方か。 */
type PairKind = 'capital' | 'specialty' | 'capital_specialty'

/** 1つの県から、その種類の「正しい相手テキスト」を作る。 */
function rightPartner(p: Prefecture, kind: PairKind): string {
    if (kind === 'capital') return p.capital
    if (kind === 'specialty') return specialtyText(p)
    return `${p.capital} - ${specialtyText(p)}`
}

/** 県名（または地図番号）を左側ラベルにする。地図モードなら「【n】」表記。 */
function leftLabel(p: Prefecture, useMap: boolean): string {
    // 地図モードでも県名を併記する（「地図 - 県 - ○○」の“県”が欠落しないように）。
    //   useMap=true  → 「【23】愛知県」
    //   useMap=false → 「愛知県」
    return useMap ? `【${p.mapNo}】${p.name}` : p.name
}

/**
 * 組み合わせ4択を作る。
 *   correctP … 正解の県（左側）
 *   kind     … 相手の種類
 *   useMap   … 左ラベルを地図番号にするか
 * 戻り値：correct/wrongs（setText 済み文字列）
 */
function buildPairChoices(
    correctP: Prefecture,
    kind: PairKind,
    useMap: boolean,
    prefectures: Prefecture[],
): { correct: string; wrongs: string[] } {
    const correct = setText([leftLabel(correctP, useMap), rightPartner(correctP, kind)])
    const used = new Set<string>([correct])
    const wrongs: string[] = []

    const involvesCapital = (kind === 'capital' || kind === 'capital_specialty')

    // ① 県庁が絡むなら、誤答1枠を必ずダミーペアにする。
    if (involvesCapital) {
        const dummyPrefs = shuffle(prefsWithDummy(prefectures))
        for (const dp of dummyPrefs) {
            const dummy = dummyCapital(dp)
            if (!dummy) continue
            const partner = kind === 'capital_specialty'
                ? `${dummy} - ${specialtyText(dp)}`
                : dummy
            const text = setText([leftLabel(dp, useMap), partner])
            if (used.has(text)) continue
            wrongs.push(text)
            used.add(text)
            break
        }
    }

    // ② 残りの誤答：県も相手もランダム。ただし“正しい組”にはしない。
    const pool = shuffle(prefectures)
    let gi = 0
    while (wrongs.length < 3 && gi < pool.length * 6) {
        const lp = pool[gi % pool.length]
        const rp = pool[(gi * 7 + 3) % pool.length]
        gi++
        if (lp.id === rp.id) continue            // 同じ県＝正しい組なので不可
        const partner = rightPartner(rp, kind)
        if (kind === 'specialty') {
            const lset = new Set(lp.specialties)
            if (rp.specialties.some((s) => lset.has(s))) continue  // 特産品が左の県とも一致＝正解化
        }
        if (involvesCapital && partner.startsWith(lp.capital)) continue  // 県庁が左の県の正解
        const text = setText([leftLabel(lp, useMap), partner])
        if (used.has(text)) continue
        wrongs.push(text)
        used.add(text)
    }

    return { correct, wrongs: wrongs.slice(0, 3) }
}

// ============================================================
// メイン：questionType と問題数から Question[] を生成
// マスタ（県・地方・区）は引数で受け取る純関数。データ源は知らない。
// ============================================================
export function generateQuestions(
    questionType: QuestionType,
    unitId: string,
    unitLabel: string,
    count: number,
    masters: QuizMasters,
): Question[] {
    const PREFECTURES = masters.prefectures
    const REGIONS = masters.regions
    const WARDS = masters.wards

    // 「すべての◯◯」基準（数が決まっているもの）。limit が大きければ全件。
    const takePrefs = (limit: number): Prefecture[] =>
        shuffle(PREFECTURES).slice(0, Math.min(limit, PREFECTURES.length))
    const takeRegions = (limit: number): Region[] =>
        shuffle(REGIONS).slice(0, Math.min(limit, REGIONS.length))
    const takeWards = (limit: number): Ward[] =>
        shuffle(WARDS).slice(0, Math.min(limit, WARDS.length))

    const prefName = (p: Prefecture) => p.name
    const regionById = (id: string) => REGIONS.find((r) => r.id === id)!

    const out: Question[] = []
    const allPrefNames = PREFECTURES.map(prefName)
    const allCapitals = PREFECTURES.map((p) => p.capital)
    const allRegionNames = REGIONS.map((r) => r.name)
    const allWardNames = WARDS.map((w) => w.name)

    switch (questionType) {

        case 'pref_map_to_name': {
            for (const p of takePrefs(count)) {
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の【${p.mapNo}】の都道府県はどれでしょう？`,
                    correct: p.name,
                    wrongs: pickWrong(allPrefNames, new Set([p.name]), 3),
                    explanation: `地図の${p.mapNo}番は「${p.name}」です。`,
                    keywords: [p.name, p.nameKana],
                    mapKind: 'pref', mapNo: p.mapNo,
                    mapHighlight: true,
                }))
            }
            break
        }

        case 'pref_name_to_map': {
            // 「○○県はどれでしょう？」→ 日本地図を4枚並べ、各枚で1県だけ強調。
            for (const p of takePrefs(count)) {
                const wrongs = pickWrongItems(PREFECTURES, p.id, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」はどれでしょう？`,
                    correct: p.name,
                    wrongs: wrongs.map((x) => x.name),
                    explanation: `「${p.name}」は地図の${p.mapNo}番の場所です。`,
                    keywords: [p.name, p.nameKana],
                    choiceRender: 'pref-map',
                    correctMapNo: p.mapNo,
                    wrongMapNos: wrongs.map((x) => x.mapNo),
                }))
            }
            break
        }

        case 'pref_shape_to_name': {
            // 県の形（個別SVG）→ 県名。地図種別 'pref-shape' で対象県の形だけを表示する。
            for (const p of takePrefs(count)) {
                out.push(build({
                    unitId, unitLabel,
                    question: `この形の都道府県はどれでしょう？`,
                    correct: p.name,
                    wrongs: pickWrong(allPrefNames, new Set([p.name]), 3),
                    explanation: `この形は「${p.name}」です。`,
                    keywords: [p.name, p.nameKana],
                    mapKind: 'pref-shape', mapNo: p.mapNo,
                    mapHighlight: true,
                }))
            }
            break
        }

        case 'pref_name_to_shape': {
            // 「○○県はどれでしょう？」→ 各県の形SVGを4枚並べる。
            for (const p of takePrefs(count)) {
                const wrongs = pickWrongItems(PREFECTURES, p.id, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」の形はどれでしょう？`,
                    correct: p.name,
                    wrongs: wrongs.map((x) => x.name),
                    explanation: `これが「${p.name}」の形です。`,
                    keywords: [p.name, p.nameKana],
                    choiceRender: 'pref-shape',
                    correctMapNo: p.mapNo,
                    wrongMapNos: wrongs.map((x) => x.mapNo),
                }))
            }
            break
        }

        case 'capital_map_to_name': {
            for (const p of takePrefs(count)) {
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の【${p.mapNo}】の県庁所在地はどれでしょう？`,
                    correct: p.capital,
                    wrongs: pickWrong(allCapitals, new Set([p.capital]), 3),
                    explanation: `地図${p.mapNo}番は「${p.name}」、県庁所在地は「${p.capital}」です。`,
                    keywords: [p.name, p.capital, p.capitalKana],
                    showCapitals: true,
                    mapKind: 'pref', mapNo: p.mapNo,
                    mapHighlight: true,
                }))
            }
            break
        }

        case 'pref_to_capital': {
            for (const p of takePrefs(count)) {
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」の県庁所在地はどれでしょう？`,
                    correct: p.capital,
                    wrongs: pickWrong(allCapitals, new Set([p.capital]), 3),
                    explanation: `「${p.name}」の県庁所在地は「${p.capital}」です。`,
                    keywords: [p.name, p.capital, p.capitalKana],
                    showCapitals: true,
                }))
            }
            break
        }

        case 'capital_name_to_map': {
            // 「[県庁]のある県はどれでしょう？」→ 日本地図を4枚、各枚で1県だけ強調。
            for (const p of takePrefs(count)) {
                const wrongs = pickWrongItems(PREFECTURES, p.id, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.capital}」のある県はどれでしょう？`,
                    correct: p.name,
                    wrongs: wrongs.map((x) => x.name),
                    explanation: `県庁所在地「${p.capital}」は「${p.name}」、地図の${p.mapNo}番の場所です。`,
                    keywords: [p.capital, p.name, p.capitalKana],
                    choiceRender: 'pref-map',
                    correctMapNo: p.mapNo,
                    wrongMapNos: wrongs.map((x) => x.mapNo),
                }))
            }
            break
        }

        case 'shape_to_capital': {
            // 県の形（個別SVG）→ その県の県庁所在地を当てる。
            for (const p of takePrefs(count)) {
                out.push(build({
                    unitId, unitLabel,
                    question: `この形の都道府県の県庁所在地はどれでしょう？`,
                    correct: p.capital,
                    wrongs: pickWrong(allCapitals, new Set([p.capital]), 3),
                    explanation: `この形は「${p.name}」、県庁所在地は「${p.capital}」です。`,
                    keywords: [p.name, p.capital, p.capitalKana],
                    showCapitals: true,
                    mapKind: 'pref-shape', mapNo: p.mapNo,
                }))
            }
            break
        }

        case 'capital_to_shape': {
            // 「[県庁]のある県の形はどれでしょう？」→ 各県の形SVGを4枚並べる。
            for (const p of takePrefs(count)) {
                const wrongs = pickWrongItems(PREFECTURES, p.id, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.capital}」のある県の形はどれでしょう？`,
                    correct: p.name,
                    wrongs: wrongs.map((x) => x.name),
                    explanation: `県庁所在地「${p.capital}」は「${p.name}」。これがその形です。`,
                    keywords: [p.capital, p.name, p.capitalKana],
                    choiceRender: 'pref-shape',
                    correctMapNo: p.mapNo,
                    wrongMapNos: wrongs.map((x) => x.mapNo),
                }))
            }
            break
        }

        case 'pref_capital_set': {
            // 4択すべて「県 - 県庁」。県も県庁もランダム。誤答に必ずダミーペア1つ。
            for (const p of takePrefs(count)) {
                const { correct, wrongs } = buildPairChoices(p, 'capital', false, PREFECTURES)
                out.push(build({
                    unitId, unitLabel,
                    question: `県と県庁所在地の正しい組み合わせはどれでしょう？`,
                    correct,
                    wrongs,
                    explanation: `正しい組み合わせは「${p.name} - ${p.capital}」です。`,
                    keywords: [p.name, p.capital],
                    showCapitals: true,
                }))
            }
            break
        }

        case 'pref_map_capital_set': {
            // 左ラベルを地図番号にして、地図 - 県庁 のペアをランダム化。誤答に必ずダミー。
            for (const p of takePrefs(count)) {
                const { correct, wrongs } = buildPairChoices(p, 'capital', true, PREFECTURES)
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の番号と県庁所在地の正しい組み合わせはどれでしょう？`,
                    correct,
                    wrongs,
                    explanation: `地図${p.mapNo}番は「${p.name}」、県庁所在地は「${p.capital}」です。`,
                    keywords: [p.name, p.capital],
                    showCapitals: true,
                    mapKind: 'pref', mapNo: p.mapNo,
                    mapHighlight: false,
                }))
            }
            break
        }

        case 'pref_to_specialty': {
            for (const p of takePrefs(count)) {
                const correct = specialtyText(p)
                // 誤答候補から「正解の特産品と1つでも重複する県」を除外
                const correctSet = new Set(p.specialties)
                const wrongPool = PREFECTURES
                    .filter((x) => x.id !== p.id && !x.specialties.some((s) => correctSet.has(s)))
                    .map(specialtyText)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」の特産品はどれでしょう？`,
                    correct,
                    wrongs: pickWrong(wrongPool, new Set([correct]), 3),
                    explanation: `「${p.name}」の特産品は「${correct}」などです。`,
                    keywords: [p.name, ...p.specialties],
                }))
            }
            break
        }

        case 'specialty_map_to_name': {
            // 地図（番号）→ 特産品。対象県を地図で強調し、その特産品を当てる。
            for (const p of takePrefs(count)) {
                const correct = specialtyText(p)
                const correctSet = new Set(p.specialties)
                const wrongPool = PREFECTURES
                    .filter((x) => x.id !== p.id && !x.specialties.some((s) => correctSet.has(s)))
                    .map(specialtyText)
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の【${p.mapNo}】の都道府県の特産品はどれでしょう？`,
                    correct,
                    wrongs: pickWrong(wrongPool, new Set([correct]), 3),
                    explanation: `地図${p.mapNo}番「${p.name}」の特産品は「${correct}」などです。`,
                    keywords: [p.name, ...p.specialties],
                    mapKind: 'pref', mapNo: p.mapNo,
                    mapHighlight: true,
                }))
            }
            break
        }

        case 'pref_specialty_set': {
            // 4択すべて「県 - 特産品」。県も特産品もランダム。正しい組にならない誤答3つ。
            for (const p of takePrefs(count)) {
                const { correct, wrongs } = buildPairChoices(p, 'specialty', false, PREFECTURES)
                out.push(build({
                    unitId, unitLabel,
                    question: `県と特産品の正しい組み合わせはどれでしょう？`,
                    correct,
                    wrongs,
                    explanation: `「${p.name}」の特産品は「${specialtyText(p)}」です。`,
                    keywords: [p.name, ...p.specialties],
                }))
            }
            break
        }

        case 'pref_map_specialty_set': {
            for (const p of takePrefs(count)) {
                const { correct, wrongs } = buildPairChoices(p, 'specialty', true, PREFECTURES)
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の番号と特産品の正しい組み合わせはどれでしょう？`,
                    correct,
                    wrongs,
                    explanation: `地図${p.mapNo}番「${p.name}」の特産品は「${specialtyText(p)}」です。`,
                    keywords: [p.name, ...p.specialties],
                    mapKind: 'pref', mapNo: p.mapNo,
                    mapHighlight: false,
                }))
            }
            break
        }

        case 'pref_capital_specialty_set': {
            // 「県 - 県庁 - 特産品」。県庁が絡むので誤答に必ずダミーペア。
            for (const p of takePrefs(count)) {
                const { correct, wrongs } = buildPairChoices(p, 'capital_specialty', false, PREFECTURES)
                out.push(build({
                    unitId, unitLabel,
                    question: `県・県庁所在地・特産品の正しい組み合わせはどれでしょう？`,
                    correct,
                    wrongs,
                    explanation: `「${p.name}」 - 県庁所在地「${p.capital}」 - 特産品「${specialtyText(p)}」です。`,
                    keywords: [p.name, p.capital, ...p.specialties],
                    showCapitals: true,
                }))
            }
            break
        }

        case 'pref_map_capital_specialty_set': {
            for (const p of takePrefs(count)) {
                const { correct, wrongs } = buildPairChoices(p, 'capital_specialty', true, PREFECTURES)
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の番号・県庁所在地・特産品の正しい組み合わせはどれでしょう？`,
                    correct,
                    wrongs,
                    explanation: `地図${p.mapNo}番「${p.name}」 - 県庁所在地「${p.capital}」 - 特産品「${specialtyText(p)}」です。`,
                    keywords: [p.name, p.capital, ...p.specialties],
                    showCapitals: true,
                    mapKind: 'pref', mapNo: p.mapNo,
                    mapHighlight: false,
                }))
            }
            break
        }

        case 'region_map_to_name': {
            for (const r of takeRegions(count)) {
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の【${r.mapNo}】の地方はどれでしょう？`,
                    correct: r.name,
                    wrongs: pickWrong(allRegionNames, new Set([r.name]), 3),
                    explanation: `地図の${r.mapNo}番の地方は「${r.name}」です。`,
                    keywords: [r.name, r.nameKana],
                    mapKind: 'region', mapNo: r.mapNo,
                    mapHighlight: true,
                }))
            }
            break
        }

        case 'region_name_to_map': {
            // 「○○地方はどれでしょう？」→ 地方地図を4枚、各枚で1地方だけ強調。
            for (const r of takeRegions(count)) {
                const wrongs = pickWrongItems(REGIONS, r.id, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${r.name}」はどれでしょう？`,
                    correct: r.name,
                    wrongs: wrongs.map((x) => x.name),
                    explanation: `「${r.name}」は地図の${r.mapNo}番の場所です。`,
                    keywords: [r.name, r.nameKana],
                    choiceRender: 'region-map',
                    correctMapNo: r.mapNo ?? 0,
                    wrongMapNos: wrongs.map((x) => x.mapNo ?? 0),
                }))
            }
            break
        }

        case 'region_to_pref': {
            // 地方 → その地方に属する県（正解1）＋他地方の県（誤答3）
            for (const r of takeRegions(count)) {
                const inRegion = PREFECTURES.filter((p) => p.regionId === r.id)
                const correctP = shuffle(inRegion)[0]
                const outRegion = PREFECTURES.filter((p) => p.regionId !== r.id).map(prefName)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${r.name}」にある都道府県はどれでしょう？`,
                    correct: correctP.name,
                    wrongs: pickWrong(outRegion, new Set([correctP.name]), 3),
                    explanation: `「${correctP.name}」は「${r.name}」にあります。`,
                    keywords: [r.name, correctP.name],
                }))
            }
            break
        }

        case 'pref_to_region': {
            for (const p of takePrefs(count)) {
                const r = regionById(p.regionId)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」は何地方でしょう？`,
                    correct: r.name,
                    wrongs: pickWrong(allRegionNames, new Set([r.name]), 3),
                    explanation: `「${p.name}」は「${r.name}」にあります。`,
                    keywords: [p.name, r.name],
                }))
            }
            break
        }

        case 'ward_map_to_name': {
            for (const w of takeWards(count)) {
                out.push(build({
                    unitId, unitLabel,
                    question: `東京23区の地図【${w.mapNo}】はどの区でしょう？`,
                    correct: w.name,
                    wrongs: pickWrong(allWardNames, new Set([w.name]), 3),
                    explanation: `地図${w.mapNo}番は「${w.name}」です。`,
                    keywords: [w.name, w.nameKana],
                    mapKind: 'ward', mapNo: w.mapNo,
                    mapHighlight: true,
                }))
            }
            break
        }

        case 'ward_name_to_map': {
            // 「○○区はどれでしょう？」→ 23区地図を4枚、各枚で1区だけ強調。
            for (const w of takeWards(count)) {
                const wrongs = pickWrongItems(WARDS, w.id, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${w.name}」はどれでしょう？`,
                    correct: w.name,
                    wrongs: wrongs.map((x) => x.name),
                    explanation: `「${w.name}」は地図の${w.mapNo}番の場所です。`,
                    keywords: [w.name, w.nameKana],
                    choiceRender: 'ward-map',
                    correctMapNo: w.mapNo,
                    wrongMapNos: wrongs.map((x) => x.mapNo),
                }))
            }
            break
        }
    }

    return out
}