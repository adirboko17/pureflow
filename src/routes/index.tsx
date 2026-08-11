import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Toaster } from "@/components/ui/sonner";
import { LeadForm } from "@/components/LeadForm";
import logoImg from "@/assets/pureflow-logo.png";
import heroImg from "@/assets/hero-texas.jpg";
import ductBefore from "@/assets/duct1.png";
import ductAfter from "@/assets/duct2.png";
import ductBefore2 from "@/assets/duct3.png";
import ductAfter2 from "@/assets/duct4.png";
import chimneyBefore from "@/assets/chi2.png";
import chimneyAfter from "@/assets/chi1.png";
import {
  Wind,
  Flame,
  Shirt,
  Phone,
  Clock,
  FileText,
  BadgeCheck,
  Menu,
  X,
  Star,
} from "lucide-react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/phone";

const navLinks = [
  { href: "#results", label: "Results" },
  { href: "#reviews", label: "Reviews" },
  { href: "#pricing", label: "Pricing" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#areas", label: "Areas" },
  { href: "#faq", label: "FAQ" },
] as const;

const reviews = [
  {
    name: "Melissa R.",
    city: "Plano, TX",
    service: "Air duct cleaning",
    quote:
      "Called in the morning and had someone out the same week. The tech showed me photos inside the ducts - night and day difference. House already feels less dusty.",
  },
  {
    name: "James T.",
    city: "Katy, TX",
    service: "Chimney sweep",
    quote:
      "Straight answer on price before they started. Fireplace was overdue for a clean - they were careful, on time, and left everything tidy.",
  },
  {
    name: "Priya S.",
    city: "Dallas, TX",
    service: "Ducts + dryer vent",
    quote:
      "I liked that PureFlow explained the $45 visit upfront. No pressure after the quote. We booked the ducts and dryer vent and both came out spotless.",
  },
  {
    name: "Carlos M.",
    city: "The Woodlands, TX",
    service: "Air duct cleaning",
    quote:
      "Easy phone quote, clear communication, and the crew wore shoe covers. AC airflow feels stronger. Would call again next season.",
  },
  {
    name: "Hannah L.",
    city: "Frisco, TX",
    service: "Chimney inspection",
    quote:
      "We needed a chimney check before winter. Honest about what was needed and what wasn't. Refreshing compared to other companies that upsell everything.",
  },
  {
    name: "Derek W.",
    city: "Houston, TX",
    service: "Air duct cleaning",
    quote:
      "Allergy season hits hard here. After the cleaning the musty smell near the vents was gone. Booking by phone was the fastest part.",
  },
] as const;

function trackCallClick(placement: string) {
  try {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(
      "event",
      "conversion",
      {
        send_to: "AW-18371071580/0_0rCLK-gtwcENycgbhE",
        value: 1.0,
        currency: "USD",
        event_label: placement,
      },
    );
  } catch {
    /* analytics must never block the call */
  }
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Dallas & Houston Air Duct & Chimney Cleaning | PureFlow",
      },
      {
        name: "description",
        content:
          "Call PureFlow 24/7 for air duct & chimney cleaning in Dallas and Houston. Free phone quote, clear starting prices, $45 on-site visit, written quote before work.",
      },
      {
        property: "og:title",
        content: "Dallas & Houston Air Duct & Chimney Cleaning | PureFlow",
      },
      {
        property: "og:description",
        content:
          "Call 24/7 for a free phone quote. Licensed local providers for air ducts, dryer vents & chimneys in Dallas and Houston.",
      },
      { property: "og:url", content: "https://pureflow-services.com/" },
    ],
    links: [{ rel: "canonical", href: "https://pureflow-services.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "PureFlow Air & Chimney",
          url: "https://pureflow-services.com/",
          telephone: "+1-214-555-0147",
          description:
            "Independent referral service connecting Dallas and Houston homeowners with licensed air duct cleaning, dryer vent and chimney providers.",
          email: "pureflowcostumerservices@gmail.com",
          areaServed: [
            { "@type": "City", name: "Dallas, Texas" },
            { "@type": "City", name: "Houston, Texas" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

const services = [
  {
    icon: Wind,
    title: "Air Duct Cleaning",
    desc: "Deep clean supply & return ducts - less dust, better airflow.",
    price: "From $299",
  },
  {
    icon: Flame,
    title: "Chimney Sweep",
    desc: "Creosote removal and safety inspection before you burn.",
    price: "From $149",
  },
  {
    icon: Shirt,
    title: "Dryer Vent Cleaning",
    desc: "Clear lint buildup that slows drying and raises fire risk.",
    price: "From $99",
  },
];

const faqs = [
  {
    q: "Is the phone quote really free?",
    a: "Yes. Calling PureFlow is free 24/7. If you schedule an on-site visit, the independent provider charges a flat $45 for inspection and a written quote.",
  },
  {
    q: "What does the $45 visit cover?",
    a: "Travel, inspection, and a written quote from the licensed provider. No obligation to book the job. Charged by the provider, not PureFlow.",
  },
  {
    q: "Why list starting prices?",
    a: "For fee transparency on on-site home services. “From” prices are typical starting ranges for standard residential jobs in Dallas and Houston. Final price is confirmed in writing before work begins.",
  },
  {
    q: "Are estimates binding?",
    a: "The phone quote is based on what you describe. The on-site written quote is the price that applies before work starts, unless the scope changes significantly from what was inspected.",
  },
  {
    q: "Is PureFlow doing the work?",
    a: "No. PureFlow is an independent referral service. We match you with licensed local providers in Dallas or Houston who perform and price the work.",
  },
  {
    q: "Which areas do you cover?",
    a: "Dallas–Fort Worth and Greater Houston, including nearby suburbs. Call with your ZIP and we confirm coverage before scheduling.",
  },
];

function CallButton({
  placement,
  className,
  children,
}: {
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={PHONE_HREF} onClick={() => trackCallClick(placement)} className={className}>
      {children}
    </a>
  );
}

function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  label,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  label: string;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold tracking-wide text-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <figure className="overflow-hidden">
          <img
            src={before}
            alt={beforeAlt}
            width={800}
            height={800}
            loading="lazy"
            className="aspect-square w-full object-cover sm:aspect-[4/3]"
          />
          <figcaption className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Before
          </figcaption>
        </figure>
        <figure className="overflow-hidden">
          <img
            src={after}
            alt={afterAlt}
            width={800}
            height={800}
            loading="lazy"
            className="aspect-square w-full object-cover sm:aspect-[4/3]"
          />
          <figcaption className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            After
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-0">
      <Toaster position="top-center" />

      {/* Slim utility bar - desktop only (saves mobile chrome) */}
      <div className="hidden bg-ink text-ink-foreground sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 text-sm">
          <span className="inline-flex items-center gap-1.5 opacity-90">
            <Clock className="h-3.5 w-3.5" />
            Answered 24/7 · Dallas & Houston
          </span>
          <CallButton
            placement="topbar"
            className="font-semibold tracking-wide underline-offset-4 hover:underline"
          >
            {PHONE_DISPLAY}
          </CallButton>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
          <a href="#" className="shrink-0" onClick={() => setMenuOpen(false)}>
            <img
              src={logoImg}
              alt="PureFlow Air & Chimney"
              width={200}
              height={106}
              className="h-11 w-auto object-contain sm:h-14"
            />
          </a>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Page sections">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-foreground/75 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <CallButton
              placement="header"
              className="call-pulse inline-flex items-center gap-2 bg-primary px-3.5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-ink sm:px-5 sm:text-base"
            >
              <Phone className="h-4 w-4" />
              <span className="sm:hidden">Call</span>
              <span className="hidden sm:inline">Call Now</span>
            </CallButton>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center border border-border text-foreground lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav
            id="mobile-nav"
            className="border-t border-border bg-background px-4 py-2 lg:hidden"
            aria-label="Mobile page sections"
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-3.5 text-base font-semibold text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="border-t border-border pt-2">
                <CallButton
                  placement="mobile-menu"
                  className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3.5 text-base font-bold text-primary-foreground"
                >
                  <Phone className="h-5 w-5" />
                  Call {PHONE_DISPLAY}
                </CallButton>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>

      {/* Full-bleed hero - one composition */}
      <section className="relative min-h-[min(72dvh,560px)] overflow-hidden text-ink-foreground sm:min-h-[88vh]">
        <img
          src={heroImg}
          alt="Technician cleaning air vents in a Texas home"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] sm:object-center"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.16 0.032 250 / 0.55) 0%, oklch(0.16 0.032 250 / 0.78) 42%, oklch(0.14 0.03 250 / 0.92) 100%), linear-gradient(105deg, oklch(0.16 0.032 250 / 0.7) 0%, oklch(0.19 0.038 245 / 0.45) 55%, oklch(0.25 0.038 230 / 0.25) 100%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[min(72dvh,560px)] max-w-6xl flex-col justify-center px-4 py-8 sm:min-h-[88vh] sm:px-5 sm:py-20">
          <p className="animate-rise mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-foreground/80 sm:hidden">
            <Clock className="h-3.5 w-3.5" />
            Free quote · 24/7
          </p>
          <h1 className="animate-rise max-w-xl font-display text-[2.15rem] font-extrabold leading-[1.06] sm:text-5xl lg:text-6xl">
            <span className="block">Cleaner air.</span>
            <span className="block">Safer chimney.</span>
            <span className="block text-flow">One call away.</span>
          </h1>
          <p className="animate-rise-delay mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-foreground/85 sm:mt-5 sm:text-xl">
            <span className="sm:hidden">
              Dallas & Houston - free phone quote in minutes. Licensed local pro.
            </span>
            <span className="hidden sm:inline">
              Dallas & Houston homeowners - get a free phone quote in minutes. We connect you with a
              licensed local pro.
            </span>
          </p>
          <div className="animate-rise-delay-2 mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <CallButton
              placement="hero"
              className="call-pulse inline-flex w-full items-center justify-center gap-3 bg-primary px-6 py-4 text-lg font-bold text-primary-foreground sm:w-auto sm:px-8"
            >
              <Phone className="h-5 w-5" />
              Call {PHONE_DISPLAY}
            </CallButton>
            <a
              href="#results"
              className="text-center text-sm font-semibold text-ink-foreground/80 underline underline-offset-4 hover:text-ink-foreground sm:text-left"
            >
              See before & after
            </a>
          </div>
        </div>
      </section>

      {/* Trust line - compact on mobile */}
      <section className="border-b border-border bg-mist">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            {[
              { icon: Phone, t: "24/7 quote" },
              { icon: FileText, t: "$45 visit" },
              { icon: BadgeCheck, t: "Licensed" },
            ].map((item) => (
              <div key={item.t} className="flex flex-col items-center gap-1.5 px-1 py-2 text-center">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="text-[11px] font-semibold leading-tight text-foreground">{item.t}</p>
              </div>
            ))}
          </div>
          <div className="hidden gap-8 sm:grid sm:grid-cols-3">
            {[
              { icon: Phone, t: "Free phone quote 24/7", d: "Someone answers - nights and weekends too." },
              { icon: FileText, t: "$45 visit, then written price", d: "No work starts until you approve." },
              { icon: BadgeCheck, t: "Licensed local providers", d: "Dallas–Fort Worth & Greater Houston." },
            ].map((item) => (
              <div key={item.t} className="flex gap-3">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{item.t}</p>
                  <p className="text-sm text-muted-foreground">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / after - proof */}
      <section id="results" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:scroll-mt-28 sm:px-5 sm:py-20">
        <h2 className="max-w-xl font-display text-[1.75rem] font-bold leading-tight text-foreground sm:text-4xl">
          What dirty systems look like - and what clean looks like
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Dust, lint, and creosote don&apos;t leave on their own. These are the results homeowners
          call for.
        </p>
        <div className="mt-8 grid gap-10 sm:mt-10 lg:grid-cols-2 lg:gap-12">
          <BeforeAfter
            label="Air ducts"
            before={ductBefore}
            after={ductAfter}
            beforeAlt="Dirty air duct filled with dust and debris before cleaning"
            afterAlt="Clean air duct metal after professional cleaning"
          />
          <BeforeAfter
            label="Air ducts"
            before={ductBefore2}
            after={ductAfter2}
            beforeAlt="Heavily soiled air duct interior before professional cleaning"
            afterAlt="Spotless galvanized air duct after professional cleaning"
          />
          <BeforeAfter
            label="Fireplace & chimney"
            before={chimneyBefore}
            after={chimneyAfter}
            beforeAlt="Chimney flue with heavy creosote buildup during cleaning"
            afterAlt="Clean chimney flue after professional sweep"
          />
        </div>
        <div className="mt-8 sm:mt-10">
          <CallButton
            placement="results"
            className="inline-flex w-full items-center justify-center gap-2 bg-primary px-7 py-4 text-base font-bold text-primary-foreground transition-colors hover:bg-ink sm:w-auto"
          >
            <Phone className="h-5 w-5" />
            Call for your free quote
          </CallButton>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-24 border-y border-border bg-mist sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-[1.75rem] font-bold text-foreground sm:text-4xl">
                Homeowners who called PureFlow
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                What Dallas and Houston area homeowners say after duct and chimney service.
              </p>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <div className="flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm font-semibold">5-star experiences · TX</p>
            </div>
          </div>

          <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3 lg:pb-0">
            {reviews.map((review) => (
              <article
                key={`${review.name}-${review.city}`}
                className="w-[85%] shrink-0 snap-start border border-border bg-background p-5 sm:w-auto sm:p-6"
              >
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="mt-5 border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.city} · {review.service}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <CallButton
              placement="reviews"
              className="inline-flex w-full items-center justify-center gap-2 bg-primary px-7 py-4 text-base font-bold text-primary-foreground transition-colors hover:bg-ink sm:w-auto"
            >
              <Phone className="h-5 w-5" />
              Join them - call for a free quote
            </CallButton>
          </div>
        </div>
      </section>

      {/* Services + prices */}
      <section id="pricing" className="scroll-mt-24 bg-ink text-ink-foreground sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-20">
          <h2 className="font-display text-[1.75rem] font-bold sm:text-4xl">
            Services & starting prices
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ink-foreground/75 sm:text-base">
            Clear ranges for Google Ads transparency. Final price is confirmed in writing after the
            $45 on-site visit - you approve before any work.
          </p>
          <div className="mt-8 divide-y divide-ink-foreground/15 border-y border-ink-foreground/15 sm:mt-10">
            {services.map((s) => (
              <div
                key={s.title}
                className="grid gap-3 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8 sm:py-7"
              >
                <div className="flex items-start gap-3 sm:contents">
                  <s.icon className="mt-0.5 h-6 w-6 shrink-0 text-flow sm:mt-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3 sm:block">
                      <h3 className="text-lg font-bold sm:text-xl">{s.title}</h3>
                      <p className="font-display text-xl font-bold text-flow sm:hidden">{s.price}</p>
                    </div>
                    <p className="mt-1 text-sm text-ink-foreground/70">{s.desc}</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="hidden font-display text-2xl font-bold text-flow sm:block">{s.price}</p>
                  <CallButton
                    placement={`price-${s.title}`}
                    className="mt-1 inline-flex w-full items-center justify-center gap-1.5 border border-ink-foreground/25 px-4 py-3 text-sm font-bold sm:mt-1 sm:w-auto sm:border-0 sm:p-0 sm:underline sm:underline-offset-4"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call to book
                  </CallButton>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-ink-foreground/60 sm:text-sm">
            Free phone quote · $45 provider visit fee · Written quote before work · No after-hours
            fee to call
          </p>
        </div>
      </section>

      {/* Process */}
      <section
        id="how-it-works"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:scroll-mt-28 sm:px-5 sm:py-20"
      >
        <h2 className="font-display text-[1.75rem] font-bold text-foreground sm:text-4xl">
          Three steps. Then you decide.
        </h2>
        <ol className="mt-8 grid gap-7 sm:mt-10 sm:gap-10 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Call PureFlow",
              d: "Free 24/7 phone quote. We confirm your ZIP and what you need.",
            },
            {
              n: "02",
              t: "On-site visit - $45",
              d: "A licensed local provider inspects and puts the full price in writing.",
            },
            {
              n: "03",
              t: "Approve & clean",
              d: "Work starts only after you say yes. Decline and you pay only the visit.",
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-4 md:block">
              <p className="font-display text-sm font-bold tracking-[0.2em] text-flow">{step.n}</p>
              <div>
                <h3 className="text-lg font-bold text-foreground sm:mt-2 sm:text-xl">{step.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <CallButton
          placement="how-it-works"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-base font-bold text-primary-foreground sm:hidden"
        >
          <Phone className="h-5 w-5" />
          Call now - it&apos;s free
        </CallButton>
      </section>

      {/* Areas */}
      <section id="areas" className="scroll-mt-24 border-y border-border bg-mist sm:scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-14">
          <h2 className="font-display text-[1.75rem] font-bold text-foreground sm:text-3xl">
            Serving Texas homes where you are
          </h2>
          <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                Dallas–Fort Worth
              </h3>
              <p className="mt-2 text-sm text-foreground/85 sm:mt-3 sm:text-base">
                Dallas, Fort Worth, Plano, Frisco, Arlington, Irving, Garland, McKinney, and nearby.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                Greater Houston
              </h3>
              <p className="mt-2 text-sm text-foreground/85 sm:mt-3 sm:text-base">
                Houston, Katy, Sugar Land, The Woodlands, Pearland, Cypress, Spring, Pasadena, and
                nearby.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-12 sm:scroll-mt-28 sm:px-5 sm:py-16">
        <h2 className="font-display text-[1.75rem] font-bold text-foreground sm:text-3xl">
          Questions before you call
        </h2>
        <Accordion type="single" collapsible className="mt-5 sm:mt-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="py-4 text-left text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Bottom form - secondary */}
      <section id="request" className="bg-mist">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:gap-10 sm:px-5 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <div>
            <h2 className="font-display text-[1.75rem] font-bold text-foreground sm:text-3xl">
              Can&apos;t talk right now?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Leave a callback request. For the fastest booking, call - it&apos;s free, 24/7.
            </p>
            <CallButton
              placement="form-aside"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-base font-bold text-primary-foreground hover:bg-ink sm:mt-6 sm:w-auto"
            >
              <Phone className="h-5 w-5" />
              {PHONE_DISPLAY}
            </CallButton>
          </div>
          <LeadForm id="bottom-form" />
        </div>
      </section>

      <footer className="bg-ink">
        <div className="mx-auto max-w-6xl space-y-4 px-5 py-12 text-sm text-ink-foreground/70">
          <img
            src={logoImg}
            alt="PureFlow Air & Chimney"
            width={160}
            height={85}
            className="h-10 w-auto object-contain brightness-0 invert"
          />
          <p>
            Dallas–Fort Worth & Greater Houston ·{" "}
            <a
              href={PHONE_HREF}
              className="font-semibold text-ink-foreground underline underline-offset-4"
            >
              {PHONE_DISPLAY}
            </a>{" "}
            · 24/7
          </p>
          <p className="max-w-3xl">
            PureFlow Air & Chimney is an independent lead referral service. We connect homeowners
            with local, licensed providers and do not perform the work ourselves. The $45 on-site
            visit fee and job pricing are set and charged by the matched provider. Starting prices
            shown are typical market ranges for standard residential jobs.
          </p>
          <p className="max-w-3xl text-xs">
            Demo phone number - replace before publishing ads.{" "}
            <a
              href="mailto:pureflowcostumerservices@gmail.com"
              className="underline underline-offset-4 hover:text-ink-foreground"
            >
              pureflowcostumerservices@gmail.com
            </a>
          </p>
          <div className="flex gap-5 pt-2">
            <Link to="/privacy" className="underline underline-offset-4 hover:text-ink-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="underline underline-offset-4 hover:text-ink-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>

      {/* Sticky mobile call - always visible */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-3 pt-2.5 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
      >
        <p className="mb-1.5 text-center text-[11px] font-semibold tracking-wide text-muted-foreground">
          Free phone quote · Answered 24/7
        </p>
        <CallButton
          placement="sticky-mobile"
          className="call-pulse flex w-full items-center justify-center gap-2 bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground"
        >
          <Phone className="h-5 w-5" />
          Tap to Call {PHONE_DISPLAY}
        </CallButton>
      </div>
    </div>
  );
}
