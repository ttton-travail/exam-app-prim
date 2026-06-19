// ===========================
// 全ページ共通レイアウト
// app/layout.tsx
// ===========================

import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { APP_NAME, APP_SHORT_NAME, APP_TITLE_FULL, APP_DESCRIPTION, SITE_URL, SEO_KEYWORDS, AD_MODE, ADSENSE_CLIENT } from '@/lib/config'
import { design } from '@/lib/design/tokens'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: APP_TITLE_FULL,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  // PWA マニフェスト（app/manifest.ts が /manifest.webmanifest を生成）。
  manifest: '/manifest.webmanifest',
  // iOS はマニフェストを十分に解釈しないため Apple 用メタも併せて出す。
  // Apple Touch Icon は app/apple-icon.png（180x180）を置くと自動でリンクされる。
  appleWebApp: {
    capable: true,
    title: APP_SHORT_NAME,
    statusBarStyle: 'default',
  },
  authors: [{ name: 'Ttton/TtLab' }],
  creator: 'Ttton/TtLab',
  applicationName: APP_NAME,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: APP_NAME,
    title: APP_TITLE_FULL,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: APP_TITLE_FULL,
    description: APP_DESCRIPTION,
    creator: '@Ttton_nottY',
  },
}

// ブラウザのアドレスバー等の色（PWAテーマ色）。Next では viewport 側で指定する。
// 各アプリの design トークンのプライマリ色を使う（manifest の theme_color と揃える）。
export const viewport: Viewport = {
  themeColor: design.color.primary,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // AdSense スクリプトの読み込み条件。
  // ADSENSE_CLIENT が設定されていれば読み込む（審査用スニペット＝配信用スクリプトを兼ねる）。
  // 審査段階では AD_MODE='placeholder' のままでよい（広告枠はダミー表示、スニペットだけ先に読ませる）。
  // 完全に止めたい場合は AD_MODE='off' にする。
  const loadAdsense = AD_MODE !== 'off' && !!ADSENSE_CLIENT

  return (
    <html lang="ja">
      <head>
        {/* AdSense 審査用スニペット（＝配信用スクリプト）。
            審査クローラが JS 実行前の生HTMLで確実に検出できるよう、<head> 内に生 <script> として置く。
            next/script ではなく素の script を使う（afterInteractive だと body 末尾に出てクローラに拾われないため）。 */}
        {loadAdsense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        {/* 構造化データ（JSON-LD）：教育系Webアプリとして検索エンジンに伝える */}
        <Script
          id="jsonld-webapp"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: APP_NAME,
              alternateName: '1Clickでおべんきょう',
              url: SITE_URL,
              description: APP_DESCRIPTION,
              applicationCategory: 'EducationApplication',
              operatingSystem: 'Web',
              inLanguage: 'ja',
              author: { '@type': 'Organization', name: 'Ttton/TtLab' },
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}