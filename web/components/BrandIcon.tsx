// ===========================
// ブランドアイコン表示
// components/BrandIcon.tsx
//
// lib/assets.ts の BRAND_ICONS に登録したSNS等のロゴSVGを表示する。
// color 未指定ならブランド公式カラーで塗る。
// ===========================

import { BRAND_ICONS } from '@/lib/assets'

interface Props {
    name: string          // BRAND_ICONS のキー（'x' | 'line' | ...）
    size?: number
    color?: string        // 未指定はブランドカラー
    title?: string
}

export default function BrandIcon({ name, size = 18, color, title }: Props) {
    const icon = BRAND_ICONS[name]
    if (!icon) return null
    return (
        <svg
            width={size}
            height={size}
            viewBox={icon.viewBox || '0 0 24 24'}
            fill={color || icon.brandColor}
            role={title ? 'img' : 'presentation'}
            aria-label={title}
            aria-hidden={title ? undefined : true}
            style={{ flexShrink: 0 }}
        >
            {title && <title>{title}</title>}
            <path d={icon.path} />
        </svg>
    )
}