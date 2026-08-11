export type TrafficAttribution = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  gclid?: string | null;
  referrer?: string | null;
};

export type TrafficSourceBucket = {
  key: string;
  label: string;
};

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function hostFromReferrer(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/** Classify a visit/click into a marketing channel bucket. */
export function classifyTrafficSource(attr: TrafficAttribution): TrafficSourceBucket {
  const source = norm(attr.utm_source);
  const medium = norm(attr.utm_medium);
  const host = hostFromReferrer(attr.referrer);
  const hasGclid = Boolean(attr.gclid && attr.gclid.trim());

  const paidMedium =
    medium === "cpc" ||
    medium === "ppc" ||
    medium === "paid" ||
    medium === "paidsocial" ||
    medium === "paid_social" ||
    medium === "display";

  if (
    hasGclid ||
    (source.includes("google") && paidMedium) ||
    source === "googleads" ||
    source === "adwords"
  ) {
    return { key: "google_ads", label: "Google Ads" };
  }

  if (
    source.includes("facebook") ||
    source.includes("instagram") ||
    source === "fb" ||
    source === "ig" ||
    source.includes("meta") ||
    host?.includes("facebook.com") ||
    host?.includes("instagram.com") ||
    host?.includes("l.facebook.com")
  ) {
    return { key: "meta", label: "Facebook / Instagram" };
  }

  if (source.includes("tiktok") || host?.includes("tiktok.com")) {
    return { key: "tiktok", label: "TikTok" };
  }

  if (
    medium === "organic" ||
    source === "google" ||
    host?.includes("google.") ||
    host === "google.com"
  ) {
    if (host?.includes("bing.") || source === "bing") {
      return { key: "bing_organic", label: "Bing Organic" };
    }
    return { key: "google_organic", label: "Google Organic" };
  }

  if (host?.includes("bing.") || source === "bing") {
    return { key: "bing_organic", label: "Bing Organic" };
  }

  if (!source && !medium && !hasGclid && !host) {
    return { key: "direct", label: "Direct" };
  }

  if (source || medium) {
    const label = [attr.utm_source, attr.utm_medium].filter(Boolean).join(" / ") || "Campaign";
    return { key: `utm_${source || medium}`, label };
  }

  if (host) {
    return { key: `ref_${host}`, label: host };
  }

  return { key: "other", label: "Other" };
}

export function campaignLabel(campaign: string | null | undefined): string {
  const value = (campaign ?? "").trim();
  return value || "(none)";
}
