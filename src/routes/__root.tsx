import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SessionTracker } from "@/components/SessionTracker";
import { SITE_OG_IMAGE_URL } from "@/lib/site";
import { CRITICAL_CSS } from "@/lib/critical-css";
import { heroImage } from "@/lib/images";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-bold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Houston Air Duct & Chimney Cleaning | PureFlow" },
      {
        name: "description",
        content:
          "Call PureFlow 24/7 for air duct & chimney cleaning in Houston and nearby. Free phone quote, clear starting prices, $29 visit, written quote before work.",
      },
      { name: "author", content: "PureFlow Air & Chimney" },
      { name: "google-site-verification", content: "35pHNNttUpRVYXDEvlqlz5EZN6JF376J2NO6FD8JXiA" },
      { property: "og:title", content: "Houston Air Duct & Chimney Cleaning | PureFlow" },
      {
        property: "og:description",
        content:
          "Call 24/7 for a free phone quote. Licensed local providers for air ducts, dryer vents & chimney sweeps in Greater Houston.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SITE_OG_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Houston Air Duct & Chimney Cleaning | PureFlow" },
      {
        name: "twitter:description",
        content:
          "Call 24/7 for a free phone quote. Licensed local providers for air ducts, dryer vents & chimney sweeps in Greater Houston.",
      },
      { name: "twitter:image", content: SITE_OG_IMAGE_URL },
    ],
    links: [{ rel: "icon", href: "/favicon.png", type: "image/png" }],
    scripts: [
      { src: "https://www.googletagmanager.com/gtag/js?id=AW-18371071580", async: true },
      {
        children:
          "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'AW-18371071580');",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* LCP hero first — before fonts/critical CSS — to cut resource load delay. */}
        <link
          rel="preload"
          as="image"
          href={heroImage.preload}
          type={heroImage.preloadType}
          fetchPriority="high"
          imageSrcSet={heroImage.avif}
          imageSizes={heroImage.sizes}
        />
        {/* Critical fonts before first paint — must precede @font-face in critical CSS. */}
        <link
          rel="preload"
          href="/fonts/manrope-latin-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/sora-latin-800-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <HeadContent />
        {/* Non-blocking full CSS: media=print until load. Inline onload (not React onLoad)
            so it works before hydration — React onLoad can miss a cached/early load. */}
        <link id="app-css" rel="stylesheet" href={appCss} media="print" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.getElementById("app-css");if(!l)return;function r(){l.media="all"}if(l.sheet)r();else l.onload=r;})();`,
          }}
        />
        <noscript>
          <link rel="stylesheet" href={appCss} />
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionTracker />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
