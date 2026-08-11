import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { isRequestIpBlocked, renderBlockedPage } from "@/lib/ip-block.server";

function shouldSkipIpBlock(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/lovable")) return true;
  // Allow static-ish assets through; HTML routes stay protected.
  if (/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|map|txt|xml)$/i.test(pathname)) {
    return true;
  }
  return false;
}

const ipBlockMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const request = getRequest();
    const pathname = new URL(request.url).pathname;
    if (!shouldSkipIpBlock(pathname) && (await isRequestIpBlocked(request.headers))) {
      return new Response(renderBlockedPage(), {
        status: 403,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }
  } catch (err) {
    console.error("[ip-block] middleware error", err);
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  // /lovable/* internal routes authenticate themselves — pass through untouched.
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [ipBlockMiddleware, errorMiddleware, csrfMiddleware],
}));