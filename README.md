# fz — セラピスト個人ホームページ

個人セラピスト向けの「管理用ページ」「客用ページ」を備えたポータルサイトです。
上部のバナー（タブ）から、メッセージ・レビュー・施術メニュー・割引クーポン・請求・施術履歴・プロフィールの各画面をワンタップで切り替えられます。

## 主な機能

### 管理用ページ（`/admin`）

- 顧客一覧・新規顧客登録
- プロフィール編集（お客様ページに表示される自己紹介）
- 施術メニュー管理（追加・表示/非表示・削除）
- 割引クーポン管理（全顧客向け／特定顧客限定の発行）
- レビュー管理（返信・公開/非公開切り替え）
- メッセージ（顧客ごとのスレッドで返信）
- 請求管理（作成・支払い状況の更新）
- 施術履歴管理（記録の追加、顧客ごとの絞り込み表示）
- 顧客詳細ページ（その顧客の施術履歴・請求・レビュー・メッセージへのリンクをまとめて確認）

### 客用ページ（`/mypage`）

- プロフィール（セラピストの自己紹介の閲覧）
- 施術メニューの閲覧
- 割引クーポンの閲覧（自分専用クーポンも表示）
- 施術履歴の閲覧（自分の記録のみ）
- 請求の確認（自分の請求のみ）
- レビューの投稿・閲覧（自分の投稿＋公開レビュー一覧）
- メッセージ（セラピストとのやり取り）

## 技術スタック

- [Next.js 16](https://nextjs.org/)（App Router / Server Actions）
- TypeScript / React 19
- Tailwind CSS 4
- Prisma 6 + SQLite
- bcryptjs（パスワードハッシュ）
- 署名付きCookieによる独自セッション認証（管理者／顧客の2ロール）

## セットアップ

```bash
npm install
cp .env.example .env        # 必要に応じて値を編集
npx prisma migrate deploy   # DBスキーマを適用
npx prisma db seed          # サンプルデータを投入
npm run dev
```

`http://localhost:3000` にアクセスしてください。

## ログイン情報（シードデータ）

`.env` の `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` で変更可能です。

- 管理者: `admin` / `admin1234`
- 顧客: `customer01` / `customer1234`（クーポン `TANAKA-VIP` あり）
- 顧客: `customer02` / `customer1234`

本番運用時は `.env` の `SESSION_SECRET` と管理者パスワードを必ず変更してください。

## ディレクトリ構成

```
prisma/            スキーマ・マイグレーション・シードスクリプト
src/app/            ルーティング（App Router）
  admin/            管理用ページ
  mypage/           客用ページ
  login/            管理者・お客様ログイン
src/components/     共通UI（上部バナー、カード等）
src/lib/            Prismaクライアント、認証、Server Actions
```

## スクリプト

```bash
npm run dev     # 開発サーバー
npm run build   # 本番ビルド
npm run start   # 本番サーバー起動
npm run lint    # ESLint
```
