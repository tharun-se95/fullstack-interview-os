-- Dev-only schema. Applied by Compose only on first empty db volume.
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY,
  tenant_id text NOT NULL,
  title varchar(120) NOT NULL CHECK (length(trim(title)) > 0),
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tasks_tenant_request_unique UNIQUE (tenant_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS tasks_tenant_created_idx
  ON tasks (tenant_id, created_at DESC, id DESC);
