-- Re-runnable local training schema.
CREATE TABLE IF NOT EXISTS tenants (
 id text PRIMARY KEY,
 name text NOT NULL
);
INSERT INTO tenants(id,name) VALUES
 ('tenant-a','Training Team A'),
 ('tenant-b','Training Team B')
ON CONFLICT(id) DO NOTHING;
CREATE TABLE IF NOT EXISTS tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id text NOT NULL REFERENCES tenants(id),
 title text NOT NULL CHECK(length(title) BETWEEN 3 AND 120),
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','done')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_recent_tenant
 ON tasks(tenant_id,created_at DESC,id DESC);
CREATE TABLE IF NOT EXISTS request_dedupe (
 tenant_id text NOT NULL REFERENCES tenants(id),
 key text NOT NULL,
 request_hash text NOT NULL,
 task_id uuid REFERENCES tasks(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,key)
);
