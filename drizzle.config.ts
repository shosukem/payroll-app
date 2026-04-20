import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mssql",
  dbCredentials: {
    server: process.env.AZURE_SQL_SERVER!,
    database: process.env.AZURE_SQL_DATABASE!,
    user: process.env.AZURE_SQL_USER!,
    password: process.env.AZURE_SQL_PASSWORD!,
    port: parseInt(process.env.AZURE_SQL_PORT || "1433"),
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  },
});
