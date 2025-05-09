import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// PostgreSQL client configuration
const client = postgres(process.env.DATABASE_URL, {
  max: 10,
  connection: {
    application_name: "TaskTracker"
  }
});

export const db = drizzle(client, { schema });

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