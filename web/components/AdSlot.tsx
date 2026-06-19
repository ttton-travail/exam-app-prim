// ===========================
// 広告枠コンポーネント
// components/AdSlot.tsx
//
// AD_MODE（config.ts）で表示を切り替える：
//   'off'         … 何も出さない（DOMにも出さない）
//   'placeholder' … グレーの破線枠＋文言（レイアウト確認・審査前）
//   'live'        … 実際の AdSense 広告（審査通過後）
//
// 配置：設定画面の最下部・結果画面の最下部（レスポンシブバナー）。
// ★演習中(QuizScreen)には出さない（集中阻害・誤クリック誘発でポリシー違反リスク）。
// ===========================

'use client'

import { useEffect } from 'react'
import { styles, labels } from '@/lib/design'
import { AD_MODE, ADSENSE_CLIENT, ADSENSE_SLOTS } from '@/lib/config'

type SlotKey = keyof typeof ADSENSE_SLOTS

interface Props {
    // どの配置か（config.ts の ADSENSE_SLOTS のキー）
    slot: SlotKey
}

export default function AdSlot({ slot }: Props) {
    // live のときだけ adsbygoogle に push する（プレースホルダー/off では何もしない）
    useEffect(() => {
        if (AD_MODE !== 'live') return
        try {
            // @ts-expect-error adsbygoogle はスクリプト読み込み後に window に生える
            ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch {
            // 読み込み前など。次回レンダリングで再試行されるので握りつぶす。
        }
    }, [slot])

    // off：何も描画しない
    if (AD_MODE === 'off') return null

    // placeholder：グレー破線枠でレイアウトだけ確認
    if (AD_MODE === 'placeholder') {
        return (
            <div style={styles.adContainer}>
                <div style={styles.adPlaceholder}>{labels.ad.placeholder}</div>
            </div>
        )
    }

    // live：AdSense の ins タグ。client/slot が未設定なら安全に何も出さない。
    const slotId = ADSENSE_SLOTS[slot]
    if (!ADSENSE_CLIENT || !slotId) return null

    return (
        <div style={styles.adContainer}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={slotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    )
}