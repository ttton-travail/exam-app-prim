// ===========================
// 設定画面コンポーネント
// components/SettingScreen.tsx
//
// 階層：科目（上位グループ）→ 項目 → 出題方法 → 問題数。
// 問題はマスタから動的生成するため、ストック概数の表示は行わない。
// AI生成ボタンはコードを残しつつ非表示（裏に構造だけ残す方針）。
// ===========================

'use client'

import { design, styles, labels } from '@/lib/design'
import { useResponsive } from '@/lib/useBreakpoint'
import { CATEGORIES, SUBJECTS, ALL_UNIT_LABEL } from '@/lib/subjects'
import { QUESTION_COUNT_OPTIONS, ALL_COUNT } from '@/lib/config'
import type { QuizSettings } from '@/types/quiz'

interface Props {
  settings: QuizSettings
  loading: boolean
  error: string
  // remaining / reachedLimit は AI生成ボタン用。現在ボタンは非表示のため未使用だが、
  // 将来の再有効化に備えて Props には残す（呼び出し側の受け渡しを壊さない）。
  remaining: number
  reachedLimit: boolean
  onSettingsChange: (settings: QuizSettings) => void
  onGenerate: (mode: 'stock' | 'generate') => void
  onClearError: () => void
}

export default function SettingScreen({
  settings,
  loading,
  error,
  onSettingsChange,
  onGenerate,
  onClearError,
}: Props) {
  const { r } = useResponsive()

  // 表示する項目（選択中の科目に属するもの）
  const visibleSubjects = SUBJECTS.filter(
    (s) => s.category === settings.categoryId && s.enabled !== false,
  )
  const currentSubject = visibleSubjects.find((s) => s.id === settings.subjectId)

  // 「すべての◯◯」チップに使う単位名（項目ごと）
  const allUnitLabel = ALL_UNIT_LABEL[settings.subjectId] ?? '都道府県'

  /** 科目変更（項目・出題方法はリセット） */
  const handleCategoryChange = (categoryId: QuizSettings['categoryId']) => {
    const first = SUBJECTS.find((s) => s.category === categoryId && s.enabled !== false)
    onSettingsChange({
      ...settings,
      categoryId,
      subjectId: first?.id ?? settings.subjectId,
      unitIds: [],
    })
  }

  /** 項目変更（出題方法選択はリセット） */
  const handleSubjectChange = (subjectId: string) => {
    onSettingsChange({ ...settings, subjectId, unitIds: [] })
  }

  /** 出題方法のON/OFF切り替え */
  const handleUnitToggle = (unitId: string) => {
    const unitIds = settings.unitIds.includes(unitId)
      ? settings.unitIds.filter((id) => id !== unitId)
      : [...settings.unitIds, unitId]
    onSettingsChange({ ...settings, unitIds })
  }

  /** 問題数変更 */
  const handleCountChange = (questionCount: number) => {
    onSettingsChange({ ...settings, questionCount })
  }

  return (
    <main style={styles.page}>
      <div style={{ ...styles.card, padding: r.cardPadding, marginTop: r.cardMarginY, marginBottom: r.cardMarginY }}>

        {/** エラーカード */}
        {error && (
          <div style={styles.errorCard}>
            <p style={styles.errorCardTitle}>{labels.error.title}</p>
            <p style={styles.errorCardBody}>{error}</p>
            <button onClick={onClearError} style={styles.errorRetryButton}>
              {labels.error.retry}
            </button>
          </div>
        )}

        {/** 導入文 */}
        <p style={{ ...styles.subtitle, fontSize: r.bodySize, textAlign: 'left', margin: `0 0 ${design.spacing.md}` }}>{labels.setting.intro}</p>

        {/** 科目選択（上位グループ。現在は社会のみだが将来の拡張に備え常に表示） */}
        <section style={styles.section}>
          <label style={styles.label}>{labels.setting.categoryLabel}</label>
          <div style={styles.chipRow}>
            {CATEGORIES.filter((c) => c.enabled !== false).map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoryChange(c.id)}
                style={{
                  ...styles.chipButton,
                  ...(settings.categoryId === c.id ? styles.chipButtonActive : {}),
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/** 項目選択 */}
        <section style={styles.section}>
          <label style={styles.label}>{labels.setting.subjectLabel}</label>
          <div style={styles.chipRow}>
            {visibleSubjects.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSubjectChange(s.id)}
                style={{
                  ...styles.chipButton,
                  ...(settings.subjectId === s.id ? styles.chipButtonActive : {}),
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/** 出題方法選択 */}
        <section style={styles.section}>
          <label style={styles.label}>
            {labels.setting.unitLabel}
            <span style={styles.labelNote}>{labels.setting.unitNote}</span>
          </label>
          <div style={styles.chipRow}>
            {currentSubject?.units.map((u) => (
              <button
                key={u.id}
                onClick={() => handleUnitToggle(u.id)}
                style={{
                  ...styles.chipButton,
                  ...(settings.unitIds.includes(u.id) ? styles.chipButtonActive : {}),
                }}
              >
                <span>{u.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/** 問題数選択（末尾に「すべての◯◯」） */}
        <section style={styles.section}>
          <label style={styles.label}>{labels.setting.countLabel}</label>
          <div style={styles.chipRow}>
            {QUESTION_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => handleCountChange(n)}
                style={{
                  ...styles.chipButton,
                  ...(settings.questionCount === n ? styles.chipButtonActive : {}),
                }}
              >
                {labels.setting.countUnit.replace('{n}', String(n))}
              </button>
            ))}
            <button
              key="all"
              onClick={() => handleCountChange(ALL_COUNT)}
              style={{
                ...styles.chipButton,
                ...(settings.questionCount === ALL_COUNT ? styles.chipButtonActive : {}),
              }}
            >
              {labels.setting.countAll.replace('{unit}', allUnitLabel)}
            </button>
          </div>
        </section>

        {/** 問題作成ボタン（マスタ生成）。AI生成ボタンは非表示。 */}
        <button
          onClick={() => onGenerate('stock')}
          disabled={loading}
          style={{
            ...styles.primaryButton,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? (
            <>
              <span className="spinner" /> {labels.setting.generating}
            </>
          ) : (
            labels.setting.fromStock
          )}
        </button>

        {/*
          AI生成ボタンは構造として残すが非表示。再有効化する場合は下記を有効化：
          <button
            onClick={() => onGenerate('generate')}
            disabled={loading || reachedLimit}
            style={{ ...styles.aiButton, marginTop: design.spacing.sm,
                     ...(loading || reachedLimit ? styles.buttonDisabled : {}) }}
          >
            {labels.setting.fromAi}{labels.setting.fromAiNote.replace('{n}', String(remaining))}
          </button>
        */}
      </div>
    </main>
  )
}