// ===========================
// プライバシーポリシー ページ
// app/privacy/page.tsx
//
// AdSense審査の必須要件。運営者/収集情報/広告(Cookie)/アクセス解析/
// 第三者提供/免責/改定/制定日 を網羅する。
// 文言は本ファイル内に直接記述（法的文書のため一括管理）。
// ===========================

import type { Metadata } from 'next'
import { APP_NAME } from '@/lib/config'
import EmailLink from '@/components/EmailLink'

export const metadata: Metadata = {
    title: `プライバシーポリシー | ${APP_NAME}`,
    description: `${APP_NAME} のプライバシーポリシー`,
}

// 制定日（公開時に固定。改定時は改定履歴に追記する）
const ESTABLISHED = '2026年6月14日'
const OPERATOR = 'Ttton/TtLab'
// メールはスパムbot対策のため分割で保持し、EmailLink がクライアントで結合する。
const EMAIL_USER = 'contact'
const EMAIL_DOMAIN = 'ttton-notty.com'

const wrap: React.CSSProperties = {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '2rem 1.25rem 4rem',
    lineHeight: 1.9,
    color: '#1E293B',
    fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
    fontSize: '15px',
}
const h1: React.CSSProperties = { fontSize: '22px', fontWeight: 700, margin: '0 0 0.5rem' }
const lead: React.CSSProperties = { fontSize: '13px', color: '#64748B', margin: '0 0 2rem' }
const h2: React.CSSProperties = { fontSize: '17px', fontWeight: 700, margin: '2rem 0 0.5rem' }
const p: React.CSSProperties = { margin: '0 0 0.75rem' }
const a: React.CSSProperties = { color: '#0D9488' }

export default function PrivacyPolicyPage() {
    return (
        <main style={wrap}>
        <h1 style={h1}>プライバシーポリシー</h1>
        <p style={lead}>制定日：{ESTABLISHED}</p>

        <p style={p}>
            {OPERATOR}（以下「当方」といいます）は、当方が運営する学習アプリ「{APP_NAME}」（以下「本サービス」といいます）における、
            利用者の情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
        </p>

        <h2 style={h2}>1. 運営者</h2>
        <p style={p}>
            本サービスの運営者は {OPERATOR} です。本ポリシーに関するお問い合わせは、下記の連絡先までご連絡ください。
        </p>
        <p style={p}>
            連絡先：<EmailLink user={EMAIL_USER} domain={EMAIL_DOMAIN} style={{ color: '#1E293B' }} />
        </p>

        <h2 style={h2}>2. 取得する情報</h2>
        <p style={p}>
            本サービスは、原則として個人を直接特定する情報（氏名・住所・電話番号など）の入力を求めません。
            本サービスが取得し得る情報は、次のとおりです。
        </p>
        <p style={p}>
            ・利用者が投書箱（ご意見・ご要望フォーム）に任意で入力された内容。<br />
            ・利用者が選択した科目・単元・問題数などの操作情報。<br />
            ・ブラウザの保存領域（localStorage）に保存される、1日あたりの問題生成回数などの利用状況。<br />
            ・アクセスに伴い自動的に送信される情報（Cookie、IPアドレス、ブラウザの種類、閲覧日時など）。
        </p>

        <h2 style={h2}>3. 情報の利用目的</h2>
        <p style={p}>
            取得した情報は、本サービスの提供・維持・改善、利用状況の把握、不正利用の防止、
            およびお問い合わせへの対応のために利用します。投書箱に入力された内容は、サービス改善の参考とさせていただきます。
        </p>

        <h2 style={h2}>4. 広告の配信について</h2>
        <p style={p}>
            本サービスでは、第三者配信の広告サービスとして Google AdSense を利用する場合があります。
            Google などの第三者広告配信事業者は、Cookie を使用して、利用者の本サービスや他のウェブサイトへの過去のアクセス情報に基づいて
            広告を配信することがあります。
        </p>
        <p style={p}>
            利用者は、Google の広告設定（
            <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" style={a}>https://adssettings.google.com/</a>
            ）にアクセスすることで、パーソナライズ広告を無効にできます。また、
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={a}>www.aboutads.info</a>
            にアクセスすれば、第三者配信事業者の Cookie によるパーソナライズ広告を無効にできます。
        </p>
        <p style={p}>
            Google による広告 Cookie の利用については、Google の「
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={a}>
            広告に関するポリシー
            </a>
            」をご確認ください。
        </p>

        <h2 style={h2}>5. アクセス解析について</h2>
        <p style={p}>
            本サービスでは、サービス改善のためにアクセス解析ツールを利用する場合があります。これらのツールは
            Cookie を使用して利用状況を収集することがありますが、これにより個人を特定する情報が収集されることはありません。
        </p>

        <h2 style={h2}>6. Cookie の無効化</h2>
        <p style={p}>
            利用者は、ブラウザの設定により Cookie を無効化することができます。ただし、Cookie を無効にした場合、
            本サービスの一部機能が正しく動作しないことがあります。
        </p>

        <h2 style={h2}>7. 第三者への提供</h2>
        <p style={p}>
            当方は、法令に基づく場合を除き、取得した情報を利用者の同意なく第三者に提供することはありません。
            ただし、前述の広告配信・アクセス解析における Cookie 情報の取り扱いは、各事業者のポリシーに従います。
        </p>

        <h2 style={h2}>8. 免責事項</h2>
        <p style={p}>
            本サービスで出題される問題には、AI（生成系AIを含む）によって生成されたものが含まれます。
            当方は内容の正確性・完全性・有用性を保証するものではありません。
            本サービスの利用によって生じたいかなる損害についても、当方は責任を負いかねます。学習にあたっては、
            教科書や公式の資料等もあわせてご確認ください。
        </p>

        <h2 style={h2}>9. 本ポリシーの変更</h2>
        <p style={p}>
            当方は、必要に応じて本ポリシーを変更することがあります。変更後の本ポリシーは、本ページに掲載した時点から効力を生じるものとします。
        </p>

        <h2 style={h2}>10. お問い合わせ</h2>
        <p style={p}>
            本ポリシーに関するお問い合わせは、<EmailLink user={EMAIL_USER} domain={EMAIL_DOMAIN} style={{ color: '#1E293B' }} /> までご連絡ください。
        </p>

        <p style={{ ...p, marginTop: '2.5rem' }}>
            <a href="/" style={a}>← {APP_NAME} に戻る</a>
        </p>
        </main>
    )
}