import * as React from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { TEMPLATES } from "./registry";

// Server-only: reads RESEND_API_KEY. Never import from client components.

const FROM_NAME = "PureFlow Air & Chimney";
/** Must be on a domain verified in Resend. */
const FROM_EMAIL = "noreply@pureflow-services.com";

export type SendTemplateEmailResult =
  | { sent: true }
  | { sent: false; reason: "recipient_suppressed" };

export interface SendTemplateEmailOptions {
  templateData?: Record<string, unknown>;
  /** Dedupes retries of the same logical send; defaults to a random UUID (no dedupe). */
  idempotencyKey?: string;
  replyTo?: string;
}

/**
 * Renders a registered template and sends it through Resend.
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string | string[],
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const template = TEMPLATES[templateName];
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`,
    );
  }

  // Template-level `to` takes precedence — notification templates always
  // send to their fixed address(es).
  const recipient = template.to ?? to;
  if (!recipient || (Array.isArray(recipient) && recipient.length === 0)) {
    throw new Error("Recipient is required (the template defines no fixed recipient)");
  }

  const toList = (Array.isArray(recipient) ? recipient : [recipient])
    .map((email) => email.trim())
    .filter(Boolean);

  const templateData = options.templateData ?? {};
  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: toList,
    subject,
    html,
    text,
    replyTo: options.replyTo,
    headers: options.idempotencyKey
      ? { "X-Entity-Ref-ID": options.idempotencyKey }
      : undefined,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }

  return { sent: true };
}
