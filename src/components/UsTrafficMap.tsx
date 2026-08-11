import { useEffect, useMemo, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { FIPS_TO_CODE, STATE_NAMES } from "@/lib/us-states";

type StateCount = { code: string; name: string; count: number };

type StatesTopo = Topology<{ states: GeometryCollection }>;

const ATLAS_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

function fillForCount(count: number, max: number): string {
  if (count <= 0 || max <= 0) return "#e8eef4";
  const t = Math.min(1, count / max);
  if (t < 0.25) return "#b8c9d9";
  if (t < 0.5) return "#7a9bb8";
  if (t < 0.75) return "#3d6a8f";
  return "#1e3a5f";
}

export function UsTrafficMap({ byState }: { byState: StateCount[] }) {
  const [features, setFeatures] = useState<Feature<Geometry>[] | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(ATLAS_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load map");
        return r.json();
      })
      .then((topo: StatesTopo) => {
        if (cancelled) return;
        const fc = feature(topo, topo.objects.states) as FeatureCollection<Geometry>;
        setFeatures(fc.features);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load US map");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of byState) map.set(row.code, row.count);
    return map;
  }, [byState]);

  const max = useMemo(() => Math.max(0, ...byState.map((s) => s.count)), [byState]);

  const paths = useMemo(() => {
    if (!features) return [];
    const projection = geoAlbersUsa().fitSize([960, 500], {
      type: "FeatureCollection",
      features,
    });
    const path = geoPath(projection);
    return features
      .map((f) => {
        const id = String(f.id ?? "").padStart(2, "0");
        const code = FIPS_TO_CODE[id];
        if (!code) return null;
        const d = path(f);
        if (!d) return null;
        const count = counts.get(code) ?? 0;
        return { code, d, count, name: STATE_NAMES[code] ?? code };
      })
      .filter((x): x is { code: string; d: string; count: number; name: string } => Boolean(x));
  }, [features, counts]);

  const hoverInfo = hover
    ? {
        code: hover,
        name: STATE_NAMES[hover] ?? hover,
        count: counts.get(hover) ?? 0,
      }
    : null;

  if (error) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{error}</p>;
  }

  if (!features) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading map…</p>;
  }

  return (
    <div className="relative">
      <svg viewBox="0 0 960 500" className="h-auto w-full" role="img" aria-label="US traffic map">
        {paths.map((p) => (
          <path
            key={p.code}
            d={p.d}
            fill={p.code === "TX" && p.count > 0 ? "#1e3a5f" : fillForCount(p.count, max)}
            stroke={p.code === hover ? "#0f172a" : "#ffffff"}
            strokeWidth={p.code === hover ? 2 : 0.8}
            className="cursor-pointer transition-colors"
            onMouseEnter={() => setHover(p.code)}
            onMouseLeave={() => setHover(null)}
          >
            <title>
              {p.name}: {p.count} session{p.count === 1 ? "" : "s"}
            </title>
          </path>
        ))}
      </svg>
      <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center gap-2">
          <span>Fewer</span>
          <span className="inline-flex h-2.5 overflow-hidden rounded-sm">
            <span className="w-5 bg-[#e8eef4]" />
            <span className="w-5 bg-[#b8c9d9]" />
            <span className="w-5 bg-[#7a9bb8]" />
            <span className="w-5 bg-[#3d6a8f]" />
            <span className="w-5 bg-[#1e3a5f]" />
          </span>
          <span>More</span>
        </div>
        <p>
          {hoverInfo
            ? `${hoverInfo.name}: ${hoverInfo.count} session${hoverInfo.count === 1 ? "" : "s"}`
            : "Tap/hover a state · Texas highlighted with traffic"}
        </p>
      </div>
    </div>
  );
}
