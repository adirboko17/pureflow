-- Analytics: visitor sessions + call button clicks (Phase 1)

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  landing_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  device TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  page_views INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX sessions_started_at_idx ON public.sessions (started_at DESC);
CREATE INDEX sessions_last_seen_at_idx ON public.sessions (last_seen_at DESC);
CREATE INDEX sessions_gclid_idx ON public.sessions (gclid) WHERE gclid IS NOT NULL;

CREATE TABLE public.call_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id UUID REFERENCES public.sessions (id) ON DELETE SET NULL,
  placement TEXT NOT NULL,
  page_path TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  device TEXT,
  user_agent TEXT
);

CREATE INDEX call_clicks_created_at_idx ON public.call_clicks (created_at DESC);
CREATE INDEX call_clicks_placement_idx ON public.call_clicks (placement);
CREATE INDEX call_clicks_session_id_idx ON public.call_clicks (session_id);

-- Inserts only via service_role (server functions). No anon write access.
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_clicks ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.sessions TO service_role;
GRANT ALL ON public.call_clicks TO service_role;

-- Authenticated users can read (admin UI uses authenticated client or server fn).
-- Writes remain service_role-only (no INSERT/UPDATE policies for anon/authenticated).
CREATE POLICY "Authenticated can read sessions"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can read call_clicks"
  ON public.call_clicks
  FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON public.sessions TO authenticated;
GRANT SELECT ON public.call_clicks TO authenticated;
