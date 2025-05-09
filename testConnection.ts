import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

async function test() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected! Time:", result.rows[0]);
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}

test();
