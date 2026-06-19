// ===========================
// 共通スタイル定義
// lib/design/styles.ts
// design.tsのトークンを参照して全コンポーネントで共有する
// UIの調整はdesign.tsのトークンを変更するか、ここのスタイルを変更する
// ===========================

import { design } from './tokens'

// ------------------------------------------------------------
// typography / dividers / DIVIDER_LINE は presets.ts へ切り出した。
// styles.ts からも従来どおり import できるよう re-export する（後方互換）。
// ------------------------------------------------------------
import { typography, dividers, DIVIDER_LINE } from './presets'
export { typography, dividers, DIVIDER_LINE }

export const styles: Record<string, React.CSSProperties> = {

    /** ページ全体 */
    page: {
        minHeight: '100vh',
        backgroundColor: design.color.bg,
        padding: design.spacing.md,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    /** メインカード */
    card: {
        backgroundColor: design.color.surface,
        borderRadius: design.radius.lg,
        boxShadow: design.shadow.md,
        padding: design.spacing.xl,
        width: '100%',
        maxWidth: design.layout.maxWidth,
        marginTop: design.spacing.xl,
        marginBottom: design.spacing.xl,
    },

    /** 見出し */
    // ============================================================
    // 見出し系（typography プリセットを参照）
    // 新しいコンポーネントは typography を直接 import して使ってもよい。
    // 既存コンポーネント互換のため styles 経由のキーも用意している。
    // ============================================================

    /** アプリタイトル（= typography.headingPage） */
    title: { ...typography.headingPage },

    /** サブタイトル（= typography.pageLead） */
    subtitle: { ...typography.pageLead },

    /** セクション見出し（中見出し・= typography.headingSection） */
    headingSection: { ...typography.headingSection },

    /** 見出し下の補足（= typography.subText） */
    subText: { ...typography.subText },

    /** 控えめな注釈（= typography.subTextMuted） */
    subTextMuted: { ...typography.subTextMuted },

    /** セクション */
    section: {
        marginBottom: design.spacing.lg,
    },

    /** ラベル（セクション見出しを block 化・下マージン調整） */
    label: {
        ...typography.headingSection,
        display: 'block',
        margin: 0,
        marginBottom: design.spacing.sm,
    },

    /** ラベル注釈（横並び用に余白だけ追加） */
    labelNote: {
        ...typography.subTextMuted,
        marginLeft: design.spacing.sm,
    },

    /** 「おまけ」見出し（23区チップの上に出す薄グレーの小見出し） */
    omakeNote: {
        margin: `0 0 ${design.spacing.xs}`,
        fontSize: design.font.sizeXs,
        color: design.color.textMuted,
        fontWeight: design.font.weightMedium,
    },

    /** チップボタン行 */
    chipRow: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: design.spacing.sm,
    },

    /** チップボタン（非選択） */
    chipButton: {
        padding: `${design.spacing.xs} ${design.spacing.md}`,
        borderRadius: design.radius.lg,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: design.color.border,
        backgroundColor: design.color.surface,
        color: design.color.textPrimary,
        fontSize: design.font.sizeSm,
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'row' as const,
        alignItems: 'center',
        gap: design.spacing.xs,
        lineHeight: '1.3',
    },

    /** チップ内のストック概数（単元名の横にアイコン＋約N問） */
    chipStock: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        fontSize: design.font.sizeXs,
        color: design.color.textMuted,
    },

    /** 生成所要時間の目安（生成ボタン下に控えめに） */
    timeHint: {
        fontSize: design.font.sizeXs,
        color: design.color.textMuted,
        textAlign: 'center' as const,
        margin: `${design.spacing.xs} 0 0`,
    },

    /** チップボタン（選択中） */
    chipButtonActive: {
        backgroundColor: design.color.primaryLight,
        borderColor: design.color.primary,
        color: design.color.primary,
        fontWeight: design.font.weightBold,
    },

    /** プライマリボタン */
    primaryButton: {
        width: '100%',
        padding: `${design.spacing.md} ${design.spacing.lg}`,
        backgroundColor: design.color.primary,
        color: '#fff',
        border: 'none',
        borderRadius: design.radius.md,
        fontSize: design.font.sizeMd,
        fontWeight: design.font.weightBold,
        cursor: 'pointer',
        marginTop: design.spacing.md,
    },

    /** セカンダリボタン */
    secondaryButton: {
        padding: `${design.spacing.sm} ${design.spacing.md}`,
        backgroundColor: design.color.surface,
        color: design.color.textSecondary,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: design.color.border,
        borderRadius: design.radius.md,
        fontSize: design.font.sizeSm,
        cursor: 'pointer',
    },

    /** AI新規生成ボタン（ストックを主役にするため控えめ：白地・細枠・やや低め） */
    aiButton: {
        width: '100%',
        padding: `${design.spacing.sm} ${design.spacing.lg}`,
        backgroundColor: design.color.surface,
        color: design.color.primary,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: design.color.primary,
        borderRadius: design.radius.md,
        fontSize: design.font.sizeSm,
        fontWeight: design.font.weightNormal,
        cursor: 'pointer',
    },

    /** ボタン無効状態 */
    buttonDisabled: {
        backgroundColor: design.color.disabled,
        cursor: 'not-allowed',
    },

    /** エラーテキスト */
    errorText: {
        color: design.color.error,
        fontSize: design.font.sizeSm,
        marginBottom: design.spacing.sm,
    },

    /** エラーカード（設定画面上部に表示） */
    errorCard: {
        backgroundColor: design.color.bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: design.color.border,
        borderRadius: design.radius.md,
        padding: design.spacing.md,
        marginBottom: design.spacing.lg,
        textAlign: 'center' as const,
    },

    /** エラーカードの見出し */
    errorCardTitle: {
        color: design.color.textSecondary,
        fontWeight: design.font.weightBold,
        fontSize: design.font.sizeMd,
        margin: `0 0 ${design.spacing.sm}`,
    },

    /** エラーカードの本文 */
    errorCardBody: {
        color: design.color.textSecondary,
        fontSize: design.font.sizeSm,
        lineHeight: 1.7,
        margin: `0 0 ${design.spacing.md}`,
        whiteSpace: 'pre-wrap' as const,
    },

    /** エラーカードの再試行ボタン */
    errorRetryButton: {
        padding: `${design.spacing.sm} ${design.spacing.lg}`,
        backgroundColor: design.color.primaryLight,
        color: design.color.primary,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: design.color.primary,
        borderRadius: design.radius.md,
        fontSize: design.font.sizeSm,
        fontWeight: design.font.weightBold,
        cursor: 'pointer',
    },

    /** プログレスバー外枠 */
    progressBar: {
        height: '6px',
        backgroundColor: design.color.border,
        borderRadius: design.radius.full,
        marginBottom: design.spacing.sm,
        overflow: 'hidden',
    },

    /** プログレスバー塗り */
    progressFill: {
        height: '100%',
        backgroundColor: design.color.primary,
        borderRadius: design.radius.full,
        transition: 'width 0.3s ease',
    },

    /** 進捗テキスト */
    progressText: {
        fontSize: design.font.sizeXs,
        color: design.color.textMuted,
        margin: `0 0 ${design.spacing.xs}`,
    },

    /** 単元バッジ */
    unitBadge: {
        display: 'inline-block',
        fontSize: design.font.sizeXs,
        color: design.color.primary,
        backgroundColor: design.color.primaryLight,
        borderRadius: design.radius.full,
        padding: `2px ${design.spacing.sm}`,
        marginBottom: design.spacing.md,
    },

    /** 問題文 */
    questionText: {
        fontSize: design.font.sizeMd,
        lineHeight: '1.8',
        color: design.color.textPrimary,
        marginBottom: design.spacing.lg,
        whiteSpace: 'pre-wrap',
    },

    /** 選択肢リスト */
    choiceList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: design.spacing.sm,
        marginBottom: design.spacing.lg,
    },

    /** 選択肢ボタン（非選択） */
    choiceButton: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: design.spacing.sm,
        padding: design.spacing.md,
        backgroundColor: design.color.surface,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: design.color.border,
        borderRadius: design.radius.md,
        fontSize: design.font.sizeSm,
        color: design.color.textPrimary,
        cursor: 'pointer',
        textAlign: 'left' as const,
        lineHeight: '1.6',
        outline: 'none',    // ← クリック後の黒い縁取りを消す
        WebkitTapHighlightColor: 'transparent', // ← スマホのタップ時ハイライトを消す
    },

    /** 選択肢ボタン（選択中）：押した影っぽい薄グレー＋少し太い枠。チェックは choiceCheck で右端に表示。 */
    choiceButtonSelected: {
        backgroundColor: design.color.selected,
        borderColor: design.color.selectedBorder,
        borderWidth: '2.5px',
        color: design.color.textPrimary,
    },

    /** 選択中の右端チェック（✓）。色覚に依存しない選択の手がかり。 */
    choiceCheck: {
        marginLeft: 'auto',
        color: design.color.selectedText,
        fontWeight: design.font.weightBold,
        flexShrink: 0,
    },

    /** 選択肢キー（A/B/C/D） */
    choiceKey: {
        fontWeight: design.font.weightBold,
        minWidth: '1.2rem',
        color: design.color.primary,
    },

    /** 画像選択肢のグリッド（県の形・地図ハイライトを4枚並べる：2×2） */
    imageChoiceGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: design.spacing.sm,
        marginBottom: design.spacing.lg,
    },

    /** 画像選択肢の1枚（白カード。左上に番号、右上に選択チェック） */
    imageChoiceButton: {
        position: 'relative' as const,
        padding: design.spacing.sm,
        backgroundColor: design.color.surface,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: design.color.border,
        borderRadius: design.radius.md,
        cursor: 'pointer',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /** 画像選択肢（選択中）：ティール枠＋淡い背景 */
    imageChoiceButtonSelected: {
        backgroundColor: design.color.selected,
        borderColor: design.color.selectedBorder,
        borderWidth: '2.5px',
    },

    /** 画像選択肢の内側（地図/形の描画領域） */
    imageChoiceInner: {
        width: '100%',
        pointerEvents: 'none' as const,   // クリックはボタンが受ける（地図のドラッグ無効）
    },

    /** 画像選択肢の左上の番号【1〜4】（位置で固定） */
    imageChoiceKey: {
        position: 'absolute' as const,
        top: 6,
        left: 6,
        minWidth: '1.5rem',
        height: '1.5rem',
        padding: '0 0.35rem',
        borderRadius: design.radius.full,
        backgroundColor: design.color.primary,
        color: '#fff',
        fontWeight: design.font.weightBold,
        fontSize: design.font.sizeSm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },

    /** 画像選択肢の右上の選択チェック（✓） */
    imageChoiceCheck: {
        position: 'absolute' as const,
        top: 6,
        right: 6,
        color: design.color.selectedText,
        fontWeight: design.font.weightBold,
        fontSize: design.font.sizeMd,
        zIndex: 2,
    },

    /** ナビゲーション行 */
    navRow: {
        display: 'flex',
        alignItems: 'center',
        gap: design.spacing.sm,
        marginTop: design.spacing.md,
    },

    /** スコア表示 */
    scoreText: {
        fontSize: design.font.size3xl,
        fontWeight: design.font.weightBold,
        color: design.color.primary,
        margin: `${design.spacing.sm} 0 ${design.spacing.xl}`,
    },

    /** スコア分母 */
    scoreTotal: {
        fontSize: design.font.sizeLg,
        color: design.color.textSecondary,
        fontWeight: design.font.weightNormal,
    },

    /** 結果リスト */
    resultList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: design.spacing.md,
        marginBottom: design.spacing.xl,
    },

    /** 結果アイテム */
    resultItem: {
        padding: design.spacing.md,
        borderRadius: design.radius.md,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: design.color.border,
    },

    /** 結果アイテム（正解）：青系。resultItem に重ねて使う。 */
    resultItemCorrect: {
        borderColor: design.color.correct,
        backgroundColor: design.color.correctLight,
    },

    /** 結果アイテム（不正解）：朱赤系。resultItem に重ねて使う。 */
    resultItemIncorrect: {
        borderColor: design.color.incorrect,
        backgroundColor: design.color.incorrectLight,
    },

    /** 正誤マーク（○）青。文字記号で色覚非依存の手がかりを併用。 */
    resultMarkCorrect: {
        color: design.color.correct,
        fontWeight: design.font.weightBold,
    },

    /** 正誤マーク（×）朱赤。 */
    resultMarkIncorrect: {
        color: design.color.incorrect,
        fontWeight: design.font.weightBold,
    },

    /** 「正解：…」の行（不正解時に表示する正答）。正解色＝青。 */
    resultCorrectAnswer: {
        color: design.color.correct,
    },

    /** 結果ラベル（正解・不正解） */
    resultLabel: {
        fontWeight: design.font.weightBold,
        fontSize: design.font.sizeSm,
        marginBottom: design.spacing.xs,
    },

    /** 結果の問題文 */
    resultQuestion: {
        fontSize: design.font.sizeSm,
        color: design.color.textPrimary,
        marginBottom: design.spacing.xs,
        whiteSpace: 'pre-wrap',
    },

    /** 結果の回答表示 */
    resultAnswer: {
        fontSize: design.font.sizeSm,
        margin: `${design.spacing.xs} 0`,
    },

    /** 解説テキスト */
    explanation: {
        fontSize: design.font.sizeSm,
        color: design.color.textSecondary,
        marginTop: design.spacing.sm,
        paddingTop: design.spacing.sm,
        ...dividers.h,   // = borderTop: DIVIDER_LINE（区切り線を一元管理に寄せた）
        lineHeight: '1.7',
    },

    /** キーワード（復習の手がかり） */
    keywords: {
        fontSize: design.font.sizeXs,
        color: design.color.textMuted,
        marginTop: design.spacing.sm,
    },

    /** 問題インデックス（番号ジャンプ）の行。折り返して並べる。 */
    indexRow: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: design.spacing.xs,
        justifyContent: 'center' as const,
        marginTop: design.spacing.lg,
        marginBottom: design.spacing.sm,
    },

    /** インデックスの1ボタン（基本＝未回答）。状態別は下のmodifierを重ねる。 */
    indexButton: {
        minWidth: '2.2em',
        height: '2.2em',
        padding: `0 ${design.spacing.xs}`,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: design.color.border,
        borderRadius: design.radius.md,
        background: design.color.surface,
        color: design.color.textSecondary,
        fontSize: design.font.sizeSm,
        lineHeight: '1',
        cursor: 'pointer',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        boxSizing: 'border-box' as const,
    },

    /** インデックス：回答済み（淡い青） */
    indexButtonAnswered: {
        background: design.color.primaryLight,
        color: design.color.primary,
        borderColor: design.color.primary,
    },

    /** インデックス：現在表示中の問題（青・白文字で最も強調） */
    indexButtonCurrent: {
        background: design.color.primary,
        color: '#fff',
        borderColor: design.color.primary,
        fontWeight: 700,
    },

    /** 回答中に問題作成画面へ戻すリンクの行（左端配置） */
    quizBackRow: {
        display: 'flex',
        justifyContent: 'flex-start' as const,
        marginTop: design.spacing.lg,
    },

    /** 回答中の「問題作成画面に戻る」テキストリンク（控えめ） */
    quizBackLink: {
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: design.font.sizeSm,
        color: design.color.textSecondary,
        textDecoration: 'none',
        cursor: 'pointer',
    },

    /** 投げ銭リンク（控えめに中央） */
    supportLink: {
        display: 'block',
        textAlign: 'center' as const,
        fontSize: design.font.sizeSm,
        color: design.color.textSecondary,
        textDecoration: 'none',
        marginTop: design.spacing.lg,
    },

    /** 広告枠の外側コンテナ（上下に余白・中央寄せ） */
    adContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        margin: `${design.spacing.lg} 0 ${design.spacing.sm}`,
    },

    /** 広告プレースホルダー（グレー枠＋サイズ表示。審査前のレイアウト確認用） */
    adPlaceholder: {
        width: '100%',
        maxWidth: '728px',      // レスポンシブバナーの上限（横長）
        minHeight: '90px',      // 一般的なバナー高さ
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: design.color.bg,
        border: `1px dashed ${design.color.border}`,
        borderRadius: design.radius.md,
        color: design.color.textMuted,
        fontSize: design.font.sizeXs,
        textAlign: 'center' as const,
        boxSizing: 'border-box' as const,
        padding: design.spacing.sm,
    },
}