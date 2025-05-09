
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// PostgreSQL configuration with retry logic and pooling
const createPool = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    maxRetries: 3,
    connectionTimeoutMillis: 10000,
    maxConnections: 10,
    wsProxy: true
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
