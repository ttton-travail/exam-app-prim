// ===========================
// PWA マニフェスト（ホーム画面追加・スタンドアロン起動用）
// app/manifest.ts
//
// Next.js（App Router）の規約ファイル。ビルド時に /manifest.webmanifest として
// 自動配信され、<link rel="manifest"> も自動で <head> に挿入される。
// 名前・説明・短縮名は config.ts、テーマ色は design トークンから取得するので、
// このファイル自体は系列アプリ（prim / exam-app）で同一のまま使い回せる。
//
// 【重要】アイコンPNGが必須。SVG（app/icon.svg）だけではホーム画面追加で
// アイコンが出ない端末が多い。public/ 配下に以下を用意すること:
//   public/icon-192.png           … 192x192（通常アイコン）
//   public/icon-512.png           … 512x512（通常アイコン）
//   public/icon-maskable-512.png  … 512x512（Android のマスカブル用・中央に余白）
// まだ用意できていない画像の icons エントリは、404 を避けるため一旦コメントアウトする。
// ===========================

import type { MetadataRoute } from 'next'
import { APP_NAME, APP_SHORT_NAME, APP_DESCRIPTION } from '@/lib/config'
import { design } from '@/lib/design/tokens'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: APP_NAME,
        // ホーム画面のアイコン下に出る短い名前（長いと省略されるため簡潔に）。
        short_name: APP_SHORT_NAME,
        description: APP_DESCRIPTION,
        // 起動時に開くURL。ルート（LP）から開始する。
        start_url: '/',
        // PWAとして扱うスコープ。配下すべてをアプリ内ナビ扱いにする。
        scope: '/',
        // standalone = ブラウザのUIを隠してアプリ風に起動。
        display: 'standalone',
        lang: 'ja',
        // 起動直後のスプラッシュ背景（白）とテーマ色（各アプリのプライマリ色）。
        background_color: '#FFFFFF',
        theme_color: design.color.primary,
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                // Android のアダプティブアイコン用（中央に余白をもたせた版）。
                src: '/icon-maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
