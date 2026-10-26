import pg from "pg";
const { Pool } = pg;

export interface TaskRow {
  id: string;
  tenant_id: string;
  title: string;
  idempotency_key: string;
  created_at: Date;
}
export interface Database {
  query(sql: string, params?: unknown[]): Promise<{ rows: TaskRow[] }>;
}
export function createPool(): pg.Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 8,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000
  });
}
