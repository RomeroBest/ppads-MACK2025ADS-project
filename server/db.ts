import dotenv from "dotenv";
dotenv.config();

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from "mysql2/promise";
import * as schema from '../shared/schema';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Esta é a instância correta que você deve exportar
export const db = drizzle(pool, {
  schema,
  mode: "default", // ou "planetscale" se estiver usando esse banco
});
