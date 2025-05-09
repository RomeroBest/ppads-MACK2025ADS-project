
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// PostgreSQL configuration with retry logic
const createPool = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    maxConnections: 10,
    connectionTimeoutMillis: 10000,
    maxRetries: 3
  });

  try {
    // Test the connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const pgPool = await createPool();
export const db = drizzle(pgPool, { schema });

export const migrateDb = async () => {
  try {
    console.log("Migrating database...");
    await db.execute(schema.migrations);
    console.log("Database migrated successfully!");
  } catch (error) {
    console.error("Failed to migrate database:", error);
    throw error;
  }
};
