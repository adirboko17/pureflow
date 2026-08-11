import { trackCallClickEvent, trackSession } from "@/lib/analytics.functions";

const SESSION_KEY = "pf_session_id";
const ATTR_KEY = "pf_attribution";

export type Attribution = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
};

function randomUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
    const id = randomUuid();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return randomUuid();
  }
}

function readQueryAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    gclid: params.get("gclid"),
  };
}

function hasAnyAttribution(attr: Attribution): boolean {
  return Object.values(attr).some((v) => typeof v === "string" && v.length > 0);
}

/** Persist first-touch UTM/gclid for the browser session. */
export function captureAttribution(): Attribution {
  const fromQuery = readQueryAttribution();
  try {
    const storedRaw = sessionStorage.getItem(ATTR_KEY);
    if (storedRaw) {
      const stored = JSON.parse(storedRaw) as Attribution;
      if (hasAnyAttribution(fromQuery)) {
        const merged = { ...stored, ...fromQuery };
        sessionStorage.setItem(ATTR_KEY, JSON.stringify(merged));
        return merged;
      }
      return stored;
    }
    if (hasAnyAttribution(fromQuery)) {
      sessionStorage.setItem(ATTR_KEY, JSON.stringify(fromQuery));
    }
  } catch {
    /* ignore storage errors */
  }
  return fromQuery;
}

export function getStoredAttribution(): Attribution {
  try {
    const storedRaw = sessionStorage.getItem(ATTR_KEY);
    if (storedRaw) return JSON.parse(storedRaw) as Attribution;
  } catch {
    /* ignore */
  }
  return captureAttribution();
}

export function detectDevice(): "mobile" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  return /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

export async function reportSession(reason: "view" | "heartbeat" = "view"): Promise<void> {
  if (typeof window === "undefined") return;
  const sessionId = getOrCreateSessionId();
  const attribution = captureAttribution();
  try {
    await trackSession({
      data: {
        sessionId,
        path: `${window.location.pathname}${window.location.search}`,
        referrer: document.referrer || null,
        device: detectDevice(),
        reason,
        ...attribution,
      },
    });
  } catch {
    /* analytics must never break the page */
  }
}

export function reportCallClick(placement: string): void {
  if (typeof window === "undefined") return;
  const sessionId = getOrCreateSessionId();
  const attribution = getStoredAttribution();
  const payload = {
    sessionId,
    placement,
    path: `${window.location.pathname}${window.location.search}`,
    device: detectDevice(),
    ...attribution,
  };

  void trackCallClickEvent({ data: payload }).catch(() => {
    /* never block the call */
  });
}
