import type { ComponentType } from "react";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: Record<string, any>) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  /** Fixed recipient(s) — overrides caller-provided recipient when set. */
  to?: string | string[];
}

/**
 * Template registry — maps template names to their React Email components.
 */
import { template as newLeadTemplate } from "./new-lead";

export const TEMPLATES: Record<string, TemplateEntry> = {
  "new-lead": newLeadTemplate,
};
