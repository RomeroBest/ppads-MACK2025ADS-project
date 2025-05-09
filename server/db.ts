import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from "@shared/schema";
import { env } from '../env';
import postgres from 'postgres';
import { set } from 'drizzle-orm';

const connectionString = env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL must be set");
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export const migrateDb = async () => {
    try {
        console.log("Migrating database...");
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("Database migrated successfully!");
    } catch (error) {
        console.error("Failed to migrate database:", error);
    }
};