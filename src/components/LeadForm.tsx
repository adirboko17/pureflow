import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/leads.functions";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/phone";

export const SERVICES = [
  "Air Duct Cleaning",
  "Dryer Vent Cleaning",
  "Chimney Sweep & Inspection",
  "Mold or Odor Concern",
  "Chimney Repair or Cap",
  "Not Sure - Need Advice",
];

export function LeadForm({ id }: { id?: string; variant?: "light" | "dark" }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const send = useServerFn(submitLead);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      await send({
        data: {
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          zip: String(form.get("zip") ?? ""),
          service: String(form.get("service") ?? ""),
          source: id ?? "form",
        },
      });
      setStatus("done");
      try {
        (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(
          "event",
          "conversion",
          {
            send_to: "AW-18371071580/0_0rCLK-gtwcENycgbhE",
            value: 1.0,
            currency: "USD",
          },
        );
      } catch {
        /* analytics must never block the flow */
      }
      toast.success("Request received - we will call you back shortly.");
    } catch {
      setStatus("idle");
      toast.error("Something went wrong. Please try again.");
    }
  };

  const fieldClass =
    "w-full border border-border bg-background px-4 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary min-h-12";
  const labelClass = "text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";

  if (status === "done") {
    return (
      <div id={id} className="border border-border bg-background p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 font-display text-xl font-bold text-foreground">Request received</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll call you back. For faster service, call{" "}
          <a href={PHONE_HREF} className="font-semibold text-primary underline underline-offset-2">
            {PHONE_DISPLAY}
          </a>{" "}
          anytime - free, 24/7.
        </p>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={onSubmit} className="border border-border bg-background p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold text-foreground">Request a callback</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Or skip the form -{" "}
        <a href={PHONE_HREF} className="font-semibold text-primary underline underline-offset-2">
          call {PHONE_DISPLAY}
        </a>{" "}
        now.
      </p>

      <div className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor={`${id}-name`}>
            Full name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            required
            placeholder="Jordan Smith"
            className={fieldClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor={`${id}-phone`}>
              Phone
            </label>
            <input
              id={`${id}-phone`}
              name="phone"
              type="tel"
              required
              placeholder="(214) 555-0147"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor={`${id}-zip`}>
              ZIP code
            </label>
            <input
              id={`${id}-zip`}
              name="zip"
              inputMode="numeric"
              pattern="[0-9]{5}"
              required
              placeholder="75201"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor={`${id}-service`}>
            Service needed
          </label>
          <select
            id={`${id}-service`}
            name="service"
            required
            defaultValue=""
            className={fieldClass}
          >
            <option value="" disabled>
              Select a service…
            </option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-ink px-6 py-4 text-base font-bold text-ink-foreground transition-colors hover:bg-primary disabled:opacity-70"
      >
        {status === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        Request Callback
      </button>

      <a
        href={PHONE_HREF}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-border px-6 py-3.5 text-sm font-bold text-foreground hover:border-primary"
      >
        <Phone className="h-4 w-4 text-primary" />
        Prefer to call? {PHONE_DISPLAY}
      </a>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          By submitting, you agree PureFlow Air &amp; Chimney - an independent referral service -
          may share your details with a licensed local provider and contact you about your request.{" "}
          <a href="/privacy" className="underline underline-offset-2">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="/terms" className="underline underline-offset-2">
            Terms
          </a>
          .
        </span>
      </p>
    </form>
  );
}
