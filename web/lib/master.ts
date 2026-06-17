// ===========================
// マスタ取得（DBが正・seedは保険）
// lib/master.ts
//
// 県・地方・区のマスタを Supabase（prim_* テーブル）から anon で読む。
// DB未設定・取得失敗時は lib/seed のTS原本にフォールバックする
//   （＝サイト全体は落ちない。既存 stock.ts と同じ「読めなければ保険」方針）。
//
// 実行時の正は常にDB。seed.ts は (1) DB投入元の原本 (2) オフライン保険。
// ===========================

import { getReadClient } from '@/lib/supabase'
import type { Prefecture, Region, Ward } from '@/types/quiz'
import {
    PREFECTURES as SEED_PREFECTURES,
    REGIONS as SEED_REGIONS,
    WARDS as SEED_WARDS,
} from '@/lib/seed/prefectures'

/** マスタ一式 */
export interface MasterData {
    prefectures: Prefecture[]
    regions: Region[]
    wards: Ward[]
}

// ---- DB行 → アプリ内部型（snake_case → camelCase） ----
interface PrefRow {
    id: string
    name: string
    name_kana: string
    name_grade4: string
    capital: string
    capital_kana: string
    capital_grade4: string
    region_id: string
    map_no: number
    specialties: string[]
    grade: number | null
}
interface RegionRow {
    id: string
    name: string
    name_kana: string
    name_grade4: string
    map_no: number | null
}
interface WardRow {
    id: string
    name: string
    name_kana: string
    name_grade4: string
    map_no: number
}

function toPref(r: PrefRow): Prefecture {
    return {
        id: r.id,
        name: r.name,
        nameKana: r.name_kana,
        nameGrade4: r.name_grade4,
        capital: r.capital,
        capitalKana: r.capital_kana,
        capitalGrade4: r.capital_grade4,
        regionId: r.region_id,
        mapNo: r.map_no,
        specialties: Array.isArray(r.specialties) ? r.specialties : [],
        grade: r.grade ?? undefined,
    }
}
function toRegion(r: RegionRow): Region {
    return { id: r.id, name: r.name, nameKana: r.name_kana, nameGrade4: r.name_grade4, mapNo: r.map_no ?? undefined }
}
function toWard(r: WardRow): Ward {
    return { id: r.id, name: r.name, nameKana: r.name_kana, nameGrade4: r.name_grade4, mapNo: r.map_no }
}

/** seed フォールバック一式（DBが読めないとき） */
function seedFallback(): MasterData {
    return {
        prefectures: SEED_PREFECTURES,
        regions: SEED_REGIONS,
        wards: SEED_WARDS,
    }
}

/**
 * マスタ一式を取得する。DBが正。失敗時は seed にフォールバック。
 * map_no 昇順（学習学年順）で返す。
 */
export async function getMasterData(): Promise<MasterData> {
    const supabase = getReadClient()
    if (!supabase) {
        console.warn('[master] readClient が null（環境変数未設定）→ seed にフォールバック')
        return seedFallback()
    }
    try {
        const [prefRes, regionRes, wardRes] = await Promise.all([
            supabase.from('prim_prefectures').select('*').order('map_no', { ascending: true }),
            supabase.from('prim_regions').select('*').order('map_no', { ascending: true }),
            supabase.from('prim_wards').select('*').order('map_no', { ascending: true }),
        ])

        // どれか1つでもエラー、または空なら seed に倒す（部分的な欠損で問題生成が壊れるのを防ぐ）。
        if (prefRes.error || regionRes.error || wardRes.error) {
            console.error('[master] DB取得エラー', {
                pref: prefRes.error?.message,
                region: regionRes.error?.message,
                ward: wardRes.error?.message,
            })
            return seedFallback()
        }
        const prefectures = (prefRes.data as PrefRow[] ?? []).map(toPref)
        const regions = (regionRes.data as RegionRow[] ?? []).map(toRegion)
        const wards = (wardRes.data as WardRow[] ?? []).map(toWard)

        if (prefectures.length === 0 || regions.length === 0) {
            console.warn('[master] DBが空（未seed）→ seed にフォールバック')
            return seedFallback()
        }
        return { prefectures, regions, wards }
    } catch (e) {
        console.error('[master] 取得で例外 → seed にフォールバック', e)
        return seedFallback()
    }
}