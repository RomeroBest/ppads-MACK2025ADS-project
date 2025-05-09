
import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable not set");
}

async function runMigrations() {
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
  });
  
  try {
    const migrationSQL = await fs.readFile(path.join(__dirname, 'migrations/init.sql'), 'utf8');
    await sql.unsafe(migrationSQL);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
