# fz — セラピスト個人ホームページ

複数セラピスト在籍の個人サロン向けに、「管理用ページ」「セラピスト用ページ」「客用ページ」の3種類を備えたポータルサイトです。
上部のバナー（タブ）から、各画面をワンタップで切り替えられます。支払いは現金のみを想定しており、請求書機能はありません（施術履歴に金額を表示）。

## 主な機能

### 管理用ページ（`/admin`） — 運営・オーナー向け

- 顧客一覧・新規顧客登録
- セラピスト管理（複数人のプロフィールを追加・編集・削除）
- 施術メニュー管理（追加・表示/非表示・削除）
- 割引クーポン管理（全顧客向け／特定顧客限定の発行）
- レビュー管理（返信・公開/非公開切り替え）
- ブログ管理（セラピストごとの記事投稿・公開/非公開・削除）
- メッセージ（顧客ごとのスレッドで返信／全顧客への一斉送信）
- 施術履歴管理（記録の追加、顧客ごとの絞り込み表示、金額表示）
- 顧客詳細ページ（その顧客の施術履歴・今後の予約・レビュー・メッセージへのリンク、顧客ごとの私用メモ）

### セラピスト用ページ（`/therapist`） — セラピスト本人向け

- 自分のプロフィール編集のみ（他のセラピストの情報は見えません）
- お客様の登録（メールアドレスで既存の顧客アカウントを紐付け。登録した客だけが自分を見られる）
- 毎週の空き時間ルールの登録・削除（曜日・時間帯・適用期間を指定）、今後の予約確認・キャンセル
- 施術済みのお客様ごとの私用メモ（お客様・他のセラピストには非公開）
- 自分のブログ記事の投稿・公開/非公開・削除

### 客用ページ（`/mypage`）

- セラピスト一覧・プロフィール閲覧（**そのセラピストに登録されている客のみ閲覧可能**）
- 施術メニューの閲覧
- 予約（メニューを選んでから空き時間を選ぶ／セラピストを選んでから空き時間を選ぶ、どちらの流れも可能。登録されているセラピストのみ対象）
- 割引クーポンの閲覧（自分専用クーポンも表示）
- 施術履歴の閲覧（自分の記録のみ、金額表示）
- レビューの投稿・閲覧（自分の投稿＋公開レビュー一覧）
- ブログの閲覧（登録されているセラピストの記事のみ）
- メッセージ（セラピストとのやり取り）

### セラピストの公開条件

customerがセラピストの情報（プロフィール・予約・ブログ）を見るには、次の**両方**が必要です。

1. セラピスト本人が一度でも `/login/therapist` からログインしている（`isVerified`）
2. そのセラピストが、対象の客のメールアドレスを `/therapist/customers` から登録している（`TherapistCustomer`）

どちらか一方でも欠けると、その客からはそのセラピストは一切見えません。

### 私用メモ（双方向・非共有）

- 管理者側: 顧客ごとの私用メモを複数件記録可能（お客様には表示されません）
- お客様側: セラピストごとの私用メモを複数件記録可能（セラピスト・運営には表示されません）

## 技術スタック

- [Next.js 16](https://nextjs.org/)（App Router / Server Actions）
- TypeScript / React 19
- Tailwind CSS 4
- Prisma 6 + PostgreSQL（本番はSupabase推奨。ローカル開発はSQLiteに変更しても可）
- bcryptjs（パスワードハッシュ）
- 署名付きCookieによる独自セッション認証（管理者／顧客の2ロール）

## セットアップ

DBはPostgreSQL前提です（本番はSupabaseを使用）。ローカルでも同じSupabaseプロジェクトに接続するか、ローカルのPostgresを用意してください。

```bash
npm install
cp .env.example .env        # DATABASE_URL 等を編集
npx prisma migrate deploy   # DBスキーマを適用
npx prisma db seed          # サンプルデータを投入
npm run dev
```

`http://localhost:3000` にアクセスしてください。

> SQLiteで手軽に試したい場合は `prisma/schema.prisma` の `datasource db` の `provider` を `sqlite` に、`.env` の `DATABASE_URL` を `file:./dev.db` に戻してください。

## ログイン情報（シードデータ）

`.env` の `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` で変更可能です。

- 管理者: `admin` / `admin1234`
- 顧客: `customer01` / `customer1234`（田中様、クーポン `TANAKA-VIP` あり、ニコルに登録済み）
- 顧客: `customer02` / `customer1234`（佐藤様、ニコルに登録済み）
- 顧客: `customer03` / `customer1234`（鈴木様、ニコルに登録済み）
- セラピスト: `nicole` / `nicole1234`（`/login/therapist`、上記3名を登録済み）

本番運用時は `.env` の `SESSION_SECRET` と各アカウントのパスワードを必ず変更してください。

⚠️ 現在は**プロトタイプ確認用に、ログインID・パスワードを空欄で送信してもログインできる**状態になっています（各ロールの最初の1件として自動ログイン）。本番公開前に `src/lib/actions/auth-actions.ts` のこの挙動を必ず削除してください。

## Vercelへのデプロイ

本番用データベース（Supabase Postgres）は用意済みです。以下の手順でVercelにデプロイできます。

1. [Vercel](https://vercel.com/new) にログインし、このGitHubリポジトリ（`harukisaka6969/fz`、ブランチ `claude/menesu-personal-homepage-f7p5m3` またはマージ後の `main`）をImportする。
2. 「Environment Variables」に以下を設定する。
   - `DATABASE_URL` — SupabaseダッシュボードのProject Settings → Database → Connection string（**URI** / Session pooler推奨）からコピー。パスワードは `[YOUR-PASSWORD]` の部分をプロジェクト作成時に発行された実際のパスワードに置き換える。
     - プロジェクトRef: `wwmvtgcfipfsknmxywtm`（リージョン: ap-northeast-1）
     - 例: `postgresql://postgres.wwmvtgcfipfsknmxywtm:<PASSWORD>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
     - パスワードを紛失した場合はSupabaseダッシュボードでリセットできます。
   - `SESSION_SECRET` — 長いランダム文字列（例: `openssl rand -base64 32` で生成）
   - `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` — 任意（シード実行時のみ使用）
3. 「Deploy」を押す。ビルド時に `postinstall` で `prisma generate` が自動実行されます。
4. データベースのテーブル・初期データはすでにSupabase側に投入済みなので、追加の migrate/seed 操作は不要です（スキーマを変更した場合は `npx prisma migrate deploy` をローカルまたはCIから実行してください）。
5. デプロイ完了後、発行されたURLにアクセスして動作確認してください。

⚠️ **Supabaseのセキュリティに関する注意**: このアプリはPrisma経由でPostgresに直接接続しており、Supabaseのanon key／REST API（PostgREST）は使用していません。そのため各テーブルのRow Level Security（RLS）は現状無効のままでも、anon keyを使ったクライアントからの不正アクセス経路はありません。ただし、将来Supabaseのクライアントライブラリやanon keyをこのプロジェクトで使う場合は、先にRLSを有効化しポリシーを設定してください。

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
