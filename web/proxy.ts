// ===========================
// 公開制御プロキシ（旧 middleware.ts）
// proxy.ts （プロジェクトのルート＝web/ 直下に置く）
//
// Next.js 16 で「middleware」ファイル規約は非推奨となり「proxy」に改名された。
// ロジックは変更なし（リネームのみ）。Edge固有機能は使っていないため安全に移行可能。
//
// 環境変数 SITE_MODE で公開状態を切り替える。Vercel無料プランでも動作する。
//
//   SITE_MODE=closed   … 完全遮断。誰がアクセスしても「準備中」を表示（APIも止まる）
//   SITE_MODE=review   … 閲覧は可・新規AI生成のみ停止（AdSense審査用）
//   SITE_MODE=open     … 通常公開（未設定時もこれ）
//
// closed/review はGeminiやSupabaseへのアクセスを抑え、想定外の課金を防ぐ。
// ===========================

import { NextRequest, NextResponse } from 'next/server'

const MODE = process.env.SITE_MODE ?? 'open'

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    // 静的アセットや内部ファイルは常に通す（準備中ページの表示に必要）
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/icon') ||
        pathname === '/maintenance'
    ) {
        return NextResponse.next()
    }

    // 完全遮断：全アクセスを「準備中」ページへ
    if (MODE === 'closed') {
        // APIは即座にブロック（課金を防ぐ）
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: '現在準備中です。公開までお待ちください。' },
                { status: 503 },
            )
        }
        // 画面アクセスは準備中ページへ書き換え
        return NextResponse.rewrite(new URL('/maintenance', req.url))
    }

    // 審査モード：閲覧は許可。新規AI生成は generate route 側で停止する。
    //   ※ ストック出題も /api/generate 経由のため、ここで generate を全ブロックすると
    //     ストックまで止まってしまう。よって route 内で「ストックは返す・生成だけ停止」を判定する。
    if (MODE === 'review') {
        return NextResponse.next()
    }

    // 通常公開
    return NextResponse.next()
}

// プロキシを適用するパス（静的ファイルを除く全体）
export const config = {
    matcher: ['/((?!_next/static|_next/image).*)'],
}