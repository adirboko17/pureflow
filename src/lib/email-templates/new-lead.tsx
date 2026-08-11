import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  phone?: string;
  zip?: string;
  service?: string;
  source?: string;
  submittedAt?: string;
}

const colors = {
  ink: "#1A2232",
  mist: "#F3F6F8",
  muted: "#5B6B7C",
  border: "#D5DEE5",
  primary: "#3D5A80",
  white: "#FFFFFF",
};

const main = {
  backgroundColor: colors.mist,
  fontFamily: 'Manrope, Arial, Helvetica, sans-serif',
  padding: "32px 12px",
};
const container = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  maxWidth: "560px",
  margin: "0 auto",
  overflow: "hidden" as const,
};
const header = {
  backgroundColor: colors.ink,
  padding: "22px 28px",
};
const headerTitle = {
  color: colors.white,
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  margin: "0",
};
const headerSub = {
  color: "rgba(255,255,255,0.72)",
  fontSize: "13px",
  margin: "6px 0 0",
};
const bodyPad = { padding: "24px 28px 28px" };
const heading = {
  fontSize: "20px",
  color: colors.ink,
  fontWeight: 700,
  margin: "0 0 8px",
};
const intro = {
  fontSize: "14px",
  color: colors.muted,
  lineHeight: "1.5",
  margin: "0 0 20px",
};
const card = {
  backgroundColor: colors.mist,
  borderRadius: "6px",
  padding: "16px 18px",
};
const row = {
  fontSize: "15px",
  color: colors.ink,
  margin: "0 0 10px",
  lineHeight: "1.45",
};
const rowLast = { ...row, margin: "0" };
const label = {
  color: colors.muted,
  display: "inline-block" as const,
  minWidth: "88px",
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};
const value = { fontWeight: 600 };
const phoneLink = {
  color: colors.primary,
  fontWeight: 700,
  textDecoration: "none",
};
const footer = {
  fontSize: "13px",
  color: colors.muted,
  lineHeight: "1.5",
  margin: "20px 0 0",
};
const ctaNote = {
  fontSize: "14px",
  color: colors.ink,
  fontWeight: 600,
  margin: "16px 0 0",
};

function DetailRow({
  labelText,
  children,
  last,
}: {
  labelText: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <Text style={last ? rowLast : row}>
      <span style={label}>{labelText}</span>{" "}
      <span style={value}>{children}</span>
    </Text>
  );
}

const NewLeadEmail = ({ name, phone, zip, service, source, submittedAt }: Props) => {
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`New lead: ${name ?? "Unknown"} — ${service ?? "Service request"}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>PureFlow Air &amp; Chimney</Text>
            <Text style={headerSub}>New website lead · Greater Houston</Text>
          </Section>

          <Section style={bodyPad}>
            <Heading style={heading}>Someone requested a callback</Heading>
            <Text style={intro}>
              A visitor submitted the PureFlow quote form. Call them back to schedule the $29
              on-site visit.
            </Text>

            <Section style={card}>
              <DetailRow labelText="Name">{name ?? "—"}</DetailRow>
              <DetailRow labelText="Phone">
                {telHref ? (
                  <Link href={telHref} style={phoneLink}>
                    {phone}
                  </Link>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow labelText="ZIP">{zip ?? "—"}</DetailRow>
              <DetailRow labelText="Service">{service ?? "—"}</DetailRow>
              <DetailRow labelText="Form">{source ?? "—"}</DetailRow>
              <DetailRow labelText="When" last>
                {submittedAt ?? "—"}
              </DetailRow>
            </Section>

            <Text style={ctaNote}>Next step: call the customer and confirm their ZIP coverage.</Text>
            <Hr style={{ borderColor: colors.border, margin: "20px 0 0" }} />
            <Text style={footer}>
              PureFlow is a referral service — matched providers set the $29 visit fee and job
              pricing.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: NewLeadEmail,
  subject: (data: Record<string, any>) =>
    `New PureFlow lead: ${data["name"] ?? "Website"} — ${data["service"] ?? "Service request"}`,
  displayName: "New lead notification",
  to: ["bokobzadir@gmail.com", "nirmaimon272@gmail.com"],
  previewData: {
    name: "John Miller",
    phone: "(346) 555-0142",
    zip: "77002",
    service: "Air Duct Cleaning",
    source: "hero",
    submittedAt: "Aug 12, 2026, 4:12 PM",
  },
} satisfies TemplateEntry;
