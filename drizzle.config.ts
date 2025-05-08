import { defineConfig } from "drizzle-kit";
import { mysqlTable, mysqlSchema } from "drizzle-orm/mysql-core";
import { pgTable, pgSchema } from "drizzle-orm/pg-core";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
