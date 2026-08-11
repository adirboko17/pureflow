export type GeoInfo = {
  country: string | null;
  region: string | null;
  city: string | null;
};

function firstHeader(headers: Headers, names: string[]): string | null {
  for (const name of names) {
    const value = headers.get(name)?.trim();
    if (value) return value;
  }
  return null;
}

export function getClientIp(headers: Headers): string | null {
  const forwarded = firstHeader(headers, ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"]);
  if (!forwarded) return null;
  return forwarded.split(",")[0]?.trim() || null;
}

function deviceFromUa(ua: string | null): string {
  if (!ua) return "unknown";
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) return "mobile";
  return "desktop";
}

export function getDeviceFromRequest(headers: Headers): string {
  return deviceFromUa(headers.get("user-agent"));
}

export function getUserAgentShort(headers: Headers): string | null {
  const ua = headers.get("user-agent");
  if (!ua) return null;
  return ua.slice(0, 240);
}

/** Prefer Cloudflare geo headers; optionally enrich via ipapi.co when city is missing. */
export async function resolveGeo(headers: Headers): Promise<GeoInfo> {
  const fromCf: GeoInfo = {
    country: firstHeader(headers, ["cf-ipcountry", "x-vercel-ip-country"]),
    region: firstHeader(headers, ["cf-region", "cf-region-code", "x-vercel-ip-country-region"]),
    city: firstHeader(headers, ["cf-ipcity", "x-vercel-ip-city"]),
  };

  if (fromCf.country === "XX" || fromCf.country === "T1") {
    fromCf.country = null;
  }

  if (fromCf.city || !fromCf.country) {
    return fromCf;
  }

  const ip = getClientIp(headers);
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return fromCf;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) return fromCf;
    const data = (await res.json()) as {
      country_code?: string;
      region?: string;
      city?: string;
      error?: boolean;
    };
    if (data.error) return fromCf;
    return {
      country: data.country_code ?? fromCf.country,
      region: data.region ?? fromCf.region,
      city: data.city ?? fromCf.city,
    };
  } catch {
    return fromCf;
  }
}
