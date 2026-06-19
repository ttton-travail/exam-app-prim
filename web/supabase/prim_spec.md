# prim-exam-app 仕様書（確定版）

「かたてスト -小学生社会版-」／鋳型（既存 katatest）からの派生アプリ

---

## 0. 基本情報

| 項目 | 値 |
|---|---|
| アプリ名（仮） | かたてスト -小学生社会版- |
| リポジトリ/親フォルダ | `prim-exam-app` |
| ターゲット | 小学4年生中心（社会） |
| 鋳型 | 既存 katatest を丸ごとコピペ（`.git` は要削除→`git init`し直し） |
| Supabase | 既存プロジェクトを共用。テーブルは `prim_` 接頭辞で区別 |
| 出題 | ストック（マスタ）からの動的生成のみ。AI生成はコードは残すがUI非表示 |

---

## 1. デザイン

- **プライマリカラー：案A ティール**
  - `primary: #0D9488` / `primaryHover: #0F766E` / `primaryLight: #F0FDFA`
  - 変更は `lib/design/tokens.ts` の `color` のみ。`selected* / borderFocus` の青参照も合わせて差し替え。
- ロゴ文字色は白・黒の両方を用意し背景で出し分け（既存踏襲）。
- LP・ロゴ画像は当面そのまま（同名ファイルで後日差し替え予定）。

## 2. 表記

- 難しい漢字はひらがな化 or フリガナ。
- **フリガナ ON/OFF をヘッダー右にスライドスイッチ（チップ型）で配置。**
  - Header を `justify-content: space-between` 等にしてロゴ中央＋右にスイッチ。
  - 状態は localStorage 保持（既存 `useDailyLimit` と同じ永続化流儀）。
  - 表記は `<ruby>漢字<rt>かんじ</rt></ruby>` を使い、OFF時は `rt` を非表示。
  - マスタに `*_kana` を必ず持たせる。

## 3. 単元構成（科目=大テーマ / 単元=出題形式）

学習学年順に並べる：**都道府県 → 県庁所在地 → 地方 → 特産品 ＋ 23区（最後）**

- **科目: 都道府県**
  - 地図→名前 / 名前→地図 / 県→県庁所在地
  - 地図＋県＋県庁の正しい組 / 県＋県庁の正しい組
- **科目: 県庁所在地**（※都道府県と統合運用も可。並び上は次位）
- **科目: 地方**
  - 地図→地方 / 地方→地図 / 地方→県 / 県→地方
- **科目: 特産品**
  - 県→特産品 / 地図＋県＋特産の正しい組 / 県＋特産の正しい組
  - 地図＋県＋県庁＋特産の正しい組 / 県＋県庁＋特産の正しい組
- **科目: 東京23区**
  - 地図→名前 / 名前→地図

> group は `prim_social` 1つでよい。`SUBJECT_GROUPS` は1行。
> `subjects.ts` / `SettingScreen.tsx` は構造維持・中身差し替えのみ。

## 4. 問題数

- 既存の 5 / 10 / 20
- 上限が決まっている単元（都道府県47・地方・23区）は「すべての◯◯」も選択肢に追加。

## 5. データ設計（Supabase / `prim_` 接頭辞）

### prim_prefectures
| 列 | 型 | 内容 |
|---|---|---|
| id | text PK | 'hokkaido' 等（学年順に投入） |
| name | text | '北海道' |
| name_kana | text | 'ほっかいどう' |
| capital | text | '札幌市' |
| capital_kana | text | |
| region_id | text | → prim_regions.id |
| map_no | int | 白地図番号 |
| specialties | jsonb | 代表順 最大3（例 ['りんご','にんにく','ほたて']） |
| grade | int | 主に学ぶ学年（任意） |

### prim_regions
id(PK) / name / name_kana / map_no(任意)

### prim_wards
id(PK) / name / name_kana / map_no

### TypeScript 型（types/quiz.ts に追加）
```ts
export interface Prefecture {
  id: string; name: string; nameKana: string
  capital: string; capitalKana: string
  regionId: string; mapNo: number
  specialties: string[]; grade?: number
}
export interface Region { id: string; name: string; nameKana: string; mapNo?: number }
export interface Ward   { id: string; name: string; nameKana: string; mapNo: number }
```

## 6. 問題生成ロジック（新規 lib/quizgen.ts）

- マスタ配列から、出題形式ごとに「正解1 ＋ ランダム誤答3」を組む純関数群。
- 出力は既存 `Question` 型に合わせ、`QuizScreen/ResultScreen` を無改造で流用。
- シャッフルは既存 `lib/shuffle.ts` を再利用。

### 特産品の重複除外（最初から実装）
- ダミー選択肢候補を作る際、**正解県の特産品集合と1つでも重複する県を除外**。
- リスト全表示でも、将来「代表1品だけ」でも同じロジックで安全。

### 「すべての◯◯」モード
- 都道府県47 / 地方 / 23区を全問出題。順はランダム（学習用途）。

## 7. 地図ハイライト・表示

- 地図は SVG（`viewBox`付き）。`width:100%; height:auto; max-width:560px` で PC/スマホ両対応。
- 各県/区/地方は識別属性（例 `data-pref="aomori"`）を持ち、JS/CSSで
  「番号表示」「特定要素のハイライト（primary塗り）」「県庁点の出し分け」を制御。
- スマホは地図＝上・4択＝下の縦積み（`useBreakpoint.ts` で分岐）。
- **誤答時、結果画面で「正解の県」を地図上に塗って示す。**

### 必要なSVG（4種・各1枚に全要素内包）
1. 日本全図：県境＋県庁所在地の点＋県番号
2. 県単品（県庁点つき）→ 全県内包し、表示時に対象県の bbox へ viewBox を絞る
3. 日本全図：地方区切り（太線）＋地方番号
4. 東京23区：区境＋区番号

> 進め方：まず仕組み確認用に粗い試作1枚（例：関東のみ or 全国デフォルメ粗版）を作り、
> 番号/ハイライト/県庁点の出し分け・PC/スマホ追従を確認 → その後に全国版を作り込む。

## 8. AI生成機能の扱い

- `app/api/generate/route.ts` / `lib/gemini.ts` / `lib/prompts/*` は**コードとして残す**が、
  `SettingScreen` の AI生成ボタンは非表示（`enabled` フラグ等で隠す）。
- `lib/prompts/csat.ts` の中身は空テンプレに置換可（流用元のプロンプトはリセット）。
- ストック取得経路（`getStockQuestions` 相当）を、マスタ→`quizgen` 生成に差し替える。

## 9. 即時できる鋳型修正

- README を「小学生社会版」概要に書き換え。
- `lib/config.ts`：APP_NAME / APP_TITLE_FULL / APP_DESCRIPTION / SITE_URL / SEO_KEYWORDS を本アプリ用に。
- `.git` 削除→`git init`→新リモート（push事故防止）。
- 不要なら共テ向け SEO ワード・シェア文面を小学社会向けに差し替え。

## 10. 未確定（次に決める）

- 地図SVGの進め方（試作1枚先行 or 全国版4枚一括）。
- 「県庁所在地」を独立科目にするか、都道府県科目内の単元に畳むか。
- 23区を「発展/任意」表示にするか（全国ターゲットのため必修ではない）。
