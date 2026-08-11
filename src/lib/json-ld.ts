import {
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_PHONE_E164,
} from "@/lib/site";

/** Stable entity id for the primary local business. */
export const BUSINESS_ID = `${SITE_ORIGIN}/#business`;

export type FaqItem = { q: string; a: string };

const houstonGeo = {
  "@type": "GeoCoordinates" as const,
  latitude: 29.7604,
  longitude: -95.3698,
};

/** Greater Houston service area — 45-mile radius around downtown Houston. */
const greaterHoustonArea = {
  "@type": "GeoCircle" as const,
  geoMidpoint: houstonGeo,
  geoRadius: "45 mi",
};

const postalAddress = {
  "@type": "PostalAddress" as const,
  addressLocality: "Houston",
  addressRegion: "TX",
  postalCode: "77002",
  addressCountry: "US",
};

/**
 * Single @graph JSON-LD for the homepage.
 * One HomeAndConstructionBusiness (@id), Service + FAQPage reference it.
 */
export function buildHomeJsonLd(faqs: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": BUSINESS_ID,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        telephone: SITE_PHONE_E164,
        email: "pureflowcostumerservices@gmail.com",
        image: SITE_LOGO_URL,
        logo: SITE_LOGO_URL,
        description:
          "Independent referral service connecting Greater Houston homeowners with licensed air duct cleaning, dryer vent and chimney providers. PureFlow does not perform the work.",
        priceRange: "$$",
        address: postalAddress,
        geo: houstonGeo,
        areaServed: greaterHoustonArea,
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "PureFlow home cleaning referrals",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Air duct cleaning",
                description:
                  "Referral for professional air duct cleaning by a licensed local provider.",
                provider: { "@id": BUSINESS_ID },
                areaServed: greaterHoustonArea,
              },
              price: "299",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "PriceSpecification",
                price: "299",
                priceCurrency: "USD",
                minPrice: "299",
                description: "Starting price for standard residential jobs",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Chimney sweep",
                description:
                  "Referral for chimney sweep and inspection by a licensed local provider.",
                provider: { "@id": BUSINESS_ID },
                areaServed: greaterHoustonArea,
              },
              price: "149",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "PriceSpecification",
                price: "149",
                priceCurrency: "USD",
                minPrice: "149",
                description: "Starting price for standard residential jobs",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Dryer vent cleaning",
                description:
                  "Referral for dryer vent cleaning by a licensed local provider.",
                provider: { "@id": BUSINESS_ID },
                areaServed: greaterHoustonArea,
              },
              price: "99",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "PriceSpecification",
                price: "99",
                priceCurrency: "USD",
                minPrice: "99",
                description: "Starting price for standard residential jobs",
              },
            },
          ],
        },
      },
      {
        "@type": "Service",
        "@id": `${SITE_ORIGIN}/#services`,
        name: "Air duct, dryer vent & chimney cleaning",
        description:
          "Referral service matching Greater Houston homeowners with licensed air duct, dryer vent, and chimney cleaning providers.",
        provider: { "@id": BUSINESS_ID },
        areaServed: greaterHoustonArea,
        serviceType: [
          "Air duct cleaning",
          "Dryer vent cleaning",
          "Chimney cleaning",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_ORIGIN}/#faq`,
        url: `${SITE_ORIGIN}/#faq`,
        mainEntity: faqs.map((f, index) => ({
          "@type": "Question",
          "@id": `${SITE_ORIGIN}/#faq-q${index + 1}`,
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };
}
