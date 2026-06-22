// ===========================
// プロンプト切り替えハブ
// prompts/index.ts
//
// 問題形式が増えたらここに追加する
// ===========================

import { buildCsatPrompt } from './csat'

// 基準年度（プロンプト提示＝ストック保存 base_year を同値にするため、生成ルートからも使えるよう再エクスポート）
export { getCurrentFiscalYear } from './csat'

/** 対応している問題形式 */
export type ExamFormat = 'csat'
// 将来追加例:
// export type ExamFormat = 'csat' | 'desc' | 'eiken'

/** 形式ラベル（UI表示用） */
export const EXAM_FORMAT_LABELS: Record<ExamFormat, string> = {
    csat: '共通テスト形式',
    // desc: '記述式',
    // eiken: '英検形式',
}

/** デフォルトの問題形式 */
export const DEFAULT_EXAM_FORMAT: ExamFormat = 'csat'

/**
 * 形式に応じたプロンプトを返す
 * 形式が増えたらcaseを追加するだけでOK
 */
export function buildPrompt(
    format: ExamFormat,
    subjectLabel: string,
    units: { id: string; label: string }[],
    questionCount: number,
): string {
    switch (format) {
        case 'csat':
        return buildCsatPrompt(subjectLabel, units, questionCount)
        // case 'desc':
        //   return buildDescPrompt(subjectLabel, units, questionCount)
        default:
        return buildCsatPrompt(subjectLabel, units, questionCount)
    }
}