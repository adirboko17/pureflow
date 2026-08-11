ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

CREATE INDEX IF NOT EXISTS sessions_ip_address_idx
  ON public.sessions (ip_address)
  WHERE ip_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS sessions_ip_started_at_idx
  ON public.sessions (ip_address, started_at DESC)
  WHERE ip_address IS NOT NULL;
