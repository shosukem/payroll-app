import sql from "mssql";
import { drizzle } from "drizzle-orm/mssql.js";
import * as schema from "./schema";

const authType = process.env.AZURE_SQL_AUTH_TYPE || "sql";

const baseConfig = {
  server: process.env.AZURE_SQL_SERVER || "",
  database: process.env.AZURE_SQL_DATABASE || "",
  port: parseInt(process.env.AZURE_SQL_PORT || "1433"),
  options: {
    encrypt: true, // Azure SQL では必須
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const config: sql.config = authType === "entra-id"
  ? {
      ...baseConfig,
      authentication: {
        type: "azure-active-directory-password",
        options: {
          userName: process.env.AZURE_SQL_USER || "",
          password: process.env.AZURE_SQL_PASSWORD || "",
          ...(process.env.AZURE_SQL_TENANT_ID
            ? { tenantId: process.env.AZURE_SQL_TENANT_ID }
            : {}),
        },
      },
    }
  : {
      ...baseConfig,
      user: process.env.AZURE_SQL_USER || "",
      password: process.env.AZURE_SQL_PASSWORD || "",
    };

let pool: sql.ConnectionPool | null = null;

async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
  }
  return pool;
}

export async function getDb() {
  const connectionPool = await getPool();
  return drizzle(connectionPool, { schema });
}

// Raw SQL実行用（DB初期化など）
export async function executeRawSql(query: string): Promise<sql.IResult<unknown>> {
  const connectionPool = await getPool();
  return connectionPool.request().query(query);
}
