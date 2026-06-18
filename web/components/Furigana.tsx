// ===========================
// フリガナ表示コンポーネント
// components/Furigana.tsx
//
// 渡されたテキスト中の「フリガナ辞書(FURIGANA)」に載っている語を、
// 漢字部分にだけ <ruby>漢字<rt>よみ</rt></ruby> を付けて表示する。
//   ・送り仮名・かな部分にはフリガナを付けない。
//     例：辞書 {始める: 'はじめる'} → 「始」にだけ「はじ」を振り、「める」は素のまま。
//     例：辞書 {開始: 'かいし'}     → 「開始」全体に「かいし」。
//   ・かなで区切られた複数の漢字ブロックにも対応（例：読(よ)み書(か)き）。
//   ・改行(\n) は <br/> に変換。
//
// フッター／プライバシーポリシーなど、フリガナ不要の箇所では使わないこと。
// ===========================

import { Fragment, type ReactNode } from 'react'
import { FURIGANA, FURIGANA_KEYS } from '@/lib/design/furigana'

interface Props {
    text: string
}

const KANA_RE = /[\u3040-\u309F\u30A0-\u30FF\u30FCー]/

function isKana(ch: string): boolean {
    return KANA_RE.test(ch)
}

interface Seg {
    text: string
    kana: boolean
}

/** 語をかな/漢字の連続でセグメント分割する。 */
function segment(word: string): Seg[] {
    const segs: Seg[] = []
    let cur = ''
    let curKana: boolean | null = null
    for (const ch of word) {
        const k = isKana(ch)
        if (curKana === null) {
            cur = ch
            curKana = k
        } else if (k === curKana) {
            cur += ch
        } else {
            segs.push({ text: cur, kana: curKana })
            cur = ch
            curKana = k
        }
    }
    if (cur) segs.push({ text: cur, kana: curKana as boolean })
    return segs
}

interface RubySeg {
    text: string
    rt: string | null // null = かな部分（ふりがな無し）
}

/**
 * 語(word)と読み(reading)を対応付け、漢字セグメントにだけ読みを割り当てる。
 * かなセグメントは reading 側からも同じかなを消費していく。
 */
function assignRuby(word: string, reading: string): RubySeg[] {
    const segs = segment(word)
    let r = reading
    const out: RubySeg[] = []
    for (let i = 0; i < segs.length; i++) {
        const seg = segs[i]
        if (seg.kana) {
            if (r.startsWith(seg.text)) r = r.slice(seg.text.length)
            out.push({ text: seg.text, rt: null })
        } else {
            const next = segs[i + 1]
            let rt: string
            if (next && next.kana) {
                const idx = r.indexOf(next.text)
                if (idx >= 0) {
                    rt = r.slice(0, idx)
                    r = r.slice(idx)
                } else {
                    rt = r
                    r = ''
                }
            } else {
                rt = r
                r = ''
            }
            out.push({ text: seg.text, rt })
        }
    }
    return out
}

/** 1語ぶんの ReactNode（漢字部分のみ ruby）。 */
function wordNode(word: string, reading: string, key: string): ReactNode {
    const segs = assignRuby(word, reading)
    return (
        <Fragment key={key}>
            {segs.map((s, i) =>
                s.rt
                    ? (
                        <ruby key={i}>
                            {s.text}
                            <rt>{s.rt}</rt>
                        </ruby>
                    )
                    : <Fragment key={i}>{s.text}</Fragment>,
            )}
        </Fragment>
    )
}

/** 改行を <br/> に。 */
function plain(s: string, keyBase: string): ReactNode[] {
    const parts = s.split('\n')
    const out: ReactNode[] = []
    parts.forEach((p, idx) => {
        out.push(<Fragment key={`${keyBase}p${idx}`}>{p}</Fragment>)
        if (idx < parts.length - 1) out.push(<br key={`${keyBase}br${idx}`} />)
    })
    return out
}

/** テキスト全体を、辞書語は ruby 付き、それ以外は素のテキストに変換。 */
function toNodes(text: string): ReactNode[] {
    const nodes: ReactNode[] = []
    let i = 0
    let buf = ''
    const flush = (key: number) => {
        if (buf) {
            nodes.push(...plain(buf, `b${key}`))
            buf = ''
        }
    }
    while (i < text.length) {
        let matched = ''
        for (const k of FURIGANA_KEYS) {
            if (text.startsWith(k, i)) {
                matched = k
                break
            }
        }
        if (matched) {
            flush(i)
            nodes.push(wordNode(matched, FURIGANA[matched], `r${i}`))
            i += matched.length
        } else {
            buf += text[i]
            i += 1
        }
    }
    flush(i)
    return nodes
}

export default function Furigana({ text }: Props) {
    return <span>{toNodes(text)}</span>
}