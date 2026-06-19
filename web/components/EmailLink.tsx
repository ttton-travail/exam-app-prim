// ===========================
// メールアドレス表示（スパムbot対策・テキスト版）
// components/EmailLink.tsx
//
// mailto リンクは使わず、テキストとして表示する。
// ・user と domain を分割で受け取り、クライアントでマウント後にJSで結合する
//   （SSR＝HTMLソースには完全なアドレスを残さない）。
// ・表示は「@」を「[at]」に置換した形（さらにbot収集を避ける）。
//   利用者は [at] を @ に読み替えてメールしてもらう想定。
// ※ 完全な対策ではないが、ソースを舐めるだけのbotには拾われにくい。
// ===========================

'use client'

import { useState, useEffect } from 'react'

interface Props {
    user: string
    domain: string
    // 表示テキストのスタイル（呼び出し側から渡す）
    style?: React.CSSProperties
    // 先頭に置く要素（アイコン等）。任意。
    icon?: React.ReactNode
}

export default function EmailLink({ user, domain, style, icon }: Props) {
    // マウント前は null（HTMLソースにアドレスを残さない）。マウント後にJSで結合。
    const [shown, setShown] = useState<string | null>(null)
    useEffect(() => {
        // 「@」を「[at]」に置換して表示（bot対策）
        setShown(`${user}[at]${domain}`)
    }, [user, domain])

    if (!shown) return null

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', ...style }}>
            {icon}
            <span>{shown}</span>
        </span>
    )
}