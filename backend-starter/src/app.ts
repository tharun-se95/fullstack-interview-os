import express from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Database, TaskRow } from "./db.js";

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(120)
}).strict();

type AppConfig = { db: Database; token: string };

function publicTask(row: TaskRow) {
  return { id: row.id, title: row.title, createdAt: row.created_at };
}
export function createApp({ db, token }: AppConfig) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  app.get("/health/live", (_req, res) => res.json({ status: "alive" }));
  app.get("/health/ready", async (_req, res) => {
    try {
      await db.query("SELECT 1");
      res.json({ status: "ready" });
    } catch {
      res.status(503).json({ error: { code: "NOT_READY" } });
    }
  });

  // Teaching-only auth. Replace with signed/revocable server sessions,
  // resource-level authorization and audited tenant membership in production.
  app.use("/api", (req, res, next) => {
    if (req.headers.authorization !== `Bearer ${token}`) {
      res.status(401).json({ error: { code: "UNAUTHENTICATED" } });
      return;
    }
    next();
  });

  const tenantId = "demo"; // Not client-controlled; replace with trusted session context.

  app.get("/api/tasks", async (_req, res, next) => {
    try {
      const { rows } = await db.query(
        "SELECT id,tenant_id,title,idempotency_key,created_at FROM tasks " +
        "WHERE tenant_id=$1 ORDER BY created_at DESC,id DESC LIMIT 50",
        [tenantId]
      );
      res.json({ items: rows.map(publicTask) });
    } catch (err) { next(err); }
  });

  app.post("/api/tasks", async (req, res, next) => {
    const valid = createTaskSchema.safeParse(req.body);
    if (!valid.success) {
      res.status(400).json({ error: { code: "INVALID_INPUT" } });
      return;
    }
    const key = req.header("Idempotency-Key");
    if (!key || !/^[a-zA-Z0-9_-]{8,80}$/.test(key)) {
      res.status(400).json({ error: { code: "INVALID_IDEMPOTENCY_KEY" } });
      return;
    }
    try {
      const inserted = await db.query(
        "INSERT INTO tasks (id,tenant_id,title,idempotency_key) VALUES ($1,$2,$3,$4) " +
        "ON CONFLICT (tenant_id,idempotency_key) DO NOTHING " +
        "RETURNING id,tenant_id,title,idempotency_key,created_at",
        [randomUUID(),tenantId,valid.data.title,key]
      );
      if (inserted.rows[0]) {
        res.status(201).json(publicTask(inserted.rows[0]));
        return;
      }
      const existing = await db.query(
        "SELECT id,tenant_id,title,idempotency_key,created_at FROM tasks " +
        "WHERE tenant_id=$1 AND idempotency_key=$2", [tenantId,key]
      );
      const original = existing.rows[0];
      if (!original) {
        res.status(503).json({ error: { code: "RETRY_REQUEST" } });
      } else if (original.title !== valid.data.title) {
        res.status(409).json({ error: { code: "KEY_PAYLOAD_MISMATCH" } });
      } else {
        res.status(200).json(publicTask(original));
      }
    } catch (err) { next(err); }
  });

  app.use((err: unknown, _req: express.Request, res: express.Response,
    _next: express.NextFunction) => {
    console.error("API error", err instanceof Error ? err.message : "unknown");
    if (!res.headersSent) res.status(500).json({ error: { code: "INTERNAL_ERROR" } });
  });
  return app;
}
