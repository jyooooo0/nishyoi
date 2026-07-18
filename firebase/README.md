# イベント申込みフォームの有効化手順

申込みの保存は **Firebase Firestore**、メール通知は **FormSubmit**(無料・登録不要)を使う。
設定が終わるまで、フォームは「準備中」の表示になる。

## 1. Firebase(5分)

1. <https://console.firebase.google.com> で新しいプロジェクトを作成(例: `nishyoi`)
   - Googleアナリティクスは不要(オフでよい)
2. 左メニュー「Firestore Database」→「データベースを作成」
   - ロケーションは `asia-northeast1`(東京)
   - 「本番環境モード」で開始
3. Firestoreの「ルール」タブに、この隣の `firestore.rules` の内容を貼り付けて公開
4. プロジェクトの設定(歯車)→「全般」から次の2つを控える
   - **プロジェクトID**(例: `nishyoi-xxxxx`)
   - **ウェブAPIキー**

## 2. 環境変数

ローカル: リポジトリ直下に `.env` を作る(`.env.example` をコピー):

```
FIREBASE_PROJECT_ID=nishyoi-xxxxx
FIREBASE_API_KEY=AIza...
OWNER_EMAIL=jmfs24@gmail.com
```

本番: Cloudflare Pages → Settings → Environment variables に同じ3つを登録。

## 3. FormSubmit の有効化(1分)

アカウント登録は不要。**最初の1通目**を送ると、jmfs24@gmail.com に
FormSubmitから確認メールが届くので、中の「Activate」リンクを1回クリックするだけ。
以後、申込みごとに管理者通知+申込者への自動返信が送られる。

## 申込みの確認方法

Firebaseコンソール → Firestore Database → `bookings` コレクション。
(セキュリティルールにより、サイト側から申込み内容を読むことはできない)
