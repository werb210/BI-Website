// BI_WEBSITE_BLOCK_v349_CANONICAL_DOC_LIST_v1 — mirror of BI-Server
// src/lib/biDocumentRequirements.ts. Source of truth lives on the
// server; this file MUST stay in sync. Replaces BI_DOC_LIST_v61 which
// used parallel doc_slot vocabulary (pl_12mo, gov_id_*) that didn't
// map cleanly to what the upload form actually collects.
//
// Canonical 5 always-required + 2 startup-only, doc_type vocabulary,
// matches PGI's intake page at
// app.pgicover.com/applications/new/upload?from=score.

export type BiDocSlot =
  | "loan_agreement"
  | "profit_loss"
  | "balance_sheet"
  | "ar_aging"
  | "ap_aging"
  | "founder_cv"
  | "financial_forecast";

export type BiDocRequirement = {
  slot: BiDocSlot;
  label: string;
  description: string;
  carrierBound: boolean;
  conditional: "always" | "startup_only";
  /** If true, applicant must declare a period-end date alongside the upload. */
  hasPeriodEnd: boolean;
};

export const BI_DOC_REQUIREMENTS: readonly BiDocRequirement[] = [
  { slot: "loan_agreement",     label: "Lender Agreement / Term Sheet",     description: "Upload the lender's agreement or term sheet for the loan being insured.", carrierBound: true, conditional: "always",       hasPeriodEnd: false },
  { slot: "profit_loss",        label: "Profit & Loss Statement",           description: "Last 12 months, monthly breakdown.",                                       carrierBound: true, conditional: "always",       hasPeriodEnd: true  },
  { slot: "balance_sheet",      label: "Balance Sheet",                     description: "Most recent month-end.",                                                   carrierBound: true, conditional: "always",       hasPeriodEnd: true  },
  { slot: "ar_aging",           label: "Accounts Receivable Aging Summary", description: "Most recent.",                                                             carrierBound: true, conditional: "always",       hasPeriodEnd: true  },
  { slot: "ap_aging",           label: "Accounts Payable Aging Summary",    description: "Most recent.",                                                             carrierBound: true, conditional: "always",       hasPeriodEnd: true  },
  { slot: "founder_cv",         label: "Founder CV(s)",                     description: "Required for businesses under 3 years old. Upload one PDF combining all founders.", carrierBound: true, conditional: "startup_only", hasPeriodEnd: false },
  { slot: "financial_forecast", label: "Financial Forecast",                description: "Required for businesses under 3 years old. 12-24 month projections.",       carrierBound: true, conditional: "startup_only", hasPeriodEnd: false },
] as const;

/** Strict 3-year cutoff. Returns false on missing or unparseable date. */
export function isStartup(formationDateIso: string | null | undefined, now: Date = new Date()): boolean {
  if (!formationDateIso) return false;
  const d = new Date(formationDateIso);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 3);
  return d.getTime() > cutoff.getTime();
}

export function requiredRequirements(formationDateIso: string | null | undefined): BiDocRequirement[] {
  const startup = isStartup(formationDateIso);
  return BI_DOC_REQUIREMENTS.filter((r) => r.conditional === "always" || (r.conditional === "startup_only" && startup));
}
