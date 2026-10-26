import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import type { Database } from "../src/db.js";

const db: Database = { async query() { return { rows: [] }; } };
async function withServer(fn: (base: string) => Promise<void>) {
  const server = createApp({ db, token: "test-token" }).listen(0);
  await new Promise<void>(resolve => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing port");
  try { await fn(`http://127.0.0.1:${address.port}`); }
  finally { await new Promise<void>(resolve => server.close(() => resolve())); }
}

test("live health works", async () => {
  await withServer(async base => {
    const r = await fetch(base + "/health/live");
    assert.equal(r.status, 200);
    assert.equal((await r.json()).status, "alive");
  });
});
test("protected route rejects missing auth", async () => {
  await withServer(async base => {
    const r = await fetch(base + "/api/tasks");
    assert.equal(r.status, 401);
  });
});
test("invalid JSON schema produces 400", async () => {
  await withServer(async base => {
    const r = await fetch(base + "/api/tasks", {
      method:"POST",
      headers:{ "Authorization":"Bearer test-token", "Content-Type":"application/json",
        "Idempotency-Key":"request_123456" },
      body:JSON.stringify({ title: 99 })
    });
    assert.equal(r.status, 400);
  });
});
