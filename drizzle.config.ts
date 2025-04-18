import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql", // <-- Aqui está o ajuste principal
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
