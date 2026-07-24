# NISHYOI 公式サイト

山形県鶴岡市関川の「NISHYOI(にしょい)」公式サイト。
コンセプトは「未完成な暮らしを、続けていく。」——川と二十四節気をモチーフにした
Astro製の静的サイト+イベント申込みAPI(Cloudflare Pages Functions)。

## 技術構成

- [Astro 5](https://astro.build) + Tailwind CSS 4(デザイントークンは `src/styles/global.css`)
- フォント: Zen Old Mincho / Zen Kaku Gothic New / IBM Plex Mono(セルフホスト)
- ホスティング: Cloudflare Pages(`@astrojs/cloudflare` アダプター)
- 申込み保存: Firebase Firestore / メール通知: FormSubmit(設定は `firebase/README.md`)

## 開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 本番ビルド(dist/)
```

イベント申込み・お問い合わせを動かすには、`.env.example` をコピーして `.env` を作る。

## コンテンツの追加方法(コード変更は不要)

### Journal(記録)を書く

`src/data/journal/` にMarkdownを1ファイル追加する:

```markdown
---
title: 記事タイトル
date: 2026-08-01
category: 季節と手仕事   # 動物と暮らし / 田舎とテクノロジー / 山の恵み / 集落の記録 / 写真と映像
sekki: 立秋              # 任意
tags: [薪]               # 任意
summary: 一覧に表示される要約。
tools: [チェーンソー]     # 任意(使った技術・道具)
noteUrl: https://note.com/...  # 任意
draft: true              # 公開する時に false にするか行を消す
---

本文(Markdown)
```

### イベントを追加する

`src/data/events/` にMarkdownを1ファイル追加する:

```markdown
---
title: イベント名
date: 2026-08-08T09:00:00+09:00
capacity: 3
remaining: 3        # 残席。申込みが来たら手動で減らす
status: open        # draft / soon / open / full / closed / cancelled / ended
audience: どなたでも # 任意
fee: 3,000円        # 任意
sekki: 立秋         # 任意
summary: 一覧・OGPに出る説明。
---

本文(内容・持ち物・注意事項など)
```

`status` を変えるだけで受付中→満席→終了の表示が切り替わる。
申込みはFirebaseコンソールの `bookings` コレクションで確認する。

### Web制作の実績を追加する

`src/data/works/` にMarkdownを追加。**クライアントの掲載許可が確認できたら**
`published: true` にする(それまでサイトには一切出ない)。

### note記事の引用 / 興味本位でつくったもの

- `src/data/notes/` — トップの「noteでも書いています」に出る引用カード
- `src/data/labs/` — トップの「興味本位でつくったもの」に出るサイト紹介

### 写真を差し込む

実写真は `src/assets/` に置き、各ページの `PhotoFrame` に `src` を渡す
(`src` がない間は撮影メモ付きの仮枠が表示される)。EXIFの位置情報は書き出し時に除去すること。
ロゴ素材は `src/assets/brand/README.md` を参照。

## デプロイ(Cloudflare Pages)

1. GitHubへpush
2. Cloudflare Pages でリポジトリを接続
   - Build command: `npm run build`
   - Build output: `dist`
3. Settings → Environment variables に `.env` と同じ3つを登録
   (`FIREBASE_PROJECT_ID` / `FIREBASE_API_KEY` / `OWNER_EMAIL`)
4. カスタムドメイン `nishyoi.com` を割り当て

旧サイトのURL(/rasendo/ など)は `public/_redirects` で新構成へ転送される。

## ディレクトリの要点

```
src/
  components/   SekkiStrip(二十四節気) RiverLine(川の線) PhotoFrame など
  data/         events / journal / works / notes / labs(コンテンツ本体)
  layouts/      Base.astro(共通レイアウト・OGP・スクロール演出)
  lib/          sekki.ts(節気の判定) constants.ts
  pages/        各ページ + api/(申込み・問い合わせのサーバー処理)
  styles/       global.css(デザイントークン: 色・書体・黄金比の余白)
firebase/       Firestoreルールとセットアップ手順
legacy/         旧静的サイト(参照用)
```
