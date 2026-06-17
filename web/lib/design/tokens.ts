// ===========================
// デザイントークン一括管理
// lib/design/tokens.ts
//
// 色・サイズ・フォントなどすべてここで管理
// UIの見た目を変えたい時はここだけ編集する
// ===========================

export const design = {
    // -----------------------------------------------
    // カラーパレット
    // -----------------------------------------------
    color: {
        // ブランド／操作色（ティール）。ボタン・選択肢キー・リンク・選択中の選択肢に使う。
        primary:        '#0D9488', // メインのティール
        primaryHover:   '#0F766E',
        primaryLight:   '#F0FDFA', // 選択中の選択肢の背景にも使う淡いティール

        // 正誤色（緑＝正解 / 赤＝不正解）。
        // 「色だけで意味を伝えない」ため、結果表示では文字記号 ○ × とセットで使う。
        correct:        '#16A34A', // 正解・緑
        correctLight:   '#F0FFF4', // 正解カードの淡い背景
        incorrect:      '#DC2626', // 不正解・赤
        incorrectLight: '#FFF5F5', // 不正解カードの淡い背景

        // 選択中（回答中の選択肢）：primary（ティール）を使う。右端に✓を出して色覚非依存の手がかりも併用。
        selected:        '#F0FDFA', // 選択中の背景（淡いティール）
        selectedBorder:  '#0D9488', // 選択中の枠（ティール）
        selectedText:    '#0D9488', // 選択中の文字・チェック（ティール）

        // 旧名エイリアス（後方互換）。success=正解(緑), error=不正解(赤) に対応。
        // ※ 新規コードは correct/incorrect を使うこと。
        success:        '#16A34A',
        successLight:   '#F0FFF4',
        error:          '#DC2626', // 既存のエラー表示（バリデーション等）も赤
        errorLight:     '#FFF5F5',
        warning:        '#D97706', // 注意・黄
        warningLight:   '#FFFBEB',

        // ニュートラル
        bg:             '#F8FAFC', // ページ背景
        surface:        '#FFFFFF', // カード背景
        border:         '#E2E8F0',
        borderFocus:    '#0D9488',
        textPrimary:    '#1E293B',
        textSecondary:  '#64748B',
        textMuted:      '#94A3B8',
        disabled:       '#CBD5E1',
    },

    // -----------------------------------------------
    // タイポグラフィ
    // -----------------------------------------------
    font: {
        family: '"Noto Sans JP", "Hiragino Sans", sans-serif',
        sizeXs:   '0.75rem',  // 12px
        sizeSm:   '0.875rem', // 14px
        sizeMd:   '1rem',     // 16px
        sizeLg:   '1.125rem', // 18px
        sizeXl:   '1.25rem',  // 20px
        size2xl:  '1.5rem',   // 24px
        size3xl:  '1.875rem', // 30px
        weightNormal: '400',
        weightMedium: '500',
        weightBold:   '700',
    },

    // -----------------------------------------------
    // スペーシング・サイズ
    // -----------------------------------------------
    spacing: {
        xs:  '0.25rem',  // 4px
        sm:  '0.5rem',   // 8px
        md:  '1rem',     // 16px
        lg:  '1.5rem',   // 24px
        xl:  '2rem',     // 32px
        xxl: '3rem',     // 48px
    },

    radius: {
        sm:   '0.375rem', // 6px
        md:   '0.5rem',   // 8px
        lg:   '0.75rem',  // 12px
        full: '9999px',
    },

    // -----------------------------------------------
    // レイアウト
    // -----------------------------------------------
    layout: {
        maxWidth:    '680px',  // コンテンツ最大幅
        headerHeight: '56px',
        pagePadding: '1rem',
    },

    // -----------------------------------------------
    // レスポンシブ・ブレークポイント
    // 画面幅ごとの調整値はここで一括管理する。
    // しきい値の考え方:
    //   mobile  : ～599px   スマホ縦（1カラム前提・余白小・文字やや小）
    //   tablet  : 600～1023px タブレット／スマホ横（中間の余白）
    //   desktop : 1024px～   PC（最大幅で頭打ち・余白大）
    // ※学習アプリは1カラムUIなので3段階で十分。これ以上細かく割ると保守が増える。
    // -----------------------------------------------
    breakpoint: {
        tablet:  600,   // この値以上で tablet 扱い
        desktop: 1024,  // この値以上で desktop 扱い
    },

    // 画面幅ごとに変える値（カード内パディング・本文/見出しサイズ・カード上下余白）
    // useBreakpoint フックが現在の幅に応じてこのどれかを返す。
    responsive: {
        mobile: {
            cardPadding:    '1.25rem', // spacing.lg 相当
            cardMarginY:    '1rem',
            titleSize:      '1.25rem', // sizeXl
            subtitleSize:   '0.75rem', // sizeXs
            bodySize:       '0.875rem',// sizeSm
            choiceGap:      '0.5rem',
        },
        tablet: {
            cardPadding:    '1.75rem',
            cardMarginY:    '1.5rem',
            titleSize:      '1.5rem',  // size2xl
            subtitleSize:   '0.875rem',
            bodySize:       '1rem',    // sizeMd
            choiceGap:      '0.625rem',
        },
        desktop: {
            cardPadding:    '2rem',    // spacing.xl
            cardMarginY:    '2rem',
            titleSize:      '1.875rem',// size3xl
            subtitleSize:   '0.875rem',
            bodySize:       '1rem',
            choiceGap:      '0.75rem',
        },
    },

    // -----------------------------------------------
    // シャドウ
    // -----------------------------------------------
    shadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
        // ヘッダー用：パネル(sm)より強い影で「最前面」を表現（下方向に落とす）。
        header: '0 4px 16px rgba(0,0,0,0.25)',
    },
} as const