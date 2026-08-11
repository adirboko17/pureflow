import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_OG_IMAGE_URL, SITE_ORIGIN } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | PureFlow Air & Chimney" },
      {
        name: "description",
        content:
          "Terms for using PureFlow Air & Chimney, the Greater Houston referral platform for duct and chimney service providers.",
      },
      { property: "og:title", content: "Terms of Service | PureFlow Air & Chimney" },
      {
        property: "og:description",
        content: "Terms for using our Greater Houston home service referral platform.",
      },
      { property: "og:url", content: `${SITE_ORIGIN}/terms` },
      { property: "og:image", content: SITE_OG_IMAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Terms of Service | PureFlow Air & Chimney" },
      {
        name: "twitter:description",
        content: "Terms for using our Greater Houston home service referral platform.",
      },
      { name: "twitter:image", content: SITE_OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: `${SITE_ORIGIN}/terms` }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link to="/" className="text-sm font-semibold text-primary underline underline-offset-4">
        ← Back home
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold text-foreground">Terms of Service</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-lg font-bold text-foreground">Referral service only</h2>
        <p>
          PureFlow Air & Chimney connects homeowners with independent, licensed local service
          providers. We do not perform air duct cleaning, chimney sweeping, or repair work
          ourselves, and we are not a party to any agreement you make with a provider.
        </p>
        <h2 className="text-lg font-bold text-foreground">Pricing</h2>
        <p>
          Calling PureFlow for a phone quote is free 24/7. Submitting a request on this site is also
          free. The on-site visit carries a flat $29 fee, which is charged by the independent
          licensed provider who visits you, not by PureFlow Air & Chimney. That fee covers travel,
          inspection and a written quote. Starting prices shown on the site are typical ranges for
          standard residential jobs; the price of any work itself is set solely by the provider in
          that written quote after the on-site inspection. You are under no obligation to accept the
          quote, and no additional cancellation fee is charged by PureFlow Air & Chimney.
        </p>
        <h2 className="text-lg font-bold text-foreground">No warranty</h2>
        <p>
          Work performed is the responsibility of the provider you hire, including any warranty,
          licensing and insurance obligations.
        </p>
        <h2 className="text-lg font-bold text-foreground">Contact consent</h2>
        <p>
          Submitting the form authorizes us and matched providers to contact you by phone, text or
          email about your request. Consent is not a condition of purchase, message and data rates
          may apply, and you can opt out at any time by replying STOP or emailing us.
        </p>
        <h2 className="text-lg font-bold text-foreground">Service area</h2>
        <p>
          We currently accept requests from homeowners in Greater Houston, within about 45 miles of
          the city. Availability of a matched provider is not guaranteed for every ZIP code or
          timeframe.
        </p>
        <h2 className="text-lg font-bold text-foreground">Contact us</h2>
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:pureflowcostumerservices@gmail.com" className="underline underline-offset-2">
            pureflowcostumerservices@gmail.com
          </a>
          .
        </p>
        <p className="text-xs">Last updated: August 11, 2026.</p>
      </div>
    </main>
  );
}
