# Backend Practice — Express 5 + PostgreSQL

A real, local-first backend lab for **Fullstack Interview OS**. This is the hands-on complement to the browser coding challenges, not a production starter kit. Your job is to run the API, observe the SQL, break endpoints, fix mistakes and explain why your implementation behaves correctly under concurrent requests.

## What you will actually build

- An Express 5 server exposing `GET /health`, `GET /ready`, `GET /api/tasks`, `GET /api/tasks/:id`, `POST /api/tasks`, and `PATCH /api/tasks/:id`.
- PostgreSQL tables with PK/FK/CHECK constraints, a tenant-scoped recent-tasks index and a durable idempotency key table.
- Zod runtime validation, explicit safe response DTOs and error/status conventions.
- Two **local demo tenants** to test backend object-level authorization, including blocked cross-tenant reads/updates.
- Parameterized SQL, stable keyset pagination, a bounded connection pool and a single-connection transaction that protects concurrent duplicate POSTs.
- Node's built-in test runner, including two simultaneous POST requests with the same logical key.

**Security scope:** `DEMO_API_KEY_A/B` are fixed teaching credentials. This is **not production authentication**. Never expose this API on a public interface or deploy with these keys. Before production, replace the demo authenticator with audited OIDC/session auth, real user membership/permissions, secret management, rate limiting, CSRF controls if cookie-based, security logging, dependency patching and threat-model tests.

## Requirements

Node.js **22+**, npm, Docker with Compose, and a terminal. You can use Mac, Linux or WSL. The Docker container runs PostgreSQL; Node runs directly on your machine for debugger access.

## Run locally

```bash
cd backend-practice
cp .env.example .env
# Edit .env if port 5432 is already in use.
docker compose up -d
npm install
npm run migrate
npm test
npm run dev
```

Open `http://localhost:3001/health` for process liveness and `/ready` for a database readiness probe. `npm test` requires the Postgres container and migrated schema; the tests write disposable UUID-named tasks to the local training database.

### Try the API

```bash
# Source the local demo key from .env (this example uses the supplied LOCAL value).
KEY=training-key-a-change-before-any-public-use

curl -i -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer $KEY" \
  -H "Idempotency-Key: demo-create-0001" \
  -H "Content-Type: application/json" \
  -d '{"title":"Study PostgreSQL transactions"}'

curl -s http://localhost:3001/api/tasks?limit=5 \
  -H "Authorization: Bearer $KEY"
```

Replay the same POST with the same idempotency key: it should return the same ID with 200 rather than creating a second row. Replay the key with a different title: it should return 409. Repeat the GET using demo tenant B's key: it must not list tenant A's tasks.

## Progressive exercises

1. **HTTP + validation:** Explain each route's status codes. Send blank titles, extra `role` fields, malformed JSON and an oversized body. Add predictable errors without leaking stack traces.
2. **Database modeling:** Draw the schema and enforce a new `priority` enum using a backwards-compatible migration. Prove invalid values are rejected by Postgres, not only Zod.
3. **Authorization:** Write a test that creates a task as tenant A and attempts to read and edit it as tenant B. Explain why passing `tenantId` in query params would be insecure.
4. **Concurrency:** Fire 10 parallel POSTs under one idempotency key. Confirm exactly one task exists; explain why a process-local `Map` would fail across replicas.
5. **Pagination + performance:** Insert 1000 tasks for one tenant. Run `EXPLAIN (ANALYZE, BUFFERS)` for the recent-page query; compare it against a deep OFFSET scan.
6. **Failure injection:** Stop the Postgres container while the app is running. Observe `/health` vs `/ready`, pool timeout, 500 response safety and recovery.
7. **Real authentication (stretch):** Replace demo keys with an OIDC provider or secure server-side sessions, enforce membership and write logout/revocation tests.
8. **Background jobs (stretch):** Add a Redis-backed export worker returning HTTP 202 + job status, with durable idempotency and bounded retry.

## How the code is organized

```
backend-practice/
  compose.yaml              # Local Postgres (volume + healthcheck)
  .env.example              # Nonproduction template
  package.json
  sql/001_init.sql           # Constraints, index and dedupe table
  scripts/migrate.mjs        # Applies local SQL
  src/db.mjs                # Bounded connection pool
  src/app.mjs               # HTTP handlers, validation, SQL, tenant policies
  src/server.mjs            # Server lifecycle and shutdown
  tests/api.test.mjs        # Real HTTP + Postgres integration tests
```

## Interview checkpoints

Explain **why** a response may be lost after COMMIT, how `ON CONFLICT DO NOTHING` coordinates concurrent requests, why every transaction statement uses one database client, how a tenant-scoped query blocks IDOR, why `status: "done"` cannot be decided by React alone, and how you would evolve schema without breaking old replicas.

Official reading: [Express 5 error handling](https://expressjs.com/en/5x/guide/error-handling/), [node-postgres transactions](https://node-postgres.com/features/transactions), [PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html), [OWASP API Security](https://api-security.owasp.org/editions/2023/en/0x11-t10/).

**Verification note:** This training repository's syntax and course integration are subject to static checks; running end-to-end database tests requires a local Postgres container (Docker was unavailable in the authoring environment). Do not interpret the presence of tests as a claim that they have been executed on your machine.
