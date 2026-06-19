// ===========================
// 日本地図／地方／東京23区／県の形 マップ コンポーネント
// components/JapanMap.tsx
//
//   kind='prefecture' → /assets/maps/japan-prefectures.svg（47都道府県）
//   kind='region'     → /assets/maps/japan-regions.svg（8地方区分）
//   kind='ward'       → /assets/maps/tokyo-wards.svg（東京23区）
//   kind='pref-shape' → /assets/maps/prefectures/{highlightMapNo}.svg（その県の形だけ）
//
// ・highlightMapNo … その番号の県／地方／区を強調（mode で active=ティール / correct=緑）
// ・showCapitals  … 県庁所在地ドットの表示ON/OFF。
//      日本地図（prefecture / region）では常に非表示（出題が地図全体のときは点を出さない）。
//      個別の県（pref-shape）では常に固定表示（黒）。
// ・background    … マップ背景色（各面は透明なのでアプリ側で指定）
// ・zoomable      … ホイール／ピンチ拡大、ドラッグ移動＋ +/- ボタン（既定OFF）
//
// 23区SVGの強調が効いていた仕組みを、都道府県・地方にも揃える：
//   1) 各県（data-mapno グループ）の面に白背景を敷く（強調されていない面も白塗り）。
//   2) 強調は path に fill だけでなく fill-opacity:1 も付け、SVG内CSSの
//      「fill-opacity:0」を確実に上書きする。
//   3) 数字とその丸は各グループから取り出し、まとめて最前面（badge-layer）へ移す。
//      （県を塗ると数字が背景に隠れてしまうのを防ぐ）
// ===========================

'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, WheelEvent, PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from 'react'

type MapKind = 'prefecture' | 'region' | 'ward' | 'pref-shape'

interface Props {
    kind?: MapKind
    highlightMapNo?: number
    mode?: 'active' | 'correct'
    showCapitals?: boolean
    maxWidth?: number
    background?: string
    /** ホイール／ピンチ拡大・ドラッグ移動＋ボタンを有効にする（既定OFF） */
    zoomable?: boolean
}

const ACTIVE_FILL = '#0D9488'
const CORRECT_FILL = '#16A34A'

// 強調していない県・地方・区の地色（白）。23区の見え方に揃える。
const BASE_FILL = '#FFFFFF'

const MIN_SCALE = 1
const MAX_SCALE = 6

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
    maxWidth = 720,
    background = 'transparent',
    zoomable = false,
}: Props) {
    const hostRef = useRef<HTMLDivElement>(null)

    // ズーム・パンの状態
    const [scale, setScale] = useState(1)
    const [tx, setTx] = useState(0)
    const [ty, setTy] = useState(0)
    const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
    const pinch = useRef<{ dist: number; scale: number } | null>(null)

    const url = svgUrl(kind, highlightMapNo)

    // ① SVG取得→挿入→下ごしらえ→強調付与
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
                prepareSvg(el, kind)
                applyView(el, { kind, highlightMapNo, mode, showCapitals })
            })
            .catch(() => {
                if (!cancelled && hostRef.current) hostRef.current.innerHTML = ''
            })
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url])

    // ② 強調・県庁ドットの更新（再取得なし）
    useEffect(() => {
        const host = hostRef.current
        if (!host || !host.querySelector('svg')) return
        applyView(host, { kind, highlightMapNo, mode, showCapitals })
    }, [kind, highlightMapNo, mode, showCapitals])

    // 拡大変更時、ズームを使わないなら位置をリセット
    useEffect(() => {
        if (!zoomable) {
            setScale(1); setTx(0); setTy(0)
        }
    }, [zoomable, url])

    const clamp = (v: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v))
    const zoomBy = (delta: number) => {
        setScale((cur) => {
            const next = clamp(cur + delta)
            if (next === 1) { setTx(0); setTy(0) }
            return next
        })
    }

    const onWheel = (e: WheelEvent) => {
        if (!zoomable) return
        e.preventDefault()
        // スクロールアップ（deltaY<0）でズームイン、ダウンでズームアウト
        const next = clamp(scale - e.deltaY * 0.0025)
        setScale(next)
        if (next === 1) { setTx(0); setTy(0) }
    }
    const onPointerDown = (e: ReactPointerEvent) => {
        if (!zoomable || scale === 1) return
        drag.current = { x: e.clientX, y: e.clientY, tx, ty }
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    }
    const onPointerMove = (e: ReactPointerEvent) => {
        if (!zoomable || !drag.current) return
        setTx(drag.current.tx + (e.clientX - drag.current.x))
        setTy(drag.current.ty + (e.clientY - drag.current.y))
    }
    const onPointerUp = () => { drag.current = null }

    const onTouchStart = (e: ReactTouchEvent) => {
        if (!zoomable || e.touches.length !== 2) return
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        pinch.current = { dist: Math.hypot(dx, dy), scale }
    }
    const onTouchMove = (e: ReactTouchEvent) => {
        if (!zoomable || !pinch.current || e.touches.length !== 2) return
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.hypot(dx, dy)
        const next = clamp(pinch.current.scale * (dist / pinch.current.dist))
        setScale(next)
        if (next === 1) { setTx(0); setTy(0) }
    }
    const onTouchEnd = () => { pinch.current = null }

    const reset = () => { setScale(1); setTx(0); setTy(0) }

    // 個別の県（pref-shape）はズーム不要なので、ズームUIは地図系のみ。
    const showZoomUi = zoomable && kind !== 'pref-shape'

    return (
        <div style={{ width: '100%', maxWidth, margin: '0 auto', position: 'relative' }}>
            <div
                style={{
                    width: '100%',
                    overflow: 'hidden',
                    background,
                    touchAction: zoomable ? 'none' : 'auto',
                    cursor: zoomable && scale > 1 ? 'grab' : 'default',
                }}
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    ref={hostRef}
                    style={{
                        width: '100%',
                        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: drag.current || pinch.current ? 'none' : 'transform 0.08s ease-out',
                    }}
                />
            </div>

            {/** ズーム操作ボタン（＋／−／もとに戻す）。スクロール／ピンチが使えない端末の保険にもなる。 */}
            {showZoomUi && (
                <div
                    style={{
                        position: 'absolute', top: 8, right: 8,
                        display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
                    }}
                >
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => zoomBy(0.6)} style={zoomBtnStyle} aria-label="ズームイン">＋</button>
                        <button onClick={() => zoomBy(-0.6)} style={zoomBtnStyle} aria-label="ズームアウト">−</button>
                    </div>
                    {scale > 1 && (
                        <button
                            onClick={reset}
                            style={{
                                padding: '4px 10px', fontSize: 12, borderRadius: 6,
                                border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155',
                                cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                            }}
                            aria-label="ズームをリセット"
                        >⟲ もとに戻す</button>
                    )}
                </div>
            )}
        </div>
    )
}

const zoomBtnStyle: CSSProperties = {
    width: 32, height: 32, lineHeight: '1',
    fontSize: 18, fontWeight: 700, borderRadius: 8,
    border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155',
    cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
}

/**
 * 挿入直後に1回だけ行う下ごしらえ（描画構造の組み替え）。
 *   ・寸法（width:100% / height:auto）を付与
 *   ・地図系（prefecture / region / ward）では
 *       - 各 data-mapno グループの面（path）に白背景を敷く
 *       - 「数字の丸 + 数字」を取り出して最前面の badge-layer へ集約
 *       - 県庁の赤点（小さい circle）には capital-dot 印を付ける
 */
function prepareSvg(host: HTMLElement, kind: MapKind) {
    const svgEl = host.querySelector('svg')
    if (!svgEl) return

    svgEl.setAttribute('width', '100%')
    svgEl.removeAttribute('height')
    const s = svgEl as unknown as SVGSVGElement
    s.style.width = '100%'
    s.style.height = 'auto'
    s.style.display = 'block'
    if (!svgEl.getAttribute('preserveAspectRatio')) {
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    // 個別の県（pref-shape）は構造をいじらない（自前のCSSで完結している）。
    if (kind === 'pref-shape') return

    const groups = Array.from(svgEl.querySelectorAll('[data-mapno]'))
    if (groups.length === 0) return

    const ns = 'http://www.w3.org/2000/svg'
    const badgeLayer = document.createElementNS(ns, 'g')
    badgeLayer.setAttribute('class', 'badge-layer')
    ;(badgeLayer as unknown as SVGGElement).style.pointerEvents = 'none'

    groups.forEach((g) => {
        const no = g.getAttribute('data-mapno') || ''

        // 1) 面に白背景を敷く（強調はあとで applyView が上書きする）。
        g.querySelectorAll('path').forEach((p: SVGPathElement) => {
            p.classList.add('mapface')
            p.style.setProperty('fill', BASE_FILL, 'important')
            p.style.setProperty('fill-opacity', '1', 'important')
        })

        // 2) circle を「番号バッジの丸」と「県庁の赤点」に仕分け（半径で判定）。
        g.querySelectorAll('circle').forEach((c: SVGCircleElement) => {
            const r = parseFloat(c.getAttribute('r') || '0')
            if (r > 0 && r <= 7) c.classList.add('capital-dot')
            else c.classList.add('num-badge')
        })

        // 3) 数字バッジの丸＋数字（text）を最前面 badge-layer へ移送し、番号で対応付け。
        g.querySelectorAll('circle.num-badge').forEach((c) => {
            c.setAttribute('data-badge-no', no)
            badgeLayer.appendChild(c)
        })
        g.querySelectorAll('text').forEach((t) => {
            t.setAttribute('data-badge-no', no)
            badgeLayer.appendChild(t)
        })
    })

    svgEl.appendChild(badgeLayer)
}

/** 挿入済みSVGに、強調・県庁ドットの状態を反映する（再取得なし）。 */
function applyView(
    host: HTMLElement,
    opts: { kind: MapKind; highlightMapNo?: number; mode: 'active' | 'correct'; showCapitals: boolean },
) {
    const svgEl = host.querySelector('svg')
    if (!svgEl) return

    // ---- 個別の県（pref-shape）----
    // 県庁の点は常に固定表示（黒）。強調は対象があれば必ず付ける。
    if (opts.kind === 'pref-shape') {
        const shape = svgEl.classList.contains('pref-shape')
            ? svgEl
            : svgEl.querySelector('.pref-shape')
        if (shape) {
            shape.classList.remove('is-active', 'is-correct')
            if (opts.highlightMapNo != null) {
                shape.classList.add(opts.mode === 'correct' ? 'is-correct' : 'is-active')
            }
        }
        // 県庁の点を黒系に（赤の既定を上書き）。点は常に表示。
        svgEl.querySelectorAll('.capital').forEach((c: Element) => {
            const el = c as SVGCircleElement
            el.style.setProperty('fill', '#1E293B', 'important')
            el.style.setProperty('stroke', '#FFFFFF', 'important')
            el.style.removeProperty('display')
        })
        return
    }

    // ---- 地図系（prefecture / region / ward）----
    svgEl.classList.toggle('show-capitals', !!opts.showCapitals)

    // いったん全グループを白（地色）へ戻す。
    svgEl.querySelectorAll('[data-mapno]').forEach((el: Element) => {
        el.classList.remove('is-active', 'is-correct')
        el.querySelectorAll('path.mapface').forEach((p: SVGPathElement) => {
            p.style.setProperty('fill', BASE_FILL, 'important')
            p.style.setProperty('fill-opacity', '1', 'important')
        })
    })

    // 県庁の点：日本地図（prefecture / region）では常に非表示。
    svgEl.querySelectorAll('.capital-dot').forEach((c: Element) => {
        (c as SVGCircleElement).style.setProperty('display', 'none', 'important')
    })

    // 対象の強調（active=ティール / correct=緑）。
    const wantNo = opts.highlightMapNo ?? null
    if (wantNo != null) {
        const target = svgEl.querySelector(`[data-mapno="${wantNo}"]`)
        if (target) {
            target.classList.add(opts.mode === 'correct' ? 'is-correct' : 'is-active')
            const fill = opts.mode === 'correct' ? CORRECT_FILL : ACTIVE_FILL
            target.querySelectorAll('path.mapface').forEach((p: SVGPathElement) => {
                p.style.setProperty('fill', fill, 'important')
                p.style.setProperty('fill-opacity', '1', 'important')
            })
        }
    }
}
