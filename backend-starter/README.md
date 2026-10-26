# Backend Engineering Workshop — runnable starter

A small **learning-only** Express 5 + TypeScript + PostgreSQL service. It is intentionally not production deployable: authentication is a local demo token and a fixed demo tenant. The point is to build it, understand it, add safeguards and test real database behavior.

## Start with Docker Compose

From `backend-starter/` run:

```sh
docker compose up --build
curl -i http://localhost:3001/health/live
curl -i http://localhost:3001/health/ready
curl -i -H "Authorization: Bearer change-me-local-only" http://localhost:3001/api/tasks
curl -i -X POST http://localhost:3001/api/tasks \
 -H "Authorization: Bearer change-me-local-only" \
 -H "Idempotency-Key: demo-request-001" \
 -H "Content-Type: application/json" \
 -d '{"title":"Investigate slow SQL query"}'
```

First POST is 201; replaying the same key+body is 200 with the same task ID; replay with different title returns 409. Only `/health/live` and `/health/ready` are public. Changes to `sql/001_init.sql` run automatically only on **fresh** database volumes. Do not wipe a production volume.

## Run tests on your host

```sh
npm install
npm run typecheck
npm test
npm run build
```

The starter uses `node:test` via tsx; tests exercise liveness, authentication and invalid input. **They are not database integration tests.** Your first workshop task is to write a real Postgres concurrency test for duplicate idempotency keys. The repo does not yet contain a generated lockfile; after `npm install`, commit `package-lock.json` before relying on deterministic production builds. Dockerfile uses `npm install` for that reason.

## Your engineering missions

1. Trace request → middleware → validation → SQL → response. Draw boundaries and HTTP statuses.
2. Add a DB-backed integration test: 20 concurrent POSTs with the same key. Only one row must exist.
3. Add a cursor-based GET with stable `(created_at,id)` sorting and tests for timestamps ties.
4. Replace the demo Bearer token with signed/revocable sessions; authorize actual tenant membership on each resource.
5. Add Redis caching **only to explicitly safe public data**; instrument cache misses and DB fallback.
6. Add a durable export queue with BullMQ; return 202 + status and enforce idempotent workers.
7. Implement OpenTelemetry/structured request logs, graceful shutdown and alertable health metrics.
8. Containerize/CI-test and deploy to an authorized sandbox with managed DB, secrets and a recovery plan.

## Important boundaries

- **Do not deploy this starter to the internet as-is.** It deliberately uses demo auth, static tenancy, a simple schema and basic error handling. `server.ts` refuses NODE_ENV=production to reinforce this.
- `DEV_API_TOKEN` and sample Postgres password are strictly local. Rotate them and use proper secret management before production use.
- The workshop instructions are scored using explicit acceptance criteria **by you**. There is no claim that browser-based checks can start Docker, Postgres or Node on your computer.
- Once you have a local service working, attach a code diff or explain the failure and use ChatGPT for debugging or mock review.

Official references: [Express middleware](https://expressjs.com/en/guide/using-middleware.html), [Postgres constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), [Docker Node guide](https://docs.docker.com/guides/nodejs/), [BullMQ](https://docs.bullmq.io/guide/workers).
