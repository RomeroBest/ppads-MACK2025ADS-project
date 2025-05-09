
import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = "postgresql://ppads_mack2025ads_project_user:GiwvdLNBX4cQfGddZqcIUAZIH8E5tpyu@dpg-d0edbis9c44c73crsbh0-a.oregon-postgres.render.com/ppads_mack2025ads_project";

async function runMigrations() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/init.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigrations();
