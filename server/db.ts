import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from '../shared/schema';

// Conexão com o PostgreSQL
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema });
