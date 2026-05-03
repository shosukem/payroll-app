# 給与計算ソフト (Payroll Calculator)

Next.js + Azure SQL Database で構築した日本の給与計算アプリケーション。
Azure App Service にデプロイする構成です。

## セットアップ

### 1. 依存関係インストール

```bash
cd payroll-app
npm install
```

### 2. Azure SQL Database 作成

Azure Portal で以下を作成:

1. **リソースグループ** を作成（例: `rg-payroll`）
2. **SQL Server**（論理サーバー）を作成
   - サーバー名: `payroll-sql-server`（任意）
   - 管理者ログイン / パスワードを設定
3. **SQL Database** を作成
   - データベース名: `payroll-db`
   - 価格レベル: Basic（開発用）または S0
4. **ファイアウォール設定**
   - 「Azure サービスからのアクセスを許可」を ON
   - ローカル開発用に自分のIPアドレスも追加

### 3. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を編集:
```
AZURE_SQL_SERVER=payroll-sql-server.database.windows.net
AZURE_SQL_DATABASE=payroll-db
AZURE_SQL_USER=sqladmin
AZURE_SQL_PASSWORD=Your-Password-Here
AZURE_SQL_PORT=1433
DB_INIT_SECRET=your-secret
```

### 4. データベーステーブル作成

```bash
# Drizzle で push
npm run db:push
```

または、アプリ起動後にAPIで初期化:
```bash
curl -X POST http://localhost:3000/api/db/init \
  -H "Authorization: Bearer your-secret"
```

### 5. Azure Blob Storage 設定（従業員添付ファイル）

雇用契約書・身分証など従業員ごとの添付ファイルを Blob Storage に保存します。

1. **ストレージアカウント** を作成（例: `payrollstorage`）
   - 冗長性: LRS（開発用）
   - アクセス層: ホット
2. **コンテナーは自動作成** されます（既定名: `employee-files`）

#### 本番（推奨: マネージドID）

App Service にシステム割り当てマネージドIDを有効化し、ストレージアカウントの IAM で
**Storage Blob Data Contributor** ロールを付与:

```bash
# App Service にマネージドIDを有効化
az webapp identity assign --name payroll-app --resource-group rg-payroll

# プリンシパルIDを取得してロール割り当て
PRINCIPAL_ID=$(az webapp identity show --name payroll-app --resource-group rg-payroll --query principalId -o tsv)
STORAGE_ID=$(az storage account show --name payrollstorage --resource-group rg-payroll --query id -o tsv)
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Storage Blob Data Contributor" \
  --scope $STORAGE_ID

# App Service にストレージアカウント名を設定
az webapp config appsettings set --name payroll-app --resource-group rg-payroll --settings \
  AZURE_STORAGE_ACCOUNT=payrollstorage \
  AZURE_STORAGE_CONTAINER=employee-files
```

#### ローカル開発

`az login` 済みなら `AZURE_STORAGE_ACCOUNT` だけで動作します（`DefaultAzureCredential`）。
接続文字列で動かしたい場合は `.env.local` に `AZURE_STORAGE_CONNECTION_STRING` を設定。

### 6. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

---

## Azure App Service へのデプロイ

### 方法1: GitHub Actions（推奨）

1. Azure Portal で **App Service** を作成
   - ランタイム: Node 20 LTS
   - OS: Linux
2. App Service の「デプロイ センター」から発行プロファイルをダウンロード
3. GitHub リポジトリの Settings → Secrets に以下を追加:
   - `AZURE_WEBAPP_PUBLISH_PROFILE` — 発行プロファイルの内容
   - `AZURE_SQL_SERVER`
   - `AZURE_SQL_DATABASE`
   - `AZURE_SQL_USER`
   - `AZURE_SQL_PASSWORD`
4. App Service の「構成」→「アプリケーション設定」に環境変数を追加:
   - `AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`, `AZURE_SQL_USER`, `AZURE_SQL_PASSWORD`, `AZURE_SQL_PORT`
   - `AZURE_STORAGE_ACCOUNT`, `AZURE_STORAGE_CONTAINER`（Blob Storage 利用時）
5. `main` ブランチに push すると自動デプロイ

### 方法2: Azure CLI

```bash
# ビルド
npm run build

# リソースグループ & App Service作成
az group create --name rg-payroll --location japaneast
az appservice plan create --name payroll-plan --resource-group rg-payroll --sku B1 --is-linux
az webapp create --name payroll-app --resource-group rg-payroll --plan payroll-plan --runtime "NODE:20-lts"

# 環境変数設定
az webapp config appsettings set --name payroll-app --resource-group rg-payroll --settings \
  AZURE_SQL_SERVER=your-server.database.windows.net \
  AZURE_SQL_DATABASE=payroll-db \
  AZURE_SQL_USER=sqladmin \
  AZURE_SQL_PASSWORD=your-password \
  AZURE_SQL_PORT=1433

# デプロイ
az webapp deploy --name payroll-app --resource-group rg-payroll --src-path .next/standalone --type zip
```

---

## 機能一覧

- **従業員管理** — 登録・編集・削除（論理削除）
- **給与計算** — 基本給、残業代、深夜手当、休日手当、各種手当の自動計算
- **社会保険料計算** — 健康保険、介護保険、厚生年金、雇用保険（2025年度基準）
- **所得税計算** — 甲欄に基づく源泉徴収税額の自動計算
- **賞与計算** — 夏季・冬季・特別賞与の計算と控除
- **給与明細PDF** — jsPDF による明細書出力
- **月次レポート** — 月別の給与集計・分析

## 技術スタック

- **Next.js 14** (App Router, standalone output)
- **TypeScript**
- **Tailwind CSS**
- **Drizzle ORM** (mssql dialect)
- **Azure SQL Database**
- **Azure App Service**
- **jsPDF** (PDF生成)
- **GitHub Actions** (CI/CD)
