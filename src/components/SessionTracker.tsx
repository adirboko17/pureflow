import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { reportSession } from "@/lib/analytics-client";

const HEARTBEAT_MS = 30_000;

/** Boots a visitor session and re-reports on navigations + frequent heartbeat for live presence. */
export function SessionTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    void reportSession();
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void reportSession("heartbeat");
    };

    const id = window.setInterval(tick, HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void reportSession("heartbeat");
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return null;
}
