import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | PureFlow Air & Chimney" },
      {
        name: "description",
        content:
          "How PureFlow Air & Chimney collects, uses and shares the information you submit through our Dallas & Houston quote request form.",
      },
      { property: "og:title", content: "Privacy Policy | PureFlow Air & Chimney" },
      {
        property: "og:description",
        content: "How we handle information submitted through our quote request form.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link to="/" className="text-sm font-semibold text-primary underline underline-offset-4">
        ← Back home
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold text-foreground">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          PureFlow Air & Chimney is an independent referral service. This page explains what we do
          with the information you submit.
        </p>
        <h2 className="text-lg font-bold text-foreground">What we collect</h2>
        <p>
          Your name, phone number, ZIP code and the service you selected. We do not collect payment
          information on this site.
        </p>
        <h2 className="text-lg font-bold text-foreground">How we use it</h2>
        <p>
          We share your request with one or more licensed local service providers so they can
          contact you about the job. By submitting the form you consent to being contacted by phone,
          text or email about your request. Consent is not a condition of any purchase, message and
          data rates may apply, and you can opt out at any time.
        </p>
        <h2 className="text-lg font-bold text-foreground">Cookies and advertising</h2>
        <p>
          We may use cookies and advertising tools, including Google services, to measure how
          visitors reach this page and how well our ads perform. You can manage Google's use of
          advertising cookies through Google Ads Settings, and control cookies through your browser.
        </p>
        <h2 className="text-lg font-bold text-foreground">What we don't do</h2>
        <p>
          We do not sell your information to unrelated advertisers and we do not use it for any
          purpose other than connecting you with a provider.
        </p>
        <h2 className="text-lg font-bold text-foreground">Data retention and removal</h2>
        <p>
          We keep request details only as long as needed to connect you with a provider and to keep
          records of the referral. To access, correct or delete your information, email{" "}
          <a href="mailto:pureflowcostumerservices@gmail.com" className="underline underline-offset-2">
            pureflowcostumerservices@gmail.com
          </a>{" "}
          and we will action the request.
        </p>
        <h2 className="text-lg font-bold text-foreground">Contact</h2>
        <p>
          PureFlow Air &amp; Chimney - Dallas–Fort Worth and Greater Houston, Texas.{" "}
          <a href="mailto:pureflowcostumerservices@gmail.com" className="underline underline-offset-2">
            pureflowcostumerservices@gmail.com
          </a>
        </p>
        <p className="text-xs">Last updated: August 11, 2026.</p>
      </div>
    </main>
  );
}