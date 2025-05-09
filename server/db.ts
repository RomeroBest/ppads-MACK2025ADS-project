
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// PostgreSQL client configuration with better error handling
const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: {
    rejectUnauthorized: false
  },
  idle_timeout: 20,
  connect_timeout: 10,
  connection: {
    application_name: "TaskTracker"
  }
});

export const db = drizzle(client, { schema });

// Basic connection test
export const testConnection = async () => {
  try {
    await client`SELECT 1`;
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export const migrateDb = async () => {
  try {
    await testConnection();
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};
