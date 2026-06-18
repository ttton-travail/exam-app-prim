// ===========================
// 型定義
// quiz.ts
// ===========================

import type { ExamFormat } from '@/lib/prompts'

/**
 * 選択肢の不変ID。
 * 表示キー（A/B/C/D）とは無関係の、中身を識別するためだけの値。
 * 並び替えても各選択肢に付いて回るので、シャッフルしても正解判定がズレない。
 */
export type ChoiceId = number

/** 1つの選択肢（表示キー文字は持たない。キーは描画時に位置から振る） */
export interface Choice {
    id: ChoiceId
    text: string
}

/** 1問の問題 */
export interface Question {
    id: number
    unit: string        // 表示用の単元ラベル（例：遺伝子とその働き）
    unitId?: string     // 単元ID（例：bio_base_02）。ストック保存・検索の正はこちら。
                        // 生成直後に route.ts で付与する。ストック由来なら DB の unit_id が入る。
    question: string
    choices: Choice[]   // 配列の並び順 = 画面の表示順
    answer: ChoiceId    // 正解の「中身のID」。位置ではない
    explanation: string
    keywords: string[]  // 復習の手がかり。回答時に「キーワード：〜」で表示
    /**
     * 地図ハイライト用メタ（小学生社会版）。地図出題のときだけ入る。
     * 地図UIが対象（県/地方/区）の mapNo を data-* で塗り分けるのに使う。
     */
    mapKind?: 'pref' | 'region' | 'ward' | 'pref-shape'
    mapNo?: number
    /**
     * 地図上で mapNo を強調表示するか。
     *   true  … 単独出題（例：地図→名前）。対象を強調して「これは何？」と問う。
     *   false … 組み合わせ出題。地図は参照用（全番号表示）で、正解を強調しない
     *           （強調すると答えがばれるため）。
     */
    mapHighlight?: boolean
}

/** 問題セット（APIレスポンス＝内部形式） */
export interface QuizData {
    questions: Question[]
}

/** ユーザーの回答記録（questionId → 選んだ選択肢のID） */
export type AnswerMap = Record<number, ChoiceId>

/** アプリの画面フェーズ */
export type AppPhase = 'setting' | 'quiz' | 'result'

/**
 * 科目（上位グループ）。設定画面で最上位の選択肢として出す。
 * 現在は「社会」のみ。将来 理科・算数 等を足せる構造。
 */
export type SubjectCategory = 'social'

/** 科目（上位グループ）の定義 */
export interface Category {
    id: SubjectCategory
    label: string       // 例：'社会'
    enabled?: boolean    // 省略時 true
}

/**
 * 項目（旧 Subject）。科目の下にぶら下がる中位グループ。
 * 例：都道府県／県庁所在地／地方／特産品／発展／東京23区。
 * 設定画面ではこの単位でチップを並べる。
 */
export interface Subject {
    id: string
    label: string
    category: SubjectCategory   // どの科目に属するか
    /** 設定画面に表示するか。省略時は true。 */
    enabled?: boolean
    units: Unit[]
}

/**
 * 出題方法の種類（旧「単元」）。
 * quizgen.ts がこの値で分岐し、マスタ（県・地方・区）から4択を動的生成する。
 */
export type QuestionType =
    // --- 都道府県 ---
    | 'pref_map_to_name'      // 地図（番号）→ 県名
    | 'pref_name_to_map'      // 県名 → 地図（番号）
    | 'pref_shape_to_name'    // 県の形（個別SVG）→ 県名
    | 'pref_name_to_shape'    // 県名 → 県の形（個別SVG）
    // --- 県庁所在地 ---
    | 'capital_map_to_name'   // 地図（番号）→ 県庁所在地
    | 'pref_to_capital'       // 県名 → 県庁所在地
    | 'capital_name_to_map'   // 県庁所在地名 → 地図（その県の番号）
    // --- 特産品 ---
    | 'pref_to_specialty'     // 県名 → 特産品
    | 'specialty_map_to_name' // 地図（番号）→ 特産品
    // --- 発展（組み合わせ系） ---
    | 'pref_capital_set'      // 県＋県庁所在地
    | 'pref_map_capital_set'  // 地図＋県＋県庁所在地
    | 'pref_specialty_set'          // 県＋特産品の正しい組
    | 'pref_map_specialty_set'      // 地図＋県＋特産品の正しい組
    | 'pref_capital_specialty_set'      // 県＋県庁所在地＋特産品
    | 'pref_map_capital_specialty_set'  // 地図＋県＋県庁所在地＋特産品
    // --- 地方 ---
    | 'region_map_to_name'    // 地図 → 地方名
    | 'region_name_to_map'    // 地方名 → 地図
    | 'region_to_pref'        // 地方 → その地方に属する県
    | 'pref_to_region'        // 県 → 属する地方
    // --- 東京23区 ---
    | 'ward_map_to_name'      // 地図（番号）→ 区名
    | 'ward_name_to_map'      // 区名 → 地図（番号）

/** 出題方法（旧 Unit）。1つの出題形式に対応。 */
export interface Unit {
    id: string
    label: string
    /** この出題方法の種類。quizgen.ts がこの値で問題を組み立てる。 */
    questionType?: QuestionType
    /** 「すべての◯◯」モードを持つか（都道府県/地方/23区など上限が決まっているもの） */
    supportsAll?: boolean
}

// ============================================================
// マスタデータ型（Supabase prim_* テーブルと対応）
// 問題は固定で持たず、これらのマスタから quizgen.ts が4択を生成する。
// ============================================================

/** 都道府県マスタ（prim_prefectures）。県庁所在地・特産品もここに内包する。 */
export interface Prefecture {
    id: string          // 'hokkaido' 等（学年順に投入）
    name: string        // 表示名（漢字）   例：'神奈川県'
    nameKana: string    // よみ（ルビ・完全ひらがな用） 例：'かながわけん'
    nameGrade4: string  // 小4教科書表記（未習漢字をひらがな化した表記）
    capital: string     // 県庁所在地（漢字）例：'横浜市'
    capitalKana: string // 県庁所在地のよみ
    capitalGrade4: string
    regionId: string    // → Region.id
    mapNo: number       // 白地図の番号
    specialties: string[] // 特産品（代表順・最大3）
    grade?: number      // 主に学ぶ学年（4/5）任意
}

/** 地方マスタ（prim_regions） */
export interface Region {
    id: string
    name: string
    nameKana: string
    nameGrade4: string
    mapNo?: number      // 地方塗り分け用の識別番号（任意）
}

/** 東京23区マスタ（prim_wards） */
export interface Ward {
    id: string
    name: string
    nameKana: string
    nameGrade4: string
    mapNo: number
}

/** 設定画面で選んだ値 */
export interface QuizSettings {
    categoryId: SubjectCategory  // 科目（上位グループ）。今は 'social' のみ
    subjectId: string            // 項目（都道府県/県庁所在地/…）
    unitIds: string[]            // 出題方法。空配列 = すべての出題方法
    questionCount: number
    examFormat: ExamFormat
}