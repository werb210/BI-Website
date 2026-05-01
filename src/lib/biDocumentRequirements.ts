// BI_DOC_LIST_v61 — mirror of BI-Server src/lib/biDocumentRequirements.ts.
// Source of truth lives on the server; this file MUST stay in sync.

export type BiDocSlot =
  | "pl_12mo"
  | "balance_sheet"
  | "ar_aging"
  | "ap_aging"
  | "founder_cv"
  | "forecast"
  | "gov_id_primary"
  | "gov_id_secondary";

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
  { slot: "pl_12mo",          label: "Profit & Loss — last 12 months",                       description: "Monthly breakdown for the last 12 months.",                                          carrierBound: true,  conditional: "always",       hasPeriodEnd: true  },
  { slot: "balance_sheet",    label: "Balance Sheet — most recent month-end",                description: "End of last completed month.",                                                       carrierBound: true,  conditional: "always",       hasPeriodEnd: true  },
  { slot: "ar_aging",         label: "Accounts Receivable Aging — most recent",              description: "End of last completed month.",                                                       carrierBound: true,  conditional: "always",       hasPeriodEnd: true  },
  { slot: "ap_aging",         label: "Accounts Payable Aging — most recent",                 description: "End of last completed month.",                                                       carrierBound: true,  conditional: "always",       hasPeriodEnd: true  },
  { slot: "founder_cv",       label: "Founder CV(s)",                                        description: "Required for businesses under 3 years old. Upload one PDF combining all founders.", carrierBound: true,  conditional: "startup_only", hasPeriodEnd: false },
  { slot: "forecast",         label: "Financial forecasts",                                  description: "Required for businesses under 3 years old.",                                         carrierBound: true,  conditional: "startup_only", hasPeriodEnd: false },
  { slot: "gov_id_primary",   label: "Government Photo ID — Driver's Licence",               description: "Valid, unexpired. Boreal-internal KYC; not transmitted to the carrier.",             carrierBound: false, conditional: "always",       hasPeriodEnd: false },
  { slot: "gov_id_secondary", label: "Government Photo ID — Passport (preferred) or other", description: "Second piece of government-issued photo ID. Boreal-internal KYC.",                   carrierBound: false, conditional: "always",       hasPeriodEnd: false },
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
