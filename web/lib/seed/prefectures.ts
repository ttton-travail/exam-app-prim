// ===========================
// マスタ seed データ（小学校版）
// lib/seed/prefectures.ts
//
// Supabase prim_prefectures / prim_regions / prim_wards に対応。
// nameGrade4: 都道府県名は現行課程で全て4年配当のため name と同一。
//   県庁所在地・区名・地方名は未習漢字を含むものをひらがな化（個別調整）。
//   ※この値は確認のうえ自由に調整してよい（教科書準拠の最終判断は人が行う）。
// 並びは学習学年順（北→南のブロック順）。mapNo もこの順で採番。
// ===========================

import type { Prefecture, Region, Ward } from '@/types/quiz'

export const PREFECTURES: Prefecture[] = [
    { id: 'hokkaido', name: '北海道', nameKana: 'ほっかいどう', nameGrade4: '北海道', capital: '札幌市', capitalKana: 'さっぽろし', capitalGrade4: '札幌市', regionId: 'hokkaido', mapNo: 1, specialties: ['じゃがいも', '牛乳', 'かに'] },
    { id: 'aomori', name: '青森県', nameKana: 'あおもりけん', nameGrade4: '青森県', capital: '青森市', capitalKana: 'あおもりし', capitalGrade4: '青森市', regionId: 'tohoku', mapNo: 2, specialties: ['りんご', 'にんにく', 'ほたて'] },
    { id: 'iwate', name: '岩手県', nameKana: 'いわてけん', nameGrade4: '岩手県', capital: '盛岡市', capitalKana: 'もりおかし', capitalGrade4: '盛岡市', regionId: 'tohoku', mapNo: 3, specialties: ['わかめ', 'りんご', '南部鉄器'] },
    { id: 'miyagi', name: '宮城県', nameKana: 'みやぎけん', nameGrade4: '宮城県', capital: '仙台市', capitalKana: 'せんだいし', capitalGrade4: '仙台市', regionId: 'tohoku', mapNo: 4, specialties: ['米', 'かき', 'ふかひれ'] },
    { id: 'akita', name: '秋田県', nameKana: 'あきたけん', nameGrade4: '秋田県', capital: '秋田市', capitalKana: 'あきたし', capitalGrade4: '秋田市', regionId: 'tohoku', mapNo: 5, specialties: ['米', 'きりたんぽ', '曲げわっぱ'] },
    { id: 'yamagata', name: '山形県', nameKana: 'やまがたけん', nameGrade4: '山形県', capital: '山形市', capitalKana: 'やまがたし', capitalGrade4: '山形市', regionId: 'tohoku', mapNo: 6, specialties: ['さくらんぼ', '洋なし', '米'] },
    { id: 'fukushima', name: '福島県', nameKana: 'ふくしまけん', nameGrade4: '福島県', capital: '福島市', capitalKana: 'ふくしまし', capitalGrade4: '福島市', regionId: 'tohoku', mapNo: 7, specialties: ['もも', '米', '日本酒'] },
    { id: 'ibaraki', name: '茨城県', nameKana: 'いばらきけん', nameGrade4: '茨城県', capital: '水戸市', capitalKana: 'みとし', capitalGrade4: '水戸市', regionId: 'kanto', mapNo: 8, specialties: ['納豆', 'メロン', 'れんこん'] },
    { id: 'tochigi', name: '栃木県', nameKana: 'とちぎけん', nameGrade4: '栃木県', capital: '宇都宮市', capitalKana: 'うつのみやし', capitalGrade4: '宇都宮市', regionId: 'kanto', mapNo: 9, specialties: ['いちご', 'かんぴょう', 'ぎょうざ'] },
    { id: 'gunma', name: '群馬県', nameKana: 'ぐんまけん', nameGrade4: '群馬県', capital: '前橋市', capitalKana: 'まえばしし', capitalGrade4: '前橋市', regionId: 'kanto', mapNo: 10, specialties: ['キャベツ', 'こんにゃく', 'ねぎ'] },
    { id: 'saitama', name: '埼玉県', nameKana: 'さいたまけん', nameGrade4: '埼玉県', capital: 'さいたま市', capitalKana: 'さいたまし', capitalGrade4: 'さいたま市', regionId: 'kanto', mapNo: 11, specialties: ['ねぎ', 'ひな人形', '狭山茶'] },
    { id: 'chiba', name: '千葉県', nameKana: 'ちばけん', nameGrade4: '千葉県', capital: '千葉市', capitalKana: 'ちばし', capitalGrade4: '千葉市', regionId: 'kanto', mapNo: 12, specialties: ['しょうゆ', 'らっかせい', 'なし'] },
    { id: 'tokyo', name: '東京都', nameKana: 'とうきょうと', nameGrade4: '東京都', capital: '新宿区', capitalKana: 'しんじゅくく', capitalGrade4: '新宿区', regionId: 'kanto', mapNo: 13, specialties: ['江戸切子', '小松菜', '印刷'] },
    { id: 'kanagawa', name: '神奈川県', nameKana: 'かながわけん', nameGrade4: '神奈川県', capital: '横浜市', capitalKana: 'よこはまし', capitalGrade4: '横浜市', regionId: 'kanto', mapNo: 14, specialties: ['キャベツ', 'まぐろ', 'シューマイ'] },
    { id: 'niigata', name: '新潟県', nameKana: 'にいがたけん', nameGrade4: '新潟県', capital: '新潟市', capitalKana: 'にいがたし', capitalGrade4: '新潟市', regionId: 'chubu', mapNo: 15, specialties: ['米', '日本酒', '洋食器'] },
    { id: 'toyama', name: '富山県', nameKana: 'とやまけん', nameGrade4: '富山県', capital: '富山市', capitalKana: 'とやまし', capitalGrade4: '富山市', regionId: 'chubu', mapNo: 16, specialties: ['米', 'ます寿し', 'ホタルイカ'] },
    { id: 'ishikawa', name: '石川県', nameKana: 'いしかわけん', nameGrade4: '石川県', capital: '金沢市', capitalKana: 'かなざわし', capitalGrade4: '金沢市', regionId: 'chubu', mapNo: 17, specialties: ['加賀友禅', '輪島塗', '九谷焼'] },
    { id: 'fukui', name: '福井県', nameKana: 'ふくいけん', nameGrade4: '福井県', capital: '福井市', capitalKana: 'ふくいし', capitalGrade4: '福井市', regionId: 'chubu', mapNo: 18, specialties: ['めがね', '越前がに', '米'] },
    { id: 'yamanashi', name: '山梨県', nameKana: 'やまなしけん', nameGrade4: '山梨県', capital: '甲府市', capitalKana: 'こうふし', capitalGrade4: '甲府市', regionId: 'chubu', mapNo: 19, specialties: ['ぶどう', 'もも', 'ワイン'] },
    { id: 'nagano', name: '長野県', nameKana: 'ながのけん', nameGrade4: '長野県', capital: '長野市', capitalKana: 'ながのし', capitalGrade4: '長野市', regionId: 'chubu', mapNo: 20, specialties: ['りんご', 'レタス', 'ぶどう'] },
    { id: 'gifu', name: '岐阜県', nameKana: 'ぎふけん', nameGrade4: '岐阜県', capital: '岐阜市', capitalKana: 'ぎふし', capitalGrade4: '岐阜市', regionId: 'chubu', mapNo: 21, specialties: ['美濃和紙', '刃物', '美濃焼'] },
    { id: 'shizuoka', name: '静岡県', nameKana: 'しずおかけん', nameGrade4: '静岡県', capital: '静岡市', capitalKana: 'しずおかし', capitalGrade4: '静岡市', regionId: 'chubu', mapNo: 22, specialties: ['お茶', 'みかん', 'うなぎ'] },
    { id: 'aichi', name: '愛知県', nameKana: 'あいちけん', nameGrade4: '愛知県', capital: '名古屋市', capitalKana: 'なごやし', capitalGrade4: '名古屋市', regionId: 'chubu', mapNo: 23, specialties: ['自動車', 'みそ', 'キャベツ'] },
    { id: 'mie', name: '三重県', nameKana: 'みえけん', nameGrade4: '三重県', capital: '津市', capitalKana: 'つし', capitalGrade4: '津市', regionId: 'kinki', mapNo: 24, specialties: ['真珠', '伊勢えび', 'お茶'] },
    { id: 'shiga', name: '滋賀県', nameKana: 'しがけん', nameGrade4: '滋賀県', capital: '大津市', capitalKana: 'おおつし', capitalGrade4: '大津市', regionId: 'kinki', mapNo: 25, specialties: ['近江牛', '米', 'ふな寿し'] },
    { id: 'kyoto', name: '京都府', nameKana: 'きょうとふ', nameGrade4: '京都府', capital: '京都市', capitalKana: 'きょうとし', capitalGrade4: '京都市', regionId: 'kinki', mapNo: 26, specialties: ['西陣織', '清水焼', '宇治茶'] },
    { id: 'osaka', name: '大阪府', nameKana: 'おおさかふ', nameGrade4: '大阪府', capital: '大阪市', capitalKana: 'おおさかし', capitalGrade4: '大阪市', regionId: 'kinki', mapNo: 27, specialties: ['たこ焼き', '刃物', '自転車部品'] },
    { id: 'hyogo', name: '兵庫県', nameKana: 'ひょうごけん', nameGrade4: '兵庫県', capital: '神戸市', capitalKana: 'こうべし', capitalGrade4: '神戸市', regionId: 'kinki', mapNo: 28, specialties: ['神戸牛', '清酒', 'たまねぎ'] },
    { id: 'nara', name: '奈良県', nameKana: 'ならけん', nameGrade4: '奈良県', capital: '奈良市', capitalKana: 'ならし', capitalGrade4: '奈良市', regionId: 'kinki', mapNo: 29, specialties: ['すみ', '奈良漬', 'かき'] },
    { id: 'wakayama', name: '和歌山県', nameKana: 'わかやまけん', nameGrade4: '和歌山県', capital: '和歌山市', capitalKana: 'わかやまし', capitalGrade4: '和歌山市', regionId: 'kinki', mapNo: 30, specialties: ['みかん', 'うめ', 'かき'] },
    { id: 'tottori', name: '鳥取県', nameKana: 'とっとりけん', nameGrade4: '鳥取県', capital: '鳥取市', capitalKana: 'とっとりし', capitalGrade4: '鳥取市', regionId: 'chugoku', mapNo: 31, specialties: ['なし', 'らっきょう', 'かに'] },
    { id: 'shimane', name: '島根県', nameKana: 'しまねけん', nameGrade4: '島根県', capital: '松江市', capitalKana: 'まつえし', capitalGrade4: '松江市', regionId: 'chugoku', mapNo: 32, specialties: ['しじみ', '出雲そば', '日本酒'] },
    { id: 'okayama', name: '岡山県', nameKana: 'おかやまけん', nameGrade4: '岡山県', capital: '岡山市', capitalKana: 'おかやまし', capitalGrade4: '岡山市', regionId: 'chugoku', mapNo: 33, specialties: ['もも', 'ぶどう', '学生服'] },
    { id: 'hiroshima', name: '広島県', nameKana: 'ひろしまけん', nameGrade4: '広島県', capital: '広島市', capitalKana: 'ひろしまし', capitalGrade4: '広島市', regionId: 'chugoku', mapNo: 34, specialties: ['かき', 'レモン', 'お好み焼き'] },
    { id: 'yamaguchi', name: '山口県', nameKana: 'やまぐちけん', nameGrade4: '山口県', capital: '山口市', capitalKana: 'やまぐちし', capitalGrade4: '山口市', regionId: 'chugoku', mapNo: 35, specialties: ['ふぐ', '夏みかん', 'かまぼこ'] },
    { id: 'tokushima', name: '徳島県', nameKana: 'とくしまけん', nameGrade4: '徳島県', capital: '徳島市', capitalKana: 'とくしまし', capitalGrade4: '徳島市', regionId: 'shikoku', mapNo: 36, specialties: ['すだち', 'なると金時', '藍染め'] },
    { id: 'kagawa', name: '香川県', nameKana: 'かがわけん', nameGrade4: '香川県', capital: '高松市', capitalKana: 'たかまつし', capitalGrade4: '高松市', regionId: 'shikoku', mapNo: 37, specialties: ['うどん', 'オリーブ', 'うちわ'] },
    { id: 'ehime', name: '愛媛県', nameKana: 'えひめけん', nameGrade4: '愛媛県', capital: '松山市', capitalKana: 'まつやまし', capitalGrade4: '松山市', regionId: 'shikoku', mapNo: 38, specialties: ['みかん', 'タオル', '真珠'] },
    { id: 'kochi', name: '高知県', nameKana: 'こうちけん', nameGrade4: '高知県', capital: '高知市', capitalKana: 'こうちし', capitalGrade4: '高知市', regionId: 'shikoku', mapNo: 39, specialties: ['かつお', 'なす', 'ゆず'] },
    { id: 'fukuoka', name: '福岡県', nameKana: 'ふくおかけん', nameGrade4: '福岡県', capital: '福岡市', capitalKana: 'ふくおかし', capitalGrade4: '福岡市', regionId: 'kyushu', mapNo: 40, specialties: ['いちご', 'めんたいこ', '八女茶'] },
    { id: 'saga', name: '佐賀県', nameKana: 'さがけん', nameGrade4: '佐賀県', capital: '佐賀市', capitalKana: 'さがし', capitalGrade4: '佐賀市', regionId: 'kyushu', mapNo: 41, specialties: ['有田焼', 'のり', 'みかん'] },
    { id: 'nagasaki', name: '長崎県', nameKana: 'ながさきけん', nameGrade4: '長崎県', capital: '長崎市', capitalKana: 'ながさきし', capitalGrade4: '長崎市', regionId: 'kyushu', mapNo: 42, specialties: ['びわ', 'ちゃんぽん', 'カステラ'] },
    { id: 'kumamoto', name: '熊本県', nameKana: 'くまもとけん', nameGrade4: '熊本県', capital: '熊本市', capitalKana: 'くまもとし', capitalGrade4: '熊本市', regionId: 'kyushu', mapNo: 43, specialties: ['すいか', 'い草', 'トマト'] },
    { id: 'oita', name: '大分県', nameKana: 'おおいたけん', nameGrade4: '大分県', capital: '大分市', capitalKana: 'おおいたし', capitalGrade4: '大分市', regionId: 'kyushu', mapNo: 44, specialties: ['しいたけ', 'かぼす', '温泉'] },
    { id: 'miyazaki', name: '宮崎県', nameKana: 'みやざきけん', nameGrade4: '宮崎県', capital: '宮崎市', capitalKana: 'みやざきし', capitalGrade4: '宮崎市', regionId: 'kyushu', mapNo: 45, specialties: ['マンゴー', 'ピーマン', '地鶏'] },
    { id: 'kagoshima', name: '鹿児島県', nameKana: 'かごしまけん', nameGrade4: '鹿児島県', capital: '鹿児島市', capitalKana: 'かごしまし', capitalGrade4: '鹿児島市', regionId: 'kyushu', mapNo: 46, specialties: ['さつまいも', '黒豚', 'お茶'] },
    { id: 'okinawa', name: '沖縄県', nameKana: 'おきなわけん', nameGrade4: '沖縄県', capital: '那覇市', capitalKana: 'なはし', capitalGrade4: '那覇市', regionId: 'kyushu', mapNo: 47, specialties: ['さとうきび', 'パイナップル', 'ゴーヤー'] },
]

export const REGIONS: Region[] = [
    { id: 'hokkaido', name: '北海道', nameKana: 'ほっかいどう', nameGrade4: '北海道', mapNo: 1 },
    { id: 'tohoku', name: '東北地方', nameKana: 'とうほくちほう', nameGrade4: '東北地方', mapNo: 2 },
    { id: 'kanto', name: '関東地方', nameKana: 'かんとうちほう', nameGrade4: '関東地方', mapNo: 3 },
    { id: 'chubu', name: '中部地方', nameKana: 'ちゅうぶちほう', nameGrade4: '中部地方', mapNo: 4 },
    { id: 'kinki', name: '近畿地方', nameKana: 'きんきちほう', nameGrade4: 'きんき地方', mapNo: 5 },
    { id: 'chugoku', name: '中国地方', nameKana: 'ちゅうごくちほう', nameGrade4: '中国地方', mapNo: 6 },
    { id: 'shikoku', name: '四国地方', nameKana: 'しこくちほう', nameGrade4: '四国地方', mapNo: 7 },
    { id: 'kyushu', name: '九州地方', nameKana: 'きゅうしゅうちほう', nameGrade4: '九州地方', mapNo: 8 },
]

export const WARDS: Ward[] = [
    { id: 'chiyoda', name: '千代田区', nameKana: 'ちよだく', nameGrade4: '千代田区', mapNo: 1 },
    { id: 'chuo', name: '中央区', nameKana: 'ちゅうおうく', nameGrade4: '中央区', mapNo: 2 },
    { id: 'minato', name: '港区', nameKana: 'みなとく', nameGrade4: '港区', mapNo: 3 },
    { id: 'shinjuku', name: '新宿区', nameKana: 'しんじゅくく', nameGrade4: '新宿区', mapNo: 4 },
    { id: 'bunkyo', name: '文京区', nameKana: 'ぶんきょうく', nameGrade4: '文京区', mapNo: 5 },
    { id: 'taito', name: '台東区', nameKana: 'たいとうく', nameGrade4: '台東区', mapNo: 6 },
    { id: 'sumida', name: '墨田区', nameKana: 'すみだく', nameGrade4: '墨田区', mapNo: 7 },
    { id: 'koto', name: '江東区', nameKana: 'こうとうく', nameGrade4: '江東区', mapNo: 8 },
    { id: 'shinagawa', name: '品川区', nameKana: 'しながわく', nameGrade4: '品川区', mapNo: 9 },
    { id: 'meguro', name: '目黒区', nameKana: 'めぐろく', nameGrade4: '目黒区', mapNo: 10 },
    { id: 'ota', name: '大田区', nameKana: 'おおたく', nameGrade4: '大田区', mapNo: 11 },
    { id: 'setagaya', name: '世田谷区', nameKana: 'せたがやく', nameGrade4: '世田谷区', mapNo: 12 },
    { id: 'shibuya', name: '渋谷区', nameKana: 'しぶやく', nameGrade4: 'しぶや区', mapNo: 13 },
    { id: 'nakano', name: '中野区', nameKana: 'なかのく', nameGrade4: '中野区', mapNo: 14 },
    { id: 'suginami', name: '杉並区', nameKana: 'すぎなみく', nameGrade4: '杉並区', mapNo: 15 },
    { id: 'toshima', name: '豊島区', nameKana: 'としまく', nameGrade4: '豊島区', mapNo: 16 },
    { id: 'kita', name: '北区', nameKana: 'きたく', nameGrade4: '北区', mapNo: 17 },
    { id: 'arakawa', name: '荒川区', nameKana: 'あらかわく', nameGrade4: '荒川区', mapNo: 18 },
    { id: 'itabashi', name: '板橋区', nameKana: 'いたばしく', nameGrade4: '板橋区', mapNo: 19 },
    { id: 'nerima', name: '練馬区', nameKana: 'ねりまく', nameGrade4: '練馬区', mapNo: 20 },
    { id: 'adachi', name: '足立区', nameKana: 'あだちく', nameGrade4: '足立区', mapNo: 21 },
    { id: 'katsushika', name: '葛飾区', nameKana: 'かつしかく', nameGrade4: 'かつしか区', mapNo: 22 },
    { id: 'edogawa', name: '江戸川区', nameKana: 'えどがわく', nameGrade4: '江戸川区', mapNo: 23 },
]