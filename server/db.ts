import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "../shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // se precisar no Render
});

export const db = drizzle(pool, { schema });
