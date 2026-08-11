import { getClientIp } from "@/lib/geo.server";

type Cache = {
  ips: Set<string>;
  fetchedAt: number;
};

let cache: Cache | null = null;
const CACHE_TTL_MS = 30_000;

export function invalidateBlockedIpCache() {
  cache = null;
}

export async function getBlockedIpSet(): Promise<Set<string>> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.ips;
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("blocked_ips").select("ip_address");
    if (error) {
      console.error("[ip-block] fetch failed", error.message);
      return cache?.ips ?? new Set();
    }
    const ips = new Set((data ?? []).map((r) => r.ip_address).filter(Boolean));
    cache = { ips, fetchedAt: now };
    return ips;
  } catch (err) {
    console.error("[ip-block] fetch error", err);
    return cache?.ips ?? new Set();
  }
}

export async function isIpBlocked(ip: string | null | undefined): Promise<boolean> {
  if (!ip) return false;
  const set = await getBlockedIpSet();
  return set.has(ip);
}

export async function isRequestIpBlocked(headers: Headers): Promise<boolean> {
  return isIpBlocked(getClientIp(headers));
}

export function renderBlockedPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Access unavailable</title>
  <style>
    body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
      font-family: system-ui, sans-serif; background:#f4f7fa; color:#0f172a; }
    .box { max-width:28rem; padding:2rem; text-align:center; }
    h1 { font-size:1.25rem; margin:0 0 .5rem; }
    p { margin:0; color:#64748b; font-size:.95rem; line-height:1.5; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Access unavailable</h1>
    <p>This site is not available from your network.</p>
  </div>
</body>
</html>`;
}
