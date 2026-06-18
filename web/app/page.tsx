// ===========================
// ランディングページ（LP）本体
// app/page.tsx
//
// ルート（/）に表示する紹介ページ。アプリ本体は /app に置く。
// テキスト・画像・News は lib/lp/content.ts に集約（差し替えはそちらを編集）。
// ヘッダー／フッターは既存の共通コンポーネントを転用する。
// レスポンシブは既存の useResponsive（mobile/tablet/desktop）で出し分ける。
// ===========================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { design, typography } from '@/lib/design'
import { useResponsive } from '@/lib/useBreakpoint'
import { SUBJECTS } from '@/lib/subjects'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { lpContent, LP_SUBJECT_IMAGES } from '@/lib/lp/content'
import Furigana from '@/components/Furigana'
import type { NewsItem } from '@/lib/news'

export default function LandingPage() {
    const { bp } = useResponsive()
    const isNarrow = bp === 'mobile' // スマホは縦積み

    // お知らせ（News）は Supabase の news テーブルを /api/news 経由で取得する。
    // 取得失敗時は空配列のまま（リスト領域は出るが行は0件）でLPは壊れない。
    const [newsItems, setNewsItems] = useState<NewsItem[]>([])
    useEffect(() => {
        let aborted = false
        fetch('/api/news')
            .then((res) => res.json())
            .then((data: { items?: NewsItem[] }) => {
                if (!aborted) setNewsItems(data.items ?? [])
            })
            .catch((e) => {
                console.error('[LP] お知らせ取得に失敗', e)
            })
        return () => {
            aborted = true
        }
    }, [])

    // 対応項目は科目マスターの enabled から動的生成（科目追加時の二重管理を防ぐ）。
    // ただし LP に画像（LP_SUBJECT_IMAGES）が無い項目は出さない。
    // → 「組み合わせ（advanced）」は画像を持たないため LP の対応項目から自動的に除外される。
    const enabledSubjects = SUBJECTS.filter((s) => s.enabled && LP_SUBJECT_IMAGES[s.id])

    // ヒーロー用パネル：上端・左右を画面端まで（角丸なし・全幅・上余白なし）。
    // 下だけ余白を残し、中身は内側で幅制限する。
    const sectionHeroPanel: React.CSSProperties = {
        width: '100%',
        margin: `0 0 ${design.spacing.md}`,
        padding: `${design.spacing.xl} ${design.spacing.lg}`,
        boxSizing: 'border-box',
        background: design.color.surface,
        boxShadow: design.shadow.md,
    }

    // パネルなし（地色の上にそのまま。背景・影なし。幅と中央寄せだけ保つ）
    const sectionPlain: React.CSSProperties = {
        width: '100%',
        maxWidth: '960px',
        margin: `0 auto ${design.spacing.md}`,
        padding: `${design.spacing.xl} ${design.spacing.lg}`,
        boxSizing: 'border-box',
    }

    // CTAボタン（primary・大）。アプリ本体 /app へ遷移。
    const ctaButton = (label: string) => (
        <Link
            href={lpContent.appHref}
            style={{
                display: 'inline-block',
                padding: `${design.spacing.md} ${design.spacing.xxl}`,
                background: design.color.primary,
                color: '#fff',
                borderRadius: design.radius.md,
                fontSize: design.font.sizeLg,
                fontWeight: design.font.weightBold,
                textDecoration: 'none',
                boxShadow: design.shadow.md,
            }}
        >
            <Furigana text={label} />
        </Link>
    )

    return (
        <div style={{ background: '#E8EDF3', minHeight: '100vh' }}>
            <Header />

            {/* ① ヒーロー：上端・左右を画面端まで伸ばした全幅パネル */}
            <section style={sectionHeroPanel}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: isNarrow ? 'column' : 'row',
                        gap: design.spacing.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* 画像①（1枚。高さは maxHeight で調整する） */}
                    <div style={{ flex: '0 1 auto', maxWidth: '440px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={lpContent.hero.image.src}
                            alt={lpContent.hero.image.alt}
                            style={{
                                width: '100%',
                                maxHeight: '380px',
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block',
                                borderRadius: '0',
                            }}
                        />
                    </div>
                    {/* キャッチ＋CTA（右カラム内で中央揃え） */}
                    <div
                        style={{
                            flex: '0 1 auto',
                            maxWidth: '440px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                    >
                        <h1
                            style={{
                                ...typography.headingPage,
                                whiteSpace: 'pre-line',
                                lineHeight: 1.4,
                                margin: `0 0 ${design.spacing.md}`,
                            }}
                        >
                            <span
                                style={{
                                    display: 'block',
                                    fontSize: bp === 'desktop' ? '2.75rem' : '2.25rem',
                                    fontWeight: design.font.weightBold,
                                }}
                            >
                                <Furigana text={lpContent.hero.catchMain1} />
                            </span>
                            <span
                                style={{
                                    display: 'block',
                                    fontSize: bp === 'desktop' ? '2rem' : '1.75rem',
                                }}
                            >
                                <Furigana text={lpContent.hero.catchMain2} />
                            </span>
                        </h1>
                        <p
                            style={{
                                ...typography.subText,
                                fontSize: design.font.size2xl,
                                fontWeight: design.font.weightBold,
                                color: design.color.textSecondary,
                                // スマホ画面幅のときだけ catchSub を改行する（PC/タブレットは1行）
                                ...(bp === 'mobile' ? { whiteSpace: 'pre-line' as const } : {}),
                                lineHeight: 1.6,
                                margin: `0 0 ${design.spacing.sm}`,
                            }}
                        >
                            {bp === 'mobile'
                                ? <Furigana text={lpContent.hero.catchSub} />
                                : <Furigana text={lpContent.hero.catchSub.replace('\n', '')} />}
                        </p>
                        <p
                            style={{
                                ...typography.subText,
                                fontSize: design.font.sizeLg,
                                fontWeight: design.font.weightBold,
                                color: design.color.textSecondary,
                                whiteSpace: 'pre-line',
                                lineHeight: 1.6,
                                margin: `0 0 ${design.spacing.lg}`,
                            }}
                        >
                            <Furigana text={lpContent.hero.catchSub2} />
                        </p>
                        {ctaButton(lpContent.hero.ctaLabel)}
                    </div>
                </div>
                </div>
            </section>

            <div>
            {/* ②③④ アピールポイント3カラム（それぞれ個別パネル） */}
            <section style={sectionPlain}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: isNarrow ? 'column' : 'row',
                        gap: design.spacing.lg,
                    }}
                >
                    {lpContent.points.map((p, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                background: design.color.surface,
                                borderRadius: '0',
                                boxShadow: design.shadow.md,
                                padding: `${design.spacing.lg} ${design.spacing.md}`,
                                boxSizing: 'border-box',
                            }}
                        >
                            <img
                                src={p.image}
                                alt={p.imageAlt}
                                style={{
                                    width: '100%',
                                    maxWidth: '220px',
                                    height: 'auto',
                                    margin: '0 auto',
                                    display: 'block',
                                }}
                            />
                            <p
                                style={{
                                    ...typography.headingSection,
                                    fontSize: design.font.sizeXl,
                                    margin: `${design.spacing.md} 0 ${design.spacing.xs}`,
                                }}
                            >
                                <Furigana text={p.main} />
                            </p>
                            <p style={{ ...typography.subText, fontSize: design.font.sizeMd, margin: 0, whiteSpace: 'pre-line' }}><Furigana text={p.sub} /></p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ⑤⑥ 使い方：アプリ画面例 | 3STEP（パネルなし） */}
            <section style={sectionPlain}>
                <h2
                    style={{
                        ...typography.headingSection,
                        fontSize: design.font.size3xl,
                        textAlign: 'center',
                        margin: `0 0 ${design.spacing.xl}`,
                    }}
                >
                    <Furigana text={lpContent.usage.heading} />
                </h2>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: isNarrow ? 'column' : 'row',
                        gap: design.spacing.lg,
                        alignItems: 'center',
                    }}
                >
                    {/* 画面例画像（設定＋結果を1枚にまとめたもの）。左ブロック内いっぱいに広げて大きく見せる */}
                    <div style={{ flex: 1.5, width: '100%', minWidth: 0 }}>
                        <img
                            src={lpContent.usage.image.src}
                            alt={lpContent.usage.image.alt}
                            style={{
                                width: '100%',
                                maxWidth: '580px',
                                height: 'auto',
                                margin: '0 auto',
                                display: 'block',
                                borderRadius: '0',
                                boxShadow: design.shadow.md,
                            }}
                        />
                    </div>
                    {/* 3ステップ（各STEPを個別パネルに） */}
                    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: design.spacing.md }}>
                        {lpContent.usage.steps.map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    background: design.color.surface,
                                    borderRadius: design.radius.md,
                                    boxShadow: design.shadow.md,
                                    padding: `${design.spacing.md} ${design.spacing.lg}`,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        fontSize: design.font.sizeSm,
                                        fontWeight: design.font.weightBold,
                                        color: design.color.primary,
                                        background: design.color.primaryLight,
                                        padding: `${design.spacing.xs} ${design.spacing.md}`,
                                        borderRadius: design.radius.full,
                                        marginBottom: design.spacing.sm,
                                    }}
                                >
                                    {s.no}
                                </span>
                                <p style={{ ...typography.subText, fontSize: design.font.sizeMd, color: design.color.textPrimary, whiteSpace: 'pre-line', margin: `${design.spacing.xs} 0 0` }}>
                                    <Furigana text={s.text} />
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 対応科目（科目ごとに白パネル・外枠パネルなし） */}
            <section style={sectionPlain}>
                <h2
                    style={{
                        ...typography.headingSection,
                        fontSize: design.font.size3xl,
                        textAlign: 'center',
                        margin: `0 0 ${design.spacing.lg}`,
                    }}
                >
                    <Furigana text={lpContent.subjects.heading} />
                </h2>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: design.spacing.md,
                        justifyContent: 'center',
                    }}
                >
                    {enabledSubjects.map((s) => (
                        <div
                            key={s.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: design.spacing.md,
                                width: '150px',
                                background: design.color.surface,
                                borderRadius: '0',
                                boxShadow: design.shadow.md,
                                padding: design.spacing.lg,
                                boxSizing: 'border-box',
                            }}
                        >
                            {/* 正方形イメージ画像（パネルはカード側が持つので画像自体は枠なし）
                                ※画像サイズは据え置き（maxWidth で従来の見た目を維持）。
                                パネルが大きくなる分、相対的に少し小さく見える。 */}
                            <div
                                style={{
                                    width: '100%',
                                    maxWidth: '108px',
                                    aspectRatio: '1 / 1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <img
                                    src={LP_SUBJECT_IMAGES[s.id]}
                                    alt={s.label}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                />
                            </div>
                            {/* 科目名（チップ枠なし・primary色・大きめテキスト） */}
                            <span
                                style={{
                                    color: design.color.primary,
                                    fontSize: design.font.sizeLg,
                                    fontWeight: design.font.weightBold,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
            </div>

            {/* ⑦ CTA（まずは1回）：別セクション。タイトルは背景なし、ボタンだけ全幅の白背景パネル */}
            <section style={{ ...sectionPlain, marginBottom: 0, paddingBottom: design.spacing.md }}>
                <p
                    style={{
                        ...typography.headingSection,
                        fontSize: design.font.size3xl,
                        textAlign: 'center',
                        margin: 0,
                    }}
                >
                    <Furigana text={lpContent.bottomCta.lead} />
                </p>
            </section>
            {/* ボタン部分：画面全幅の白背景パネル。ボタンはワイドなバー状にして左右の余白を埋める */}
            <div
                style={{
                    width: '100%',
                    background: design.color.surface,
                    boxShadow: design.shadow.md,
                    padding: `${design.spacing.xl} ${design.spacing.lg}`,
                    boxSizing: 'border-box',
                    marginBottom: design.spacing.md,
                }}
            >
                <Link
                    href={lpContent.appHref}
                    style={{
                        display: 'block',
                        maxWidth: '560px',
                        margin: '0 auto',
                        padding: design.spacing.md,
                        background: design.color.primary,
                        color: '#fff',
                        borderRadius: design.radius.md,
                        fontSize: design.font.sizeXl,
                        fontWeight: design.font.weightBold,
                        textDecoration: 'none',
                        textAlign: 'center',
                        boxShadow: design.shadow.md,
                    }}
                >
                    <Furigana text={lpContent.bottomCta.ctaLabel} />
                </Link>
            </div>

            <div>
            {/* ⑧ お知らせ（見出しは地色の上、リスト領域は全幅の白背景） */}
            <section style={{ ...sectionPlain, marginBottom: 0, paddingBottom: design.spacing.md }}>
                <h2
                    style={{
                        ...typography.headingSection,
                        fontSize: design.font.size2xl,
                        textAlign: 'center',
                        margin: 0,
                    }}
                >
                    <Furigana text={lpContent.news.heading} />
                </h2>
            </section>
            {/* リスト領域：画面全幅の白パネル（リスト自体は 560px 中央寄せ） */}
            <div
                style={{
                    width: '100%',
                    background: design.color.surface,
                    boxShadow: design.shadow.md,
                    padding: `${design.spacing.xl} ${design.spacing.lg}`,
                    boxSizing: 'border-box',
                }}
            >
                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '0 auto',
                        maxWidth: '560px',
                        // お知らせが増えても全体が縦に伸び続けないよう、
                        // この領域だけ高さを制限して内部スクロールにする。
                        // 1件の上下余白を sm に詰め、おおよそ3件でスクロールが始まる高さにする。
                        maxHeight: '150px',
                        overflowY: 'auto',
                    }}
                >
                    {newsItems.map((n, i) => (
                        <li
                            key={i}
                            style={{
                                display: 'flex',
                                flexDirection: isNarrow ? 'column' : 'row',
                                gap: design.spacing.sm,
                                padding: `${design.spacing.sm} 0`,
                                borderBottom: `1px solid ${design.color.border}`,
                            }}
                        >
                            <span style={{ ...typography.subTextMuted, minWidth: '6em' }}>{n.date}</span>
                            <span style={{ ...typography.subText, color: design.color.textPrimary }}>{n.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
            </div>

            <Footer />
        </div>
    )
}