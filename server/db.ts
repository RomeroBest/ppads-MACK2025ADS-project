
import { Pool, neonConfig } from '@neondatabase/serverless';
import { createPool } from 'mysql2/promise';
import { drizzle as drizzlePostgres } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleMySQL } from 'drizzle-orm/mysql2';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// PostgreSQL configuration
export const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzlePostgres({ client: pgPool, schema });

// MySQL fallback configuration
let mysqlDb: ReturnType<typeof drizzleMySQL> | null = null;

if (process.env.MYSQL_DATABASE_URL) {
  const mysqlPool = createPool(process.env.MYSQL_DATABASE_URL);
  mysqlDb = drizzleMySQL(mysqlPool, { schema });
}

export { mysqlDb };

// Helper function to get active database
export function getActiveDb() {
  return db; // Default to PostgreSQL, implement fallback logic if needed
}
