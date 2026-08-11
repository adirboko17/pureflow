import { sendTemplateEmail } from "@/lib/email-templates/send-email";

export async function notifyNewLead(lead: {
  id?: string;
  name: string;
  phone: string;
  zip: string;
  service: string;
  source?: string | null;
}) {
  try {
    await sendTemplateEmail("new-lead", ["bokobzadir@gmail.com", "nirmaimon272@gmail.com"], {
      templateData: {
        name: lead.name,
        phone: lead.phone,
        zip: lead.zip,
        service: lead.service,
        source: lead.source ?? "website",
        submittedAt: new Date().toLocaleString("en-US", {
          timeZone: "America/Chicago",
          dateStyle: "medium",
          timeStyle: "short",
        }),
      },
      idempotencyKey: `new-lead-${lead.id ?? crypto.randomUUID()}`,
      replyTo: "pureflowcostumerservices@gmail.com",
    });
  } catch (error) {
    // Never fail the lead submission because the notification could not send.
    console.error("[leads] notification email failed", error);
  }
}