// ===========================
// フッター
// components/Footer.tsx
//
// ページ下部の共通フッター。設定画面・結果画面の下に置く（演習中は出さない）。
// レイアウト:
//   広い画面 … 2カラム（左=投書箱＋支援 / 右=連絡先・シェア）
//   狭い画面 … 縦積み（投書箱＋支援 → 連絡先・シェア）
//
// 支援セクションは投書箱の直下（左カラム）に配置。
// BuyMeACoffee の公式ボタン画像＋下に説明テキスト（どちらも同じ支援ページへ）。
// 各リンクは config の enabled フラグで表示制御（未完成のHP等を隠せる）。
// ===========================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { design, labels, typography, dividers } from '@/lib/design'
import { useResponsive } from '@/lib/useBreakpoint'
import { IMAGE_ASSETS } from '@/lib/assets'
import BrandIcon from '@/components/BrandIcon'
import AdSlot from '@/components/AdSlot'
import EmailLink from '@/components/EmailLink'
import {
    FEEDBACK_ENDPOINT,
    SUPPORT_LINKS,
    CONTACT_LINKS,
    CONTACT_EMAIL_USER,
    CONTACT_EMAIL_DOMAIN,
    SHOW_CONTACT_EMAIL,
    ENABLE_SHARE_BUTTONS,
    buildShareText,
} from '@/lib/config'

export default function Footer() {
    const { bp } = useResponsive()
    const isNarrow = bp === 'mobile'

    return (
        <footer style={styles.footer}>
            <div
                style={{
                    ...styles.inner,
                    flexDirection: isNarrow ? 'column' : 'row',
                    alignItems: isNarrow ? 'center' : 'stretch',
                }}
            >
                {/* 左カラム：投書箱 ＋ 支援 */}
                <div style={styles.col}>
                    <FeedbackForm />
                    <SupportBlock />
                </div>

                {/* 右カラム：シェア・開発者ページ
                    広い画面は左に垂直線、狭い画面は上に水平線で左カラムと区切る */}
                <div
                    style={{
                        ...styles.col,
                        ...(isNarrow
                            ? { ...dividers.h, marginTop: design.spacing.lg, paddingTop: design.spacing.lg }
                            : { ...dividers.v, paddingLeft: design.spacing.xl }),
                    }}
                >
                    <ContactBlock />
                </div>
            </div>

            {/* 広告（2カラムブロックの下・著作権表記の上）。AD_MODE で表示制御。 */}
            <AdSlot slot="footerBottom" />
            
            {/* LPに戻る */}
            <p style={styles.backLink}>
                <a href="/" style={styles.backAnchor}>{labels.footer.backLink}</a>
            </p>
            
            {/* プライバシーポリシー（©のすぐ上・同じフォントスタイル） */}
            <p style={styles.privacyLink}>
                <a href="/privacy" style={styles.privacyAnchor}>{labels.footer.privacyLink}</a>
            </p>

            <p style={styles.copyright}>
                {labels.footer.copyright.replace('{year}', String(new Date().getFullYear()))}
            </p>
        </footer>
    )
}

// ---- 投書箱フォーム ----
function FeedbackForm() {
    const [text, setText] = useState('')
    const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

    if (!FEEDBACK_ENDPOINT) return null

    const handleSubmit = async () => {
        const body = text.trim()
        if (!body || state === 'sending') return
        setState('sending')
        try {
            await fetch(FEEDBACK_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    message: body,
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                    url: typeof location !== 'undefined' ? location.href : '',
                    at: new Date().toISOString(),
                }),
            })
            setState('done')
            setText('')
        } catch {
            setState('error')
        }
    }

    return (
        <section style={styles.feedbackSection}>
            <p style={styles.blockTitle}>{labels.feedback.title}</p>
            <p style={styles.blockSubtitle}>{labels.feedback.subtitle}</p>

            {state === 'done' ? (
                <p style={styles.thanks}>{labels.feedback.thanks}</p>
            ) : (
                <>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={labels.feedback.placeholder}
                        rows={4}
                        style={styles.textarea}
                    />
                    {state === 'error' && <p style={styles.errorMsg}>{labels.feedback.error}</p>}
                    <button
                        onClick={handleSubmit}
                        disabled={!text.trim() || state === 'sending'}
                        style={{
                            ...styles.submitBtn,
                            ...((!text.trim() || state === 'sending') ? styles.submitBtnDisabled : {}),
                        }}
                    >
                        {state === 'sending' ? labels.feedback.submitting : labels.feedback.submit}
                    </button>
                </>
            )}
        </section>
    )
}

// ---- 支援（BuyMeACoffee等） ----
function SupportBlock() {
    const supports = SUPPORT_LINKS.filter((s) => s.enabled && s.url)
    if (supports.length === 0) return null

    return (
        <section style={styles.supportSection}>
            <p style={{ ...styles.blockTitle, marginBottom: design.spacing.sm }}>{labels.support.title}</p>
            <div style={styles.supportList}>
                {supports.map((s) => {
                    const text = labels.support.items[s.id] ?? ''
                    return (
                        <a
                            key={s.id}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.supportItem}
                        >
                            {s.icon && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={s.icon} alt={text} style={styles.supportImg} />
                            )}
                            <span style={styles.iconSubText}>{text}</span>
                        </a>
                    )
                })}
            </div>
        </section>
    )
}

// ---- 連絡先・シェア ----
function ContactBlock() {
    const contacts = CONTACT_LINKS.filter((c) => c.enabled && c.url)

    // シェアURLはクライアントでマウント後に確定させる（SSRとの不一致＝hydration mismatch回避）
    const [shareUrl, setShareUrl] = useState('')
    useEffect(() => {
        setShareUrl(location.href)
    }, [])

    const showContacts = contacts.length > 0 || SHOW_CONTACT_EMAIL
    const showShare = ENABLE_SHARE_BUTTONS
    if (!showContacts && !showShare) return null

    // 各SNSのシェアURL（shareUrl 未確定時はトップへのフォールバック）
    const xHref = shareUrl
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText(shareUrl))}`
        : 'https://twitter.com/intent/tweet'
    const lineHref = shareUrl
        ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`
        : 'https://social-plugins.line.me/lineit/share'
    const fbHref = shareUrl
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        : 'https://www.facebook.com/sharer/sharer.php'

    return (
        <section>
            {/* シェア（中央揃え・アイコンのみ横並び：X / LINE / Facebook） */}
            {showShare && (
                <div style={styles.shareBlock}>
                    <p style={{ ...styles.blockTitle, marginBottom: design.spacing.sm }}>{labels.footer.shareIntro}</p>
                    <div style={styles.shareRow}>
                        <a href={xHref} target="_blank" rel="noopener noreferrer"
                           style={styles.shareIcon} aria-label="X でシェア">
                            <BrandIcon name="x" size={24} title="X でシェア" />
                        </a>
                        <a href={lineHref} target="_blank" rel="noopener noreferrer"
                           style={styles.shareIcon} aria-label="LINE でシェア">
                            <BrandIcon name="line" size={24} title="LINE でシェア" />
                        </a>
                        <a href={fbHref} target="_blank" rel="noopener noreferrer"
                           style={styles.shareIcon} aria-label="Facebook でシェア">
                            <BrandIcon name="facebook" size={24} title="Facebook でシェア" />
                        </a>
                    </div>
                    {/* アイコンの下にサブテキスト（支援の「(投げ銭支援)」と同じ書式） */}
                    <p style={styles.iconSubText}>{labels.footer.shareTitle}</p>
                </div>
            )}

            {/* 開発者ページ（シェアの下・上に区切り線） */}
            {showContacts && (
                <div
                    style={{
                        ...styles.subBlock,
                        ...(showShare
                            ? { ...dividers.h, marginTop: design.spacing.lg, paddingTop: design.spacing.lg }
                            : {}),
                    }}
                >
                    <p style={{ ...styles.blockTitle, marginBottom: design.spacing.sm }}>{labels.footer.contactTitle}</p>
                    <div style={styles.linkList}>
                        {contacts.map((c) => (
                            <a
                                key={c.id}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.contactLink}
                            >
                                {c.icon && <BrandIcon name={c.icon} size={16} title={c.label} />}
                                <span>{c.label}</span>
                            </a>
                        ))}
                        <ContactEmail />
                    </div>
                </div>
            )}
        </section>
    )
}

// ---- メールアドレス（スパムbot対策：JSで動的に組み立て、SSRソースには出さない） ----
function ContactEmail() {
    if (!SHOW_CONTACT_EMAIL) return null
    return (
        <EmailLink
            user={CONTACT_EMAIL_USER}
            domain={CONTACT_EMAIL_DOMAIN}
            style={styles.contactText}
            icon={<BrandIcon name="mail" size={16} title="メール" />}
        />
    )
}

const styles: Record<string, React.CSSProperties> = {
    footer: {
        width: '100%',
        maxWidth: '640px',
        margin: '0 auto',
        padding: design.spacing.lg,
        boxSizing: 'border-box',
        borderTop: `1px solid #CBD5E1`,
        marginTop: design.spacing.xl,
    },
    inner: {
        display: 'flex',
        gap: design.spacing.xl,
        alignItems: 'flex-start',
    },
    col: {
        flex: 1,
        minWidth: 0,
    },
    // セクション見出し（共通プリセット参照）
    blockTitle: { ...typography.headingSection },
    // 投書箱：タイトル・副題を中央揃え
    feedbackSection: {
        textAlign: 'center',
    },
    blockSubtitle: { ...typography.subText },
    textarea: {
        width: '100%',
        boxSizing: 'border-box',
        padding: design.spacing.sm,
        borderRadius: design.radius.md,
        border: `1px solid #CBD5E1`,
        backgroundColor: design.color.surface,
        color: design.color.textPrimary,
        fontSize: design.font.sizeSm,
        fontFamily: design.font.family,
        resize: 'vertical',
    },
    submitBtn: {
        marginTop: design.spacing.sm,
        width: '100%',
        padding: `${design.spacing.sm} ${design.spacing.md}`,
        borderRadius: design.radius.lg,
        border: 'none',
        backgroundColor: design.color.primary,
        color: '#FFFFFF',
        fontSize: design.font.sizeSm,
        fontWeight: design.font.weightMedium,
        cursor: 'pointer',
    },
    submitBtnDisabled: {
        backgroundColor: design.color.disabled,
        cursor: 'not-allowed',
    },
    thanks: {
        whiteSpace: 'pre-line',
        fontSize: design.font.sizeSm,
        color: design.color.success,
        padding: design.spacing.sm,
        margin: 0,
    },
    errorMsg: {
        fontSize: design.font.sizeXs,
        color: design.color.error,
        margin: `${design.spacing.xs} 0 0`,
    },
    // 支援セクション（投書箱の下・中央寄せ）
    supportSection: {
        ...dividers.h,
        marginTop: design.spacing.lg,
        paddingTop: design.spacing.lg,
        textAlign: 'center',
    },
    supportList: {
        display: 'flex',
        flexDirection: 'column',
        gap: design.spacing.md,
        alignItems: 'center',
    },
    // 画像＋下のテキストを縦に
    supportItem: {
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        textDecoration: 'none',
    },
    supportImg: {
        height: '44px',
        width: 'auto',
        display: 'block',
    },
    // アイコン下のサブテキスト（支援「(投げ銭支援)」とシェア「SNSでシェア」で共通）
    // アイコン下のサブテキスト（支援「(投げ銭支援)」とシェア「SNSでシェア」で共通）
    // 共通プリセット subText を、アイコン下用に上マージンだけ調整
    iconSubText: {
        ...typography.subText,
        margin: `${design.spacing.xs} 0 0`,
    },
    // 右カラム全体も中央揃え
    subBlock: {
        marginBottom: design.spacing.md,
        textAlign: 'center',
    },
    linkList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        alignItems: 'center',
    },
    contactLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: design.spacing.xs,
        fontSize: design.font.sizeSm,
        color: design.color.primary,
        textDecoration: 'none',
    },
    contactText: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: design.spacing.xs,
        fontSize: design.font.sizeSm,
        color: design.color.textSecondary,
    },
    // シェアブロック（中央揃え・アイコンのみ横並び）
    shareBlock: {
        marginBottom: design.spacing.md,
        textAlign: 'center',
    },
    shareRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: design.spacing.md,
        marginTop: design.spacing.xs,
    },
    shareIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
    },
    /** 紹介ページへ戻るテキストリンク */
    backLink: {
        marginTop: design.spacing.lg,
        textAlign: 'center',
        fontSize: design.font.sizeXs,
        color: design.color.textMuted,
    },
    backAnchor: {
        color: design.color.textMuted,
        textDecoration: 'underline',
    },
    privacyLink: {
        marginTop: design.spacing.sm,
        textAlign: 'center',
        fontSize: design.font.sizeXs,
        color: design.color.textMuted,
    },
    privacyAnchor: {
        color: design.color.textMuted,
        textDecoration: 'underline',
    },
    copyright: {
        marginTop: design.spacing.sm,
        textAlign: 'center',
        fontSize: design.font.sizeXs,
        color: design.color.textMuted,
    },
}