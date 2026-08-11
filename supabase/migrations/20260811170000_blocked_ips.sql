CREATE TABLE public.blocked_ips (
  ip_address TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT
);

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.blocked_ips TO service_role;

CREATE POLICY "Authenticated can read blocked_ips"
  ON public.blocked_ips
  FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON public.blocked_ips TO authenticated;
