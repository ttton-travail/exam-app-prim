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
    Question, Choice, ChoiceId, QuestionType,
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
    mapKind?: 'pref' | 'region' | 'ward'
    mapNo?: number
}

let __qid = 1
function nextId(): number {
    return __qid++
}

/** 素材から Question を作る（選択肢は後で shuffle される前提） */
function build(a: BuildArgs): Question {
    const texts = [a.correct, ...a.wrongs]
    const choices: Choice[] = texts.map((text, i) => ({ id: i as ChoiceId, text }))
    return {
        id: nextId(),
        unit: a.unitLabel,
        unitId: a.unitId,
        question: a.question,
        choices,
        answer: 0 as ChoiceId,   // 正解は常に index0 の中身ID（= 0）。位置はshuffleで動く
        explanation: a.explanation,
        keywords: a.keywords,
        mapKind: a.mapKind,
        mapNo: a.mapNo,
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

/** 特産品を「、」区切り1テキストに（将来 代表1品化するなら slice(0,1)）。 */
function specialtyText(p: Prefecture): string {
    return p.specialties.join('、')
}

/** 県の「県＋県庁」「県＋特産」等のセット表記。正しい組／誤った組を作る基礎。 */
function setText(parts: string[]): string {
    return parts.join(' ＝ ')
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
                }))
            }
            break
        }

        case 'pref_name_to_map': {
            for (const p of takePrefs(count)) {
                const wrongNos = pickWrong(
                    PREFECTURES.map((x) => String(x.mapNo)),
                    new Set([String(p.mapNo)]), 3,
                )
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」は地図のどの番号でしょう？`,
                    correct: `${p.mapNo}番`,
                    wrongs: wrongNos.map((n) => `${n}番`),
                    explanation: `「${p.name}」は地図の${p.mapNo}番です。`,
                    keywords: [p.name, p.nameKana],
                    mapKind: 'pref', mapNo: p.mapNo,
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
                    mapKind: 'pref', mapNo: p.mapNo,
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
                }))
            }
            break
        }

        case 'pref_capital_set': {
            // 正しい「県＝県庁」の組を1つ、誤った組を3つ（県は正解と同じ、県庁を他県のものに）
            for (const p of takePrefs(count)) {
                const wrongCaps = pickWrong(allCapitals, new Set([p.capital]), 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」と県庁所在地の正しい組み合わせはどれでしょう？`,
                    correct: setText([p.name, p.capital]),
                    wrongs: wrongCaps.map((c) => setText([p.name, c])),
                    explanation: `正しい組み合わせは「${p.name} ＝ ${p.capital}」です。`,
                    keywords: [p.name, p.capital],
                }))
            }
            break
        }

        case 'pref_map_capital_set': {
            for (const p of takePrefs(count)) {
                const wrongCaps = pickWrong(allCapitals, new Set([p.capital]), 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の【${p.mapNo}】の県と県庁所在地の正しい組み合わせはどれでしょう？`,
                    correct: setText([p.name, p.capital]),
                    wrongs: wrongCaps.map((c) => setText([p.name, c])),
                    explanation: `地図${p.mapNo}番は「${p.name}」、県庁所在地は「${p.capital}」です。`,
                    keywords: [p.name, p.capital],
                    mapKind: 'pref', mapNo: p.mapNo,
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

        case 'pref_specialty_set': {
            for (const p of takePrefs(count)) {
                const correctSet = new Set(p.specialties)
                const wrongPrefs = shuffle(
                    PREFECTURES.filter((x) => x.id !== p.id && !x.specialties.some((s) => correctSet.has(s))),
                ).slice(0, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」と特産品の正しい組み合わせはどれでしょう？`,
                    correct: setText([p.name, specialtyText(p)]),
                    wrongs: wrongPrefs.map((x) => setText([p.name, specialtyText(x)])),
                    explanation: `「${p.name}」の特産品は「${specialtyText(p)}」です。`,
                    keywords: [p.name, ...p.specialties],
                }))
            }
            break
        }

        case 'pref_map_specialty_set': {
            for (const p of takePrefs(count)) {
                const correctSet = new Set(p.specialties)
                const wrongPrefs = shuffle(
                    PREFECTURES.filter((x) => x.id !== p.id && !x.specialties.some((s) => correctSet.has(s))),
                ).slice(0, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の【${p.mapNo}】の県と特産品の正しい組み合わせはどれでしょう？`,
                    correct: setText([p.name, specialtyText(p)]),
                    wrongs: wrongPrefs.map((x) => setText([p.name, specialtyText(x)])),
                    explanation: `地図${p.mapNo}番「${p.name}」の特産品は「${specialtyText(p)}」です。`,
                    keywords: [p.name, ...p.specialties],
                    mapKind: 'pref', mapNo: p.mapNo,
                }))
            }
            break
        }

        case 'pref_capital_specialty_set': {
            for (const p of takePrefs(count)) {
                const correctSet = new Set(p.specialties)
                const wrongPrefs = shuffle(
                    PREFECTURES.filter((x) => x.id !== p.id
                        && x.capital !== p.capital
                        && !x.specialties.some((s) => correctSet.has(s))),
                ).slice(0, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `「${p.name}」の県庁所在地と特産品の正しい組み合わせはどれでしょう？`,
                    correct: setText([p.name, p.capital, specialtyText(p)]),
                    wrongs: wrongPrefs.map((x) => setText([p.name, x.capital, specialtyText(x)])),
                    explanation: `「${p.name}」＝県庁所在地「${p.capital}」、特産品「${specialtyText(p)}」です。`,
                    keywords: [p.name, p.capital, ...p.specialties],
                }))
            }
            break
        }

        case 'pref_map_capital_specialty_set': {
            for (const p of takePrefs(count)) {
                const correctSet = new Set(p.specialties)
                const wrongPrefs = shuffle(
                    PREFECTURES.filter((x) => x.id !== p.id
                        && x.capital !== p.capital
                        && !x.specialties.some((s) => correctSet.has(s))),
                ).slice(0, 3)
                out.push(build({
                    unitId, unitLabel,
                    question: `地図の【${p.mapNo}】の県・県庁所在地・特産品の正しい組み合わせはどれでしょう？`,
                    correct: setText([p.name, p.capital, specialtyText(p)]),
                    wrongs: wrongPrefs.map((x) => setText([p.name, x.capital, specialtyText(x)])),
                    explanation: `地図${p.mapNo}番「${p.name}」＝県庁所在地「${p.capital}」、特産品「${specialtyText(p)}」です。`,
                    keywords: [p.name, p.capital, ...p.specialties],
                    mapKind: 'pref', mapNo: p.mapNo,
                }))
            }
            break
        }

        case 'region_map_to_name': {
            for (const r of takeRegions(count)) {
                out.push(build({
                    unitId, unitLabel,
                    question: `地図で色のついた地方はどれでしょう？`,
                    correct: r.name,
                    wrongs: pickWrong(allRegionNames, new Set([r.name]), 3),
                    explanation: `色のついた地方は「${r.name}」です。`,
                    keywords: [r.name, r.nameKana],
                    mapKind: 'region', mapNo: r.mapNo,
                }))
            }
            break
        }

        case 'region_name_to_map': {
            for (const r of takeRegions(count)) {
                const wrongNos = pickWrong(
                    REGIONS.map((x) => String(x.mapNo ?? 0)),
                    new Set([String(r.mapNo ?? 0)]), 3,
                )
                out.push(build({
                    unitId, unitLabel,
                    question: `「${r.name}」は地図のどこでしょう？`,
                    correct: `${r.mapNo}番`,
                    wrongs: wrongNos.map((n) => `${n}番`),
                    explanation: `「${r.name}」は地図の${r.mapNo}番です。`,
                    keywords: [r.name, r.nameKana],
                    mapKind: 'region', mapNo: r.mapNo,
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
                }))
            }
            break
        }

        case 'ward_name_to_map': {
            for (const w of takeWards(count)) {
                const wrongNos = pickWrong(
                    WARDS.map((x) => String(x.mapNo)),
                    new Set([String(w.mapNo)]), 3,
                )
                out.push(build({
                    unitId, unitLabel,
                    question: `「${w.name}」は地図のどの番号でしょう？`,
                    correct: `${w.mapNo}番`,
                    wrongs: wrongNos.map((n) => `${n}番`),
                    explanation: `「${w.name}」は地図の${w.mapNo}番です。`,
                    keywords: [w.name, w.nameKana],
                    mapKind: 'ward', mapNo: w.mapNo,
                }))
            }
            break
        }
    }

    return out
}