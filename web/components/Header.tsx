// ===========================
// 共通ヘッダー
// components/Header.tsx
//
// 画面端〜端の全幅ヘッダー（青グラデ＋白ロゴ・中央）。
// 各 phase（設定／結果 など）の最上部に置く。将来メニューを足す土台。
// ※ カードの外（main の外）に置くことで、背景余白を貫いて画面の端まで広がる。
// ===========================

'use client'

import Link from 'next/link'
import { design, labels } from '@/lib/design'
import { IMAGE_ASSETS } from '@/lib/assets'

export default function Header() {
    return (
        <header
            style={{
                width: '100%',
                background: `linear-gradient(110deg, ${design.color.primary}, ${design.color.primaryHover})`,
                padding: `${design.spacing.md} ${design.spacing.lg}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                boxShadow: design.shadow.header,
                position: 'relative',
                zIndex: 2,
            }}
        >
            {/* ロゴ（中央）。クリックでアプリのホーム（設定画面 /app）へ戻る。
                横長ロゴ(約4.7:1)なので幅基準。alt にアプリ名＋副題で読み上げ/SEO担保。 */}
            <Link href="/app" aria-label={`${labels.app.title} ${labels.app.subtitle}`} style={{ display: 'block', width: 'min(88%, 440px)' }}>
                <img
                    src={IMAGE_ASSETS.appLogo}
                    alt={`${labels.app.title} ${labels.app.subtitle}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                />
            </Link>
        </header>
    )
}