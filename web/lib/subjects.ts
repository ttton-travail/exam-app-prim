// ===========================
// 科目・項目・出題方法マスター
// lib/subjects.ts
//
// 階層：科目(Category) > 項目(Subject) > 出題方法(Unit)
//   科目     … 最上位グループ。今は「社会」のみ（将来 理科・算数 等を追加可能）。
//   項目     … 都道府県／県庁所在地／地方／特産品／組み合わせ／東京23区。
//   出題方法 … 各 questionType。quizgen.ts がこれを読みマスタから4択を生成。
//
// 並びは学習学年順。組み合わせ（組み合わせ系）は23区の手前。
// ===========================

import type { Category, Subject, SubjectCategory } from '@/types/quiz'

/** 科目（上位グループ）。設定画面に最上位の選択肢として出す。 */
export const CATEGORIES: Category[] = [
    { id: 'social', label: '社会', enabled: true },
]

export const DEFAULT_CATEGORY_ID: SubjectCategory = 'social'

export const SUBJECTS: Subject[] = [
    // ---------------- 都道府県 ----------------
    {
        id: 'prefecture',
        category: 'social',
        label: '都道府県',
        enabled: true,
        units: [
            { id: 'pref_map_to_name', label: '地図→名前', questionType: 'pref_map_to_name', supportsAll: true },
            { id: 'pref_name_to_map', label: '名前→地図', questionType: 'pref_name_to_map', supportsAll: true },
            { id: 'pref_shape_to_name', label: '県の形→名前', questionType: 'pref_shape_to_name', supportsAll: true },
            { id: 'pref_name_to_shape', label: '名前→県の形', questionType: 'pref_name_to_shape', supportsAll: true },
        ],
    },

    // ---------------- 県庁所在地 ----------------
    {
        id: 'capital',
        category: 'social',
        label: '県庁所在地',
        enabled: true,
        units: [
            { id: 'capital_map_to_name', label: '地図→名前', questionType: 'capital_map_to_name', supportsAll: true },
            { id: 'pref_to_capital', label: '都道府県→県庁所在地', questionType: 'pref_to_capital', supportsAll: true },
            { id: 'capital_name_to_map', label: '名前→地図', questionType: 'capital_name_to_map', supportsAll: true },
            { id: 'shape_to_capital', label: '県の形→県庁所在地', questionType: 'shape_to_capital', supportsAll: true },
            { id: 'capital_to_shape', label: '県庁所在地→県の形', questionType: 'capital_to_shape', supportsAll: true },
        ],
    },

    // ---------------- 特産品（単体のみ） ----------------
    {
        id: 'specialty',
        category: 'social',
        label: '特産品',
        enabled: true,
        units: [
            { id: 'pref_to_specialty', label: '都道府県→特産品', questionType: 'pref_to_specialty', supportsAll: true },
            { id: 'specialty_map_to_name', label: '地図→特産品', questionType: 'specialty_map_to_name', supportsAll: true },
        ],
    },

        // ---------------- 地方 ----------------
    {
        id: 'region',
        category: 'social',
        label: '地方',
        enabled: true,
        units: [
            { id: 'region_map_to_name', label: '地図→名前', questionType: 'region_map_to_name', supportsAll: true },
            { id: 'region_name_to_map', label: '名前→地図', questionType: 'region_name_to_map', supportsAll: true },
            { id: 'region_to_pref', label: '地方→都道府県', questionType: 'region_to_pref', supportsAll: true },
            { id: 'pref_to_region', label: '都道府県→地方', questionType: 'pref_to_region', supportsAll: true },
        ],
    },

    // ---------------- 組み合わせ（組み合わせ系） ----------------
    {
        id: 'advanced',
        category: 'social',
        label: '組み合わせ',
        enabled: true,
        units: [
            { id: 'pref_capital_set', label: '県 - 県庁所在地', questionType: 'pref_capital_set', supportsAll: true },
            { id: 'pref_map_capital_set', label: '地図 - 県 - 県庁所在地', questionType: 'pref_map_capital_set', supportsAll: true },
            { id: 'pref_specialty_set', label: '県 - 特産品', questionType: 'pref_specialty_set', supportsAll: true },
            { id: 'pref_map_specialty_set', label: '地図 - 県 - 特産品', questionType: 'pref_map_specialty_set', supportsAll: true },
            { id: 'pref_capital_specialty_set', label: '県 - 県庁所在地 - 特産品', questionType: 'pref_capital_specialty_set', supportsAll: true },
            { id: 'pref_map_capital_specialty_set', label: '地図 - 県 - 県庁所在地 - 特産品', questionType: 'pref_map_capital_specialty_set', supportsAll: true },
        ],
    },

    // ---------------- 東京23区 ----------------
    {
        id: 'ward',
        category: 'social',
        label: '東京23区',
        enabled: true,
        units: [
            { id: 'ward_map_to_name', label: '地図→名前', questionType: 'ward_map_to_name', supportsAll: true },
            { id: 'ward_name_to_map', label: '名前→地図', questionType: 'ward_name_to_map', supportsAll: true },
        ],
    },
]

export const DEFAULT_SUBJECT_ID = 'prefecture'

/**
 * 「すべての◯◯」モードの単位名（項目ごとに表記が変わる）。
 * 設定画面の問題数チップ末尾「すべての{単位}」に使う。
 */
export const ALL_UNIT_LABEL: Record<string, string> = {
    prefecture: '都道府県',
    capital: '都道府県',   // 県庁所在地は都道府県と同数(47)
    specialty: '都道府県',
    region: '地方',
    advanced: '都道府県',
    ward: '区',
}