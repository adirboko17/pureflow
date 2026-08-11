import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getClientIp,
  getDeviceFromRequest,
  getUserAgentShort,
  resolveGeo,
} from "@/lib/geo.server";
import { isTargetServiceArea, normalizeUsState, STATE_NAMES } from "@/lib/us-states";
import {
  campaignLabel,
  classifyTrafficSource,
} from "@/lib/traffic-source";

/** Sessions from the same IP at/above this count are flagged as suspicious. */
const SUSPICIOUS_IP_THRESHOLD = 10;

const attributionSchema = z.object({
  utm_source: z.string().trim().max(120).optional().nullable(),
  utm_medium: z.string().trim().max(120).optional().nullable(),
  utm_campaign: z.string().trim().max(120).optional().nullable(),
  utm_term: z.string().trim().max(120).optional().nullable(),
  utm_content: z.string().trim().max(120).optional().nullable(),
  gclid: z.string().trim().max(200).optional().nullable(),
});

const trackSessionSchema = z
  .object({
    sessionId: z.string().uuid(),
    path: z.string().trim().max(500).optional().nullable(),
    referrer: z.string().trim().max(500).optional().nullable(),
    device: z.enum(["mobile", "desktop", "unknown"]).optional().nullable(),
    reason: z.enum(["view", "heartbeat"]).optional().default("view"),
  })
  .merge(attributionSchema);

const trackCallClickSchema = z
  .object({
    sessionId: z.string().uuid().optional().nullable(),
    placement: z.string().trim().min(1).max(80),
    path: z.string().trim().max(500).optional().nullable(),
    device: z.enum(["mobile", "desktop", "unknown"]).optional().nullable(),
  })
  .merge(attributionSchema);

function nullIfEmpty(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function isAdminEmail(email: unknown): boolean {
  if (typeof email !== "string" || !email.trim()) return false;
  const allow = (process.env["ADMIN_EMAIL"] ?? process.env["VITE_ADMIN_EMAIL"] ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return false;
  return allow.includes(email.trim().toLowerCase());
}

function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysAgoUtc(n: number): Date {
  const d = startOfUtcDay();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export const trackSession = createServerFn({ method: "POST" })
  .validator((data: unknown) => trackSessionSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const request = getRequest();
      const headers = request.headers;
      const geo = await resolveGeo(headers);
      const ipAddress = getClientIp(headers);
      const device = data.device ?? getDeviceFromRequest(headers);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: existing } = await supabaseAdmin
        .from("sessions")
        .select("id, page_views")
        .eq("id", data.sessionId)
        .maybeSingle();

      if (existing) {
        const patch: {
          last_seen_at: string;
          country: string | null;
          region: string | null;
          city: string | null;
          ip_address?: string | null;
          page_views?: number;
        } = {
          last_seen_at: new Date().toISOString(),
          country: geo.country,
          region: geo.region,
          city: geo.city,
          ip_address: ipAddress,
        };
        if (data.reason !== "heartbeat") {
          patch.page_views = (existing.page_views ?? 1) + 1;
        }
        const { error } = await supabaseAdmin
          .from("sessions")
          .update(patch)
          .eq("id", data.sessionId);
        if (error) {
          console.error("[analytics] session bump failed", error.message);
          return { ok: false as const };
        }
        return { ok: true as const };
      }

      const { error } = await supabaseAdmin.from("sessions").insert({
        id: data.sessionId,
        landing_path: nullIfEmpty(data.path) ?? "/",
        referrer: nullIfEmpty(data.referrer),
        utm_source: nullIfEmpty(data.utm_source),
        utm_medium: nullIfEmpty(data.utm_medium),
        utm_campaign: nullIfEmpty(data.utm_campaign),
        utm_term: nullIfEmpty(data.utm_term),
        utm_content: nullIfEmpty(data.utm_content),
        gclid: nullIfEmpty(data.gclid),
        device,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        ip_address: ipAddress,
        page_views: 1,
      });
      if (error) {
        console.error("[analytics] session insert failed", error.message);
        return { ok: false as const };
      }
      return { ok: true as const };
    } catch (err) {
      console.error("[analytics] trackSession error", err);
      return { ok: false as const };
    }
  });

export const trackCallClickEvent = createServerFn({ method: "POST" })
  .validator((data: unknown) => trackCallClickSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const request = getRequest();
      const headers = request.headers;
      const geo = await resolveGeo(headers);
      const ipAddress = getClientIp(headers);
      const device = data.device ?? getDeviceFromRequest(headers);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const sessionId = data.sessionId ?? null;
      if (sessionId) {
        const { data: session } = await supabaseAdmin
          .from("sessions")
          .select("id")
          .eq("id", sessionId)
          .maybeSingle();
        if (!session) {
          await supabaseAdmin.from("sessions").insert({
            id: sessionId,
            landing_path: nullIfEmpty(data.path) ?? "/",
            utm_source: nullIfEmpty(data.utm_source),
            utm_medium: nullIfEmpty(data.utm_medium),
            utm_campaign: nullIfEmpty(data.utm_campaign),
            utm_term: nullIfEmpty(data.utm_term),
            utm_content: nullIfEmpty(data.utm_content),
            gclid: nullIfEmpty(data.gclid),
            device,
            country: geo.country,
            region: geo.region,
            city: geo.city,
            ip_address: ipAddress,
          });
        }
      }

      const { error } = await supabaseAdmin.from("call_clicks").insert({
        session_id: sessionId,
        placement: data.placement,
        page_path: nullIfEmpty(data.path),
        country: geo.country,
        region: geo.region,
        city: geo.city,
        utm_source: nullIfEmpty(data.utm_source),
        utm_medium: nullIfEmpty(data.utm_medium),
        utm_campaign: nullIfEmpty(data.utm_campaign),
        utm_term: nullIfEmpty(data.utm_term),
        utm_content: nullIfEmpty(data.utm_content),
        gclid: nullIfEmpty(data.gclid),
        device,
        user_agent: getUserAgentShort(headers),
      });
      if (error) {
        console.error("[analytics] call click insert failed", error.message);
        return { ok: false as const };
      }
      return { ok: true as const };
    } catch (err) {
      console.error("[analytics] trackCallClickEvent error", err);
      return { ok: false as const };
    }
  });

export const getAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const claimsEmail = (context.claims as { email?: string }).email;
    let email = claimsEmail;
    if (!email) {
      const { data: userData } = await context.supabase.auth.getUser();
      email = userData.user?.email ?? undefined;
    }
    if (!isAdminEmail(email)) {
      throw new Error("Forbidden: not an admin user. Set ADMIN_EMAIL to your login email.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const todayStart = startOfUtcDay().toISOString();
    const yesterdayStart = daysAgoUtc(1).toISOString();
    const rangeStart = daysAgoUtc(29).toISOString();
    const liveSince = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const [
      sessionsTodayRes,
      sessionsYesterdayRes,
      clicksTodayRes,
      clicksYesterdayRes,
      sessionsRangeRes,
      clicksRangeRes,
      recentClicksRes,
      placementRes,
      liveSessionsRes,
      geoSessionsRes,
      ipSessionsRes,
      blockedIpsRes,
    ] = await Promise.all([
      supabaseAdmin
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .gte("started_at", todayStart),
      supabaseAdmin
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .gte("started_at", yesterdayStart)
        .lt("started_at", todayStart),
      supabaseAdmin
        .from("call_clicks")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabaseAdmin
        .from("call_clicks")
        .select("id", { count: "exact", head: true })
        .gte("created_at", yesterdayStart)
        .lt("created_at", todayStart),
      supabaseAdmin
        .from("sessions")
        .select("started_at")
        .gte("started_at", rangeStart),
      supabaseAdmin
        .from("call_clicks")
        .select(
          "created_at, placement, utm_source, utm_medium, utm_campaign, gclid, device",
        )
        .gte("created_at", rangeStart),
      supabaseAdmin
        .from("call_clicks")
        .select(
          "id, created_at, placement, page_path, country, region, city, utm_campaign, gclid, device",
        )
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("call_clicks")
        .select("placement")
        .gte("created_at", rangeStart),
      supabaseAdmin
        .from("sessions")
        .select("id, city, region, country, last_seen_at, device")
        .gte("last_seen_at", liveSince)
        .order("last_seen_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("sessions")
        .select(
          "city, region, country, utm_source, utm_medium, utm_campaign, gclid, referrer, device",
        )
        .gte("started_at", rangeStart)
        .limit(5000),
      supabaseAdmin
        .from("sessions")
        .select("id, ip_address, started_at, last_seen_at, page_views, city, region, country, gclid, device")
        .gte("started_at", rangeStart)
        .not("ip_address", "is", null)
        .limit(5000),
      supabaseAdmin
        .from("blocked_ips")
        .select("ip_address, reason, created_at, created_by")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const sessionsToday = sessionsTodayRes.count ?? 0;
    const sessionsYesterday = sessionsYesterdayRes.count ?? 0;
    const clicksToday = clicksTodayRes.count ?? 0;
    const clicksYesterday = clicksYesterdayRes.count ?? 0;
    const ctrToday = sessionsToday > 0 ? clicksToday / sessionsToday : 0;

    const dayKeys: string[] = [];
    for (let i = 29; i >= 0; i--) {
      dayKeys.push(toDateKey(daysAgoUtc(i).toISOString()));
    }
    const sessionsByDay = new Map(dayKeys.map((k) => [k, 0]));
    const clicksByDay = new Map(dayKeys.map((k) => [k, 0]));

    for (const row of sessionsRangeRes.data ?? []) {
      const key = toDateKey(row.started_at);
      if (sessionsByDay.has(key)) {
        sessionsByDay.set(key, (sessionsByDay.get(key) ?? 0) + 1);
      }
    }
    for (const row of clicksRangeRes.data ?? []) {
      const key = toDateKey(row.created_at);
      if (clicksByDay.has(key)) {
        clicksByDay.set(key, (clicksByDay.get(key) ?? 0) + 1);
      }
    }

    const daily = dayKeys.map((date) => ({
      date,
      sessions: sessionsByDay.get(date) ?? 0,
      clicks: clicksByDay.get(date) ?? 0,
    }));

    const placementCounts = new Map<string, number>();
    for (const row of placementRes.data ?? []) {
      const key = row.placement || "unknown";
      placementCounts.set(key, (placementCounts.get(key) ?? 0) + 1);
    }
    const byPlacement = [...placementCounts.entries()]
      .map(([placement, count]) => ({ placement, count }))
      .sort((a, b) => b.count - a.count);

    const topPlacement = byPlacement[0]?.placement ?? null;

    const liveVisitors = (liveSessionsRes.data ?? []).map((row) => ({
      id: row.id,
      city: row.city,
      region: row.region,
      country: row.country,
      last_seen_at: row.last_seen_at,
      device: row.device,
      stateCode: normalizeUsState(row.region),
      inServiceArea: isTargetServiceArea(row.city, normalizeUsState(row.region)),
    }));

    const stateCounts = new Map<string, number>();
    const cityCounts = new Map<string, { city: string; region: string | null; count: number }>();
    let usSessions = 0;
    let texasSessions = 0;
    let serviceAreaSessions = 0;

    for (const row of geoSessionsRes.data ?? []) {
      const country = (row.country ?? "").toUpperCase();
      const isUs = country === "US" || country === "USA" || country === "UNITED STATES";
      const stateCode = normalizeUsState(row.region);
      if (isUs || stateCode) {
        usSessions += 1;
        if (stateCode) {
          stateCounts.set(stateCode, (stateCounts.get(stateCode) ?? 0) + 1);
          if (stateCode === "TX") texasSessions += 1;
        }
        if (isTargetServiceArea(row.city, stateCode)) serviceAreaSessions += 1;
      }
      if (row.city) {
        const key = `${row.city}|${row.region ?? ""}`;
        const prev = cityCounts.get(key);
        if (prev) prev.count += 1;
        else cityCounts.set(key, { city: row.city, region: row.region, count: 1 });
      }
    }

    const byState = [...stateCounts.entries()]
      .map(([code, count]) => ({
        code,
        name: STATE_NAMES[code] ?? code,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const byCity = [...cityCounts.values()].sort((a, b) => b.count - a.count).slice(0, 15);

    type IpAgg = {
      ip: string;
      sessions: number;
      pageViews: number;
      gclidSessions: number;
      cities: Set<string>;
      countries: Set<string>;
      firstSeen: string;
      lastSeen: string;
      devices: Set<string>;
    };

    const ipMap = new Map<string, IpAgg>();
    for (const row of ipSessionsRes.data ?? []) {
      const ip = row.ip_address;
      if (!ip) continue;
      let agg = ipMap.get(ip);
      if (!agg) {
        agg = {
          ip,
          sessions: 0,
          pageViews: 0,
          gclidSessions: 0,
          cities: new Set(),
          countries: new Set(),
          firstSeen: row.started_at,
          lastSeen: row.last_seen_at,
          devices: new Set(),
        };
        ipMap.set(ip, agg);
      }
      agg.sessions += 1;
      agg.pageViews += row.page_views ?? 1;
      if (row.gclid) agg.gclidSessions += 1;
      if (row.city) agg.cities.add(row.city);
      if (row.country) agg.countries.add(row.country);
      if (row.device) agg.devices.add(row.device);
      if (row.started_at < agg.firstSeen) agg.firstSeen = row.started_at;
      if (row.last_seen_at > agg.lastSeen) agg.lastSeen = row.last_seen_at;
    }

    type FunnelAgg = { key: string; label: string; sessions: number; clicks: number };
    const sourceMap = new Map<string, FunnelAgg>();
    const campaignMap = new Map<string, FunnelAgg>();
    const deviceMap = new Map<string, FunnelAgg>();

    const bump = (
      map: Map<string, FunnelAgg>,
      key: string,
      label: string,
      field: "sessions" | "clicks",
    ) => {
      let row = map.get(key);
      if (!row) {
        row = { key, label, sessions: 0, clicks: 0 };
        map.set(key, row);
      }
      row[field] += 1;
    };

    for (const row of geoSessionsRes.data ?? []) {
      const source = classifyTrafficSource(row);
      bump(sourceMap, source.key, source.label, "sessions");
      const campaign = campaignLabel(row.utm_campaign);
      bump(campaignMap, campaign.toLowerCase(), campaign, "sessions");
      const device = (row.device || "unknown").toLowerCase();
      bump(deviceMap, device, device, "sessions");
    }

    for (const row of clicksRangeRes.data ?? []) {
      const source = classifyTrafficSource(row);
      bump(sourceMap, source.key, source.label, "clicks");
      const campaign = campaignLabel(row.utm_campaign);
      bump(campaignMap, campaign.toLowerCase(), campaign, "clicks");
      const device = (row.device || "unknown").toLowerCase();
      bump(deviceMap, device, device, "clicks");
    }

    const toFunnel = (map: Map<string, FunnelAgg>) =>
      [...map.values()]
        .map((row) => ({
          ...row,
          ctr: row.sessions > 0 ? row.clicks / row.sessions : 0,
        }))
        .sort((a, b) => b.sessions - a.sessions || b.clicks - a.clicks);

    const bySource = toFunnel(sourceMap).slice(0, 12);
    const byCampaign = toFunnel(campaignMap)
      .filter((row) => row.label !== "(none)" || row.sessions + row.clicks > 0)
      .slice(0, 10);
    const byDevice = toFunnel(deviceMap);

    const blockedIps = blockedIpsRes.data ?? [];
    const blockedSet = new Set(blockedIps.map((r) => r.ip_address));

    const suspiciousIps = [...ipMap.values()]
      .filter((a) => a.sessions >= SUSPICIOUS_IP_THRESHOLD)
      .map((a) => ({
        ip: a.ip,
        sessions: a.sessions,
        pageViews: a.pageViews,
        gclidSessions: a.gclidSessions,
        cities: [...a.cities].slice(0, 5),
        countries: [...a.countries],
        devices: [...a.devices],
        firstSeen: a.firstSeen,
        lastSeen: a.lastSeen,
        fromAds: a.gclidSessions > 0,
        blocked: blockedSet.has(a.ip),
        severity:
          a.sessions >= 25
            ? ("high" as const)
            : a.sessions >= 15
              ? ("medium" as const)
              : ("watch" as const),
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 50);

    return {
      kpis: {
        sessionsToday,
        sessionsYesterday,
        clicksToday,
        clicksYesterday,
        ctrToday,
        topPlacement,
        liveNow: liveVisitors.length,
        suspiciousIpCount: suspiciousIps.length,
        blockedIpCount: blockedIps.length,
      },
      daily,
      byPlacement,
      recentClicks: recentClicksRes.data ?? [],
      liveVisitors,
      byState,
      byCity,
      geoSummary: {
        usSessions,
        texasSessions,
        serviceAreaSessions,
        texasShare: usSessions > 0 ? texasSessions / usSessions : 0,
        serviceAreaShare: usSessions > 0 ? serviceAreaSessions / usSessions : 0,
      },
      suspiciousIps,
      suspiciousThreshold: SUSPICIOUS_IP_THRESHOLD,
      blockedIps,
      bySource,
      byCampaign,
      byDevice,
    };
  });
