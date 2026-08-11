/** Decode and clean geo labels that arrive URL-encoded (e.g. San%20Jose). */
export function decodeGeoText(value: string | null | undefined): string | null {
  if (value == null) return null;
  let text = value.trim();
  if (!text) return null;

  try {
    let current = text.replace(/\+/g, " ");
    for (let i = 0; i < 2; i++) {
      if (!/%[0-9A-Fa-f]{2}/.test(current)) break;
      current = decodeURIComponent(current);
    }
    text = current;
  } catch {
    /* keep original trimmed text */
  }

  text = text.replace(/\s+/g, " ").trim();
  return text || null;
}

export function formatLocation(
  city?: string | null,
  region?: string | null,
  country?: string | null,
): string {
  return [decodeGeoText(city), decodeGeoText(region), decodeGeoText(country)]
    .filter(Boolean)
    .join(", ");
}
