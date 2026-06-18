// ===========================
// 日本地図／地方／東京23区／県の形 マップ コンポーネント
// components/JapanMap.tsx
//
// 正確形状の静的SVGを読み込んで描画する。
//   kind='prefecture' → /assets/maps/japan-prefectures.svg（47都道府県）
//   kind='region'     → /assets/maps/japan-regions.svg（8地方区分）
//   kind='ward'       → /assets/maps/tokyo-wards.svg（東京23区）
//   kind='pref-shape' → /assets/maps/prefectures/{highlightMapNo}.svg（その県の形だけ）
//
// ・highlightMapNo … その番号の県／地方／区を強調（mode で active=ティール / correct=緑）
// ・showCapitals  … 県庁所在地ドットの表示ON/OFF（prefecture のみ意味を持つ。既定OFF）
// ・background    … マップの背景色。SVGの各面は透明なので、ここで背景を指定する。
// ・PC/スマホとも width:100% で追従。
//
// 実装メモ：
//   ・SVGは fetch して ref の <div> に直接 innerHTML 挿入する（dangerouslySetInnerHTML
//     は使わない）。これにより「挿入→寸法付与→強調付与」の順序が保証され、
//     React再描画でDOM変更が消える問題を避けられる。
//   ・挿入したSVGは viewBox のみで width/height を持たないことがあり、そのままだと
//     高さが潰れて表示されない。必ず width:100%/height:auto を付与する。
//   ・強調は data-mapno で対象を選び、色は直接スタイルで注入する（SVG内CSSの
//     is-active/is-correct が無くても動作。Illustrator書き出しSVGにも強い）。
// ===========================

'use client'

import { useEffect, useRef } from 'react'

type MapKind = 'prefecture' | 'region' | 'ward' | 'pref-shape'

interface Props {
    /** 描画する地図の種類（既定は都道府県） */
    kind?: MapKind
    /** 強調する地図番号（都道府県/県の形=JISコード1〜47／地方=1〜8／区=1〜23） */
    highlightMapNo?: number
    /** 強調の意味：回答中=active（ティール）／正解表示=correct（緑） */
    mode?: 'active' | 'correct'
    /** 県庁所在地ドットを表示するか（prefecture のみ。既定OFF＝常時表示ではない） */
    showCapitals?: boolean
    /** 最大表示幅（px）。既定はカード幅に合わせて 560。 */
    maxWidth?: number
    /** マップの背景色（各面は透明なのでアプリ側で指定）。既定は透明。 */
    background?: string
}

const ACTIVE_FILL = '#0D9488'
const CORRECT_FILL = '#16A34A'
const ACTIVE_BADGE = '#0F766E'
const CORRECT_BADGE = '#15803D'

function svgUrl(kind: MapKind, highlightMapNo?: number): string {
    switch (kind) {
        case 'prefecture':
            return '/assets/maps/japan-prefectures.svg'
        case 'region':
            return '/assets/maps/japan-regions.svg'
        case 'ward':
            return '/assets/maps/tokyo-wards.svg'
        case 'pref-shape':
            return `/assets/maps/prefectures/${highlightMapNo ?? 1}.svg`
    }
}

export default function JapanMap({
    kind = 'prefecture',
    highlightMapNo,
    mode = 'active',
    showCapitals = false,
    maxWidth = 560,
    background = 'transparent',
}: Props) {
    const hostRef = useRef<HTMLDivElement>(null)

    const url = svgUrl(kind, highlightMapNo)

    // ① SVG を取得して ref の div に直接挿入し、寸法と強調を付与する。
    useEffect(() => {
        let cancelled = false
        const host = hostRef.current
        if (!host) return

        fetch(url)
            .then((res) => res.text())
            .then((text) => {
                if (cancelled || !hostRef.current) return
                const el = hostRef.current
                el.innerHTML = text
                applyView(el, { kind, highlightMapNo, mode, showCapitals })
            })
            .catch(() => {
                if (!cancelled && hostRef.current) hostRef.current.innerHTML = ''
            })

        return () => {
            cancelled = true
        }
        // url が変われば再取得。強調系の変化は②で軽量に反映する。
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url])

    // ② 強調・県庁ドットだけを更新（再取得なしで反映）。
    useEffect(() => {
        const host = hostRef.current
        if (!host) return
        if (!host.querySelector('svg')) return
        applyView(host, { kind, highlightMapNo, mode, showCapitals })
    }, [kind, highlightMapNo, mode, showCapitals])

    return (
        <div
            ref={hostRef}
            style={{ width: '100%', maxWidth, margin: '0 auto', background }}
        />
    )
}

/** 挿入済みSVGに、寸法・県庁ドット・強調を反映する。 */
function applyView(
    host: HTMLElement,
    opts: { kind: MapKind; highlightMapNo?: number; mode: 'active' | 'correct'; showCapitals: boolean },
) {
    const svgEl = host.querySelector('svg')
    if (!svgEl) return

    // 寸法：viewBox のみで width/height を持たないと高さが潰れるため必ず付与。
    svgEl.setAttribute('width', '100%')
    svgEl.removeAttribute('height')
    const s = svgEl as unknown as SVGSVGElement
    s.style.width = '100%'
    s.style.height = 'auto'
    s.style.display = 'block'
    if (!svgEl.getAttribute('preserveAspectRatio')) {
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    // 県庁ドット（prefecture のSVGのみ .show-capitals に反応）
    svgEl.classList.toggle('show-capitals', !!opts.showCapitals)

    // いったん全クリア（class と直接スタイルの両方）
    host.querySelectorAll('[data-mapno]').forEach((el: Element) => {
        el.classList.remove('is-active', 'is-correct')
        el.querySelectorAll('path').forEach((p: SVGPathElement) => p.style.removeProperty('fill'))
        el.querySelectorAll('circle').forEach((b: SVGCircleElement) => {
            if (b.classList.contains('badge-bg')) b.style.removeProperty('fill')
        })
    })

    // pref-shape は形の表示のみ（塗らない）。それ以外は対象を強調。
    const wantNo = opts.kind === 'pref-shape' ? null : (opts.highlightMapNo ?? null)
    if (wantNo != null) {
        const target = host.querySelector(`[data-mapno="${wantNo}"]`)
        if (target) {
            target.classList.add(opts.mode === 'correct' ? 'is-correct' : 'is-active')
            const fill = opts.mode === 'correct' ? CORRECT_FILL : ACTIVE_FILL
            const badge = opts.mode === 'correct' ? CORRECT_BADGE : ACTIVE_BADGE
            target.querySelectorAll('path').forEach((p: SVGPathElement) => {
                p.style.setProperty('fill', fill, 'important')
            })
            target.querySelectorAll('circle').forEach((b: SVGCircleElement) => {
                if (b.classList.contains('badge-bg')) b.style.setProperty('fill', badge, 'important')
            })
        }
    }
}