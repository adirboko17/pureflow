import { decodeGeoText } from "@/lib/geo-format";

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

function isPrivateOrLocalIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "127.0.0.1" || v === "::1" || v === "0.0.0.0") return true;
  if (v.startsWith("10.") || v.startsWith("192.168.") || v.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:")) return true;
  return false;
}

/** Best-effort visitor IP behind Vercel / Cloudflare / proxies. */
export function getClientIp(headers: Headers): string | null {
  const direct = firstHeader(headers, [
    "cf-connecting-ip",
    "true-client-ip",
    "x-vercel-forwarded-for",
    "x-real-ip",
  ]);

  const forwarded = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const candidates = [direct, ...forwarded].filter((ip): ip is string => Boolean(ip));

  for (const ip of candidates) {
    if (!isPrivateOrLocalIp(ip)) return ip;
  }

  return candidates[0] ?? null;
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

async function lookupIpGeo(ip: string): Promise<GeoInfo | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      country_code?: string;
      region?: string;
      city?: string;
      error?: boolean;
    };
    if (data.error) return null;
    return {
      country: decodeGeoText(data.country_code),
      region: decodeGeoText(data.region),
      city: decodeGeoText(data.city),
    };
  } catch {
    return null;
  }
}

/**
 * Resolve visitor geo.
 * On Vercel, prefer public client IP lookup so we don't store edge/proxy locations.
 * Platform geo headers are decoded fallbacks (they sometimes arrive URL-encoded).
 */
export async function resolveGeo(headers: Headers): Promise<GeoInfo> {
  const fromHeaders: GeoInfo = {
    country: decodeGeoText(
      firstHeader(headers, ["cf-ipcountry", "x-vercel-ip-country"]),
    ),
    region: decodeGeoText(
      firstHeader(headers, [
        "cf-region",
        "cf-region-code",
        "x-vercel-ip-country-region",
      ]),
    ),
    city: decodeGeoText(firstHeader(headers, ["cf-ipcity", "x-vercel-ip-city"])),
  };

  if (fromHeaders.country === "XX" || fromHeaders.country === "T1") {
    fromHeaders.country = null;
  }

  const ip = getClientIp(headers);
  if (ip && !isPrivateOrLocalIp(ip)) {
    const fromIp = await lookupIpGeo(ip);
    if (fromIp && (fromIp.city || fromIp.country || fromIp.region)) {
      return {
        country: fromIp.country ?? fromHeaders.country,
        region: fromIp.region ?? fromHeaders.region,
        city: fromIp.city ?? fromHeaders.city,
      };
    }
  }

  return fromHeaders;
}
