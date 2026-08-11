import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Radio,
  RefreshCw,
  ShieldBan,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminAnalytics } from "@/lib/analytics.functions";
import { blockIp, unblockIp } from "@/lib/ip-block.functions";
import { UsTrafficMap } from "@/components/UsTrafficMap";
import { formatLocation } from "@/lib/geo-format";
import {
  ADMIN_FOCUS_STATE_KEY,
  STATE_NAMES,
  US_STATE_OPTIONS,
} from "@/lib/us-states";
import type { Session, User } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "PureFlow Admin · Call analytics" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
  }),
  component: AdminPage,
});

function formatPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [ipBusy, setIpBusy] = useState<string | null>(null);
  const [manualIp, setManualIp] = useState("");
  const [ipActionError, setIpActionError] = useState<string | null>(null);
  const [focusState, setFocusState] = useState("TX");

  const fetchAnalytics = useServerFn(getAdminAnalytics);
  const doBlockIp = useServerFn(blockIp);
  const doUnblockIp = useServerFn(unblockIp);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_FOCUS_STATE_KEY);
      if (stored && STATE_NAMES[stored]) setFocusState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const analyticsQuery = useQuery({
    queryKey: ["admin-analytics", user?.id],
    enabled: Boolean(session && user),
    queryFn: () => fetchAnalytics(),
    refetchInterval: 10_000,
    retry: 1,
  });

  const onSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setSigningIn(false);
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
  };

  const onBlockIp = async (ip: string) => {
    if (
      !window.confirm(
        `Block ${ip} from the public site?\n\n/admin stays available so you can unblock later.`,
      )
    ) {
      return;
    }
    setIpBusy(ip);
    setIpActionError(null);
    try {
      await doBlockIp({ data: { ip, reason: "Blocked from admin dashboard" } });
      await analyticsQuery.refetch();
    } catch (err) {
      setIpActionError(err instanceof Error ? err.message : "Could not block IP");
    } finally {
      setIpBusy(null);
    }
  };

  const onUnblockIp = async (ip: string) => {
    setIpBusy(ip);
    setIpActionError(null);
    try {
      await doUnblockIp({ data: { ip } });
      await analyticsQuery.refetch();
    } catch (err) {
      setIpActionError(err instanceof Error ? err.message : "Could not unblock IP");
    } finally {
      setIpBusy(null);
    }
  };

  const onManualBlock = async (e: FormEvent) => {
    e.preventDefault();
    const ip = manualIp.trim();
    if (!ip) return;
    await onBlockIp(ip);
    setManualIp("");
  };

  const chartData = useMemo(() => {
    const daily = analyticsQuery.data?.daily ?? [];
    return daily.slice(-14).map((d) => ({
      ...d,
      label: d.date.slice(5),
    }));
  }, [analyticsQuery.data?.daily]);

  const focusStateShare = useMemo(() => {
    const usSessions = analyticsQuery.data?.geoSummary?.usSessions ?? 0;
    const stateSessions =
      analyticsQuery.data?.byState?.find((s) => s.code === focusState)?.count ?? 0;
    return usSessions > 0 ? stateSessions / usSessions : 0;
  }, [analyticsQuery.data?.geoSummary?.usSessions, analyticsQuery.data?.byState, focusState]);

  const onFocusStateChange = (code: string) => {
    setFocusState(code);
    try {
      localStorage.setItem(ADMIN_FOCUS_STATE_KEY, code);
    } catch {
      /* ignore */
    }
  };

  if (!authReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mist">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mist px-4 py-8">
        <form
          onSubmit={onSignIn}
          className="w-full max-w-md border border-border bg-background p-6 shadow-sm sm:p-8"
        >
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            Call analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your admin Supabase account. Set{" "}
            <code className="text-xs">ADMIN_EMAIL</code> to your allowlisted email.
          </p>
          <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Email
            <input
              type="email"
              required
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 min-h-12 w-full border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 min-h-12 w-full border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:border-primary"
            />
          </label>
          {authError ? <p className="mt-3 text-sm text-destructive">{authError}</p> : null}
          <button
            type="submit"
            disabled={signingIn}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-ink disabled:opacity-60"
          >
            {signingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const kpis = analyticsQuery.data?.kpis;
  const suspiciousIps = analyticsQuery.data?.suspiciousIps ?? [];
  const recentClicks = analyticsQuery.data?.recentClicks ?? [];
  const blockedIps = analyticsQuery.data?.blockedIps ?? [];
  const errorMessage =
    analyticsQuery.error instanceof Error
      ? analyticsQuery.error.message
      : analyticsQuery.isError
        ? "Could not load analytics. Check ADMIN_EMAIL allowlist."
        : null;

  return (
    <div className="min-h-dvh bg-mist pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-3 px-3 py-3 sm:items-center sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-bold text-foreground sm:text-2xl">
              Call analytics
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">{user.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void analyticsQuery.refetch()}
              aria-label="Refresh"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-mist sm:min-w-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${analyticsQuery.isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => void onSignOut()}
              aria-label="Sign out"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-mist sm:min-w-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-5 sm:py-8">
        {errorMessage ? (
          <div className="mb-4 border border-destructive/30 bg-background px-3 py-3 text-sm text-destructive sm:mb-6 sm:px-4">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi
            icon={<Radio className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4" />}
            label="Live now"
            value={kpis ? String(kpis.liveNow) : "—"}
            hint="last 2 min"
            live
          />
          <Kpi
            icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-600 sm:h-4 sm:w-4" />}
            label="Suspicious"
            value={kpis ? String(kpis.suspiciousIpCount) : "—"}
            hint={`≥${analyticsQuery.data?.suspiciousThreshold ?? 10} · 30d`}
          />
          <Kpi
            icon={<Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            label="Sessions"
            value={kpis ? String(kpis.sessionsToday) : "—"}
            {...(kpis ? { hint: `${kpis.sessionsYesterday} yesterday` } : {})}
          />
          <Kpi
            icon={<Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            label="Call clicks"
            value={kpis ? String(kpis.clicksToday) : "—"}
            {...(kpis ? { hint: `${kpis.clicksYesterday} yesterday` } : {})}
          />
          <Kpi label="CTR today" value={kpis ? formatPct(kpis.ctrToday) : "—"} hint="clicks ÷ sessions" />
          <div className="border border-border bg-background p-3 sm:p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:gap-2 sm:text-xs sm:tracking-[0.12em]">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">State share</span>
            </div>
            <p className="mt-1.5 font-display text-xl font-bold text-foreground sm:mt-2 sm:text-2xl">
              {analyticsQuery.data ? formatPct(focusStateShare) : "—"}
            </p>
            <label className="mt-2 block">
              <span className="sr-only">Focus state</span>
              <select
                value={focusState}
                onChange={(e) => onFocusStateChange(e.target.value)}
                className="min-h-9 w-full border border-border bg-background px-2 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-primary"
              >
                {US_STATE_OPTIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">of US sessions · 30d</p>
          </div>
        </div>

        {ipActionError ? (
          <div className="mt-4 border border-destructive/30 bg-background px-3 py-3 text-sm text-destructive sm:px-4">
            {ipActionError}
          </div>
        ) : null}

        {/* Traffic sources */}
        <section className="mt-6 border border-border bg-background sm:mt-8">
          <div className="border-b border-border px-3 py-3 sm:px-5">
            <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
              Traffic sources
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Last 30 days · sessions, call clicks, and CTR by channel (from UTM / gclid / referrer)
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-3 lg:divide-x lg:divide-border">
            <FunnelList
              title="By channel"
              empty="No source data yet"
              rows={analyticsQuery.data?.bySource ?? []}
            />
            <FunnelList
              title="By campaign"
              empty="No campaign tags yet"
              rows={analyticsQuery.data?.byCampaign ?? []}
            />
            <FunnelList
              title="By device"
              empty="No device data yet"
              rows={analyticsQuery.data?.byDevice ?? []}
            />
          </div>
        </section>

        {/* Suspicious IPs */}
        <section className="mt-6 border border-amber-200 bg-background sm:mt-8">
          <div className="border-b border-amber-200 bg-amber-50/60 px-3 py-3 sm:px-5">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-foreground sm:text-lg">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              Suspicious repeat IPs
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {analyticsQuery.data?.suspiciousThreshold ?? 10}+ sessions / 30 days. Tap Block to ban
              from the site. Prefer From-ads IPs for Google Ads exclusions too.
            </p>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-3 md:hidden">
            {suspiciousIps.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No IPs over the threshold yet.
              </p>
            ) : (
              suspiciousIps.map((row) => (
                <article key={row.ip} className="border border-border bg-mist/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="break-all font-mono text-sm font-semibold text-foreground">
                      {row.ip}
                    </p>
                    <SeverityBadge severity={row.severity} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Sessions</dt>
                      <dd className="font-bold text-foreground">{row.sessions}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Page views</dt>
                      <dd className="font-semibold text-foreground">{row.pageViews}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="text-foreground">
                        {formatLocation(row.cities[0], null, row.countries[0]) || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Ads</dt>
                      <dd>
                        {row.fromAds ? (
                          <span className="font-semibold text-red-700">
                            Yes ({row.gclidSessions})
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No gclid</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Last seen</dt>
                      <dd className="text-foreground">{formatWhen(row.lastSeen)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3">
                    {row.blocked ? (
                      <button
                        type="button"
                        disabled={ipBusy === row.ip}
                        onClick={() => void onUnblockIp(row.ip)}
                        className="inline-flex min-h-11 w-full items-center justify-center border border-border bg-background text-sm font-bold text-foreground disabled:opacity-50"
                      >
                        {ipBusy === row.ip ? "…" : "Unblock"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={ipBusy === row.ip}
                        onClick={() => void onBlockIp(row.ip)}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 bg-ink text-sm font-bold text-ink-foreground disabled:opacity-50"
                      >
                        <ShieldBan className="h-4 w-4" />
                        {ipBusy === row.ip ? "…" : "Block IP"}
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-mist/80 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">IP</th>
                  <th className="px-4 py-2.5 font-semibold">Sessions</th>
                  <th className="px-4 py-2.5 font-semibold">Page views</th>
                  <th className="px-4 py-2.5 font-semibold">Location</th>
                  <th className="px-4 py-2.5 font-semibold">Ads</th>
                  <th className="px-4 py-2.5 font-semibold">Severity</th>
                  <th className="px-4 py-2.5 font-semibold">Last seen</th>
                  <th className="px-4 py-2.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {suspiciousIps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                      No IPs over the threshold yet. New visits will record IP automatically.
                    </td>
                  </tr>
                ) : (
                  suspiciousIps.map((row) => (
                    <tr key={row.ip} className="border-t border-border">
                      <td className="px-5 py-3 font-mono text-sm font-semibold text-foreground">
                        {row.ip}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-bold text-foreground">
                        {row.sessions}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-foreground/85">{row.pageViews}</td>
                      <td className="px-4 py-3 text-foreground/85">
                        {formatLocation(row.cities[0], null, row.countries[0]) || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.fromAds ? (
                          <span className="bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                            From ads ({row.gclidSessions})
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No gclid</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={row.severity} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-foreground/85">
                        {formatWhen(row.lastSeen)}
                      </td>
                      <td className="px-4 py-3">
                        {row.blocked ? (
                          <button
                            type="button"
                            disabled={ipBusy === row.ip}
                            onClick={() => void onUnblockIp(row.ip)}
                            className="text-xs font-bold text-primary underline underline-offset-2 disabled:opacity-50"
                          >
                            {ipBusy === row.ip ? "…" : "Unblock"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={ipBusy === row.ip}
                            onClick={() => void onBlockIp(row.ip)}
                            className="inline-flex items-center gap-1 bg-ink px-2.5 py-1.5 text-xs font-bold text-ink-foreground hover:opacity-90 disabled:opacity-50"
                          >
                            <ShieldBan className="h-3.5 w-3.5" />
                            {ipBusy === row.ip ? "…" : "Block"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Blocked IPs */}
        <section className="mt-5 border border-border bg-background p-3 sm:mt-6 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-foreground sm:text-lg">
                <ShieldBan className="h-5 w-5 shrink-0" />
                Blocked IPs
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {kpis?.blockedIpCount ?? 0} blocked · site returns 403 · /admin always open
              </p>
            </div>
            <form
              onSubmit={(e) => void onManualBlock(e)}
              className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
            >
              <input
                type="text"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                placeholder="Block IP manually"
                inputMode="text"
                autoCapitalize="off"
                autoCorrect="off"
                className="min-h-11 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary sm:w-56"
              />
              <button
                type="submit"
                disabled={!manualIp.trim() || ipBusy === manualIp.trim()}
                className="inline-flex min-h-11 items-center justify-center bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                Block IP
              </button>
            </form>
          </div>
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {blockedIps.length === 0 ? (
              <li className="py-6 text-sm text-muted-foreground">No blocked IPs yet.</li>
            ) : (
              blockedIps.map((row) => (
                <li
                  key={row.ip_address}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-all font-mono text-sm font-semibold text-foreground">
                      {row.ip_address}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.reason || "Blocked"} · {formatWhen(row.created_at)}
                      {row.created_by ? ` · ${row.created_by}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={ipBusy === row.ip_address}
                    onClick={() => void onUnblockIp(row.ip_address)}
                    className="inline-flex min-h-11 w-full items-center justify-center border border-border px-3 text-sm font-bold text-foreground hover:bg-mist disabled:opacity-50 sm:w-auto"
                  >
                    {ipBusy === row.ip_address ? "…" : "Unblock"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="border border-border bg-background p-3 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                  US traffic map
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sessions by state · 30 days · darker = more
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {STATE_NAMES[focusState] ?? focusState} share:{" "}
                <span className="font-semibold text-foreground">
                  {formatPct(focusStateShare)}
                </span>
              </p>
            </div>
            <div className="mt-3 -mx-1 overflow-x-auto sm:mx-0 sm:mt-4 sm:overflow-visible">
              <div className="min-w-[280px]">
                <UsTrafficMap
                  byState={analyticsQuery.data?.byState ?? []}
                  focusState={focusState}
                />
              </div>
            </div>
          </section>

          <section className="border border-border bg-background p-3 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                Live on site
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {kpis?.liveNow ?? 0} live
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Updates every 10s</p>
            <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto overscroll-contain sm:max-h-[420px]">
              {(analyticsQuery.data?.liveVisitors ?? []).length === 0 ? (
                <li className="py-6 text-sm text-muted-foreground">
                  Nobody live right now. Open the homepage in another tab to test.
                </li>
              ) : (
                analyticsQuery.data?.liveVisitors.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-start justify-between gap-3 border-b border-border py-2.5 text-sm last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold break-words text-foreground">
                        {formatLocation(v.city, v.stateCode || v.region, v.country) ||
                          "Unknown location"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {v.device ?? "device?"} · {formatWhen(v.last_seen_at)}
                      </p>
                    </div>
                    {v.stateCode === focusState ? (
                      <span className="shrink-0 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                        Target
                      </span>
                    ) : (
                      <span className="shrink-0 bg-mist px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Outside
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>

            <h3 className="mt-6 font-display text-base font-bold text-foreground">Top cities</h3>
            <ul className="mt-3 space-y-2">
              {(analyticsQuery.data?.byCity ?? []).length === 0 ? (
                <li className="text-sm text-muted-foreground">No city data yet</li>
              ) : (
                analyticsQuery.data?.byCity.map((row) => (
                  <li
                    key={`${row.city}-${row.region}`}
                    className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0"
                  >
                    <span className="min-w-0 break-words text-foreground">
                      {formatLocation(row.city, row.region) || "—"}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <section className="mt-6 border border-border bg-background p-3 sm:mt-8 sm:p-6">
          <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
            Daily traffic (14 days)
          </h2>
          <div className="mt-3 h-56 w-full sm:mt-4 sm:h-72">
            {analyticsQuery.isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={36} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="sessions" name="Sessions" fill="#1e3a5f" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="clicks" name="Call clicks" fill="#6b8cae" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[1fr_280px]">
          <section className="border border-border bg-background">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-5">
              <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                Recent call clicks
              </h2>
              <span className="shrink-0 text-xs text-muted-foreground">Every 10s</span>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-3 md:hidden">
              {recentClicks.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No call clicks yet. Tap a Call button on the site to test.
                </p>
              ) : (
                recentClicks.map((row) => (
                  <article key={row.id} className="border border-border bg-mist/40 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{row.placement}</p>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {formatWhen(row.created_at)}
                      </p>
                    </div>
                    <p className="mt-1 text-foreground/85">
                      {formatLocation(row.city, row.region, row.country) || "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.utm_campaign || (row.gclid ? "gclid" : "direct")} · {row.device ?? "—"}
                    </p>
                  </article>
                ))
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-mist/80 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">When</th>
                    <th className="px-4 py-2.5 font-semibold">Placement</th>
                    <th className="px-4 py-2.5 font-semibold">Location</th>
                    <th className="px-4 py-2.5 font-semibold">Campaign</th>
                    <th className="px-4 py-2.5 font-semibold">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClicks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                        No call clicks yet. Click a Call button on the site to test.
                      </td>
                    </tr>
                  ) : (
                    recentClicks.map((row) => (
                      <tr key={row.id} className="border-t border-border">
                        <td className="px-5 py-3 whitespace-nowrap text-foreground/90">
                          {formatWhen(row.created_at)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">{row.placement}</td>
                        <td className="px-4 py-3 text-foreground/85">
                          {formatLocation(row.city, row.region, row.country) || "—"}
                        </td>
                        <td className="px-4 py-3 text-foreground/85">
                          {row.utm_campaign || (row.gclid ? "gclid" : "—")}
                        </td>
                        <td className="px-4 py-3 text-foreground/85">{row.device ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-border bg-background p-3 sm:p-5">
            <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
              By placement
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Last 30 days</p>
            <ul className="mt-4 space-y-2">
              {(analyticsQuery.data?.byPlacement ?? []).length === 0 ? (
                <li className="text-sm text-muted-foreground">No data yet</li>
              ) : (
                analyticsQuery.data?.byPlacement.map((row) => (
                  <li
                    key={row.placement}
                    className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-sm last:border-0"
                  >
                    <span className="min-w-0 break-words font-semibold text-foreground">
                      {row.placement}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

function FunnelList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: Array<{ key: string; label: string; sessions: number; clicks: number; ctr: number }>;
}) {
  return (
    <div className="border-b border-border p-3 last:border-b-0 lg:border-b-0 lg:p-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <li key={row.key} className="border-b border-border py-2.5 last:border-0">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 break-words text-sm font-semibold text-foreground">{row.label}</p>
                <p className="shrink-0 text-xs font-bold tabular-nums text-foreground">
                  {formatPct(row.ctr)}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.sessions} sessions · {row.clicks} call clicks
              </p>
              <div className="mt-2 h-1.5 overflow-hidden bg-mist">
                <div
                  className="h-full bg-primary/80"
                  style={{
                    width: `${Math.min(100, Math.max(row.ctr * 100, row.sessions > 0 ? 2 : 0))}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "watch" | "medium" | "high" }) {
  const styles =
    severity === "high"
      ? "bg-red-50 text-red-700"
      : severity === "medium"
        ? "bg-amber-50 text-amber-800"
        : "bg-mist text-muted-foreground";
  return (
    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles}`}>
      {severity}
    </span>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
  live,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  live?: boolean;
}) {
  return (
    <div
      className={`border border-border bg-background p-3 sm:p-4 ${live ? "ring-1 ring-emerald-200" : ""}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:gap-2 sm:text-xs sm:tracking-[0.12em]">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 font-display text-xl font-bold text-foreground sm:mt-2 sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">{hint}</p> : null}
    </div>
  );
}
