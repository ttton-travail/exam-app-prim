// ===========================
// 日本地図／東京23区マップ コンポーネント
// components/JapanMap.tsx
//
// 正確形状の静的SVGを読み込んで描画する。
//   kind='prefecture' → public/assets/maps/japan-prefectures.svg（47都道府県）
//   kind='ward'       → public/assets/maps/tokyo-wards.svg（東京23区）
//
// ・highlightMapNo … その番号の県／区を強調（mode で active=ティール / correct=緑）
// ・showCapitals  … 県庁所在地ドットの表示ON/OFF（prefecture のみ意味を持つ）
// ・PC/スマホとも width:100% で追従（SVGが viewBox を持つため自動スケール）。
//
// SVG側I/F：<g class="pref" data-mapno="N"> ＋ CSSクラス
//   is-active(ティール) / is-correct(緑) / show-capitals。
// SVGを精緻版へ差し替えても、この I/F が同じなら本体は無改造。
// ===========================

'use client'

import { useEffect, useRef, useState } from 'react'

type MapKind = 'prefecture' | 'ward'

interface Props {
    /** 描画する地図の種類（既定は都道府県） */
    kind?: MapKind
    /** 強調する地図番号（都道府県=JISコード1〜47／区=1〜23）。未指定なら強調なし */
    highlightMapNo?: number
    /** 強調の意味：回答中=active（ティール）／正解表示=correct（緑） */
    mode?: 'active' | 'correct'
    /** 県庁所在地ドットを表示するか（prefecture のみ） */
    showCapitals?: boolean
    /** 最大表示幅（px）。既定はカード幅に合わせて 560。 */
    maxWidth?: number
}

const SVG_URL: Record<MapKind, string> = {
    prefecture: '/assets/maps/japan-prefectures.svg',
    ward: '/assets/maps/tokyo-wards.svg',
}

export default function JapanMap({
    kind = 'prefecture',
    highlightMapNo,
    mode = 'active',
    showCapitals = false,
    maxWidth = 560,
}: Props) {
    const hostRef = useRef<HTMLDivElement>(null)
    const [svg, setSvg] = useState<string>('')

    // SVG本文を取得して inline 展開（data-* で個別操作できるようにするため img ではなく inline）
    useEffect(() => {
        let cancelled = false
        setSvg('')
        fetch(SVG_URL[kind])
        .then((res) => res.text())
        .then((text) => {
            if (!cancelled) setSvg(text)
        })
        .catch(() => {
            if (!cancelled) setSvg('')
        })
        return () => {
        cancelled = true
        }
    }, [kind])

    // 強調・県庁ドットの反映（svg差し替え・props変化のたびにクラスを付け直す）
    useEffect(() => {
        const host = hostRef.current
        if (!host) return
        const svgEl = host.querySelector('svg')
        if (!svgEl) return

        // 県庁ドット表示（prefecture のSVGのみ .show-capitals に反応する）
        svgEl.classList.toggle('show-capitals', !!showCapitals)

        // いったん全クリア
        host.querySelectorAll('g.pref').forEach((g) => {
            g.classList.remove('is-active', 'is-correct')
        })
        // 対象を強調
        if (highlightMapNo != null) {
            const target = host.querySelector(`g.pref[data-mapno="${highlightMapNo}"]`)
            if (target) {
                target.classList.add(mode === 'correct' ? 'is-correct' : 'is-active')
            }
        }
    }, [svg, highlightMapNo, mode, showCapitals])

    return (
        <div
        ref={hostRef}
        style={{ width: '100%', maxWidth, margin: '0 auto' }}
        // SVGはこちらが用意した静的アセット（外部入力ではない）ため挿入は安全
        dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}