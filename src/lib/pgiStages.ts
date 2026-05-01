// BI_AUDIT_FIX_v58 — canonical PGI pipeline stages, mirroring the portal's
// src/silos/bi/pipeline/biStages.ts. Single source of truth across BI-Website
// and BF-portal.
//
// Lifecycle:
//   new_application
//     → documents_pending
//     → under_review
//       → submitted (POST /applications/ to PGI)
//         → quoted    (PGI webhook: application.quoted)
//           → bound   (PGI webhook: policy.bound) — terminal success
//         → declined  (PGI webhook: application.declined) — terminal
//   claim                                                    (PGI webhook: claim.*)

export const PGI_STAGES = [
  "new_application",
  "documents_pending",
  "under_review",
  "submitted",
  "quoted",
  "bound",
  "declined",
  "claim",
] as const;

export type PGIStage = typeof PGI_STAGES[number];

export const PGI_STAGE_LABEL: Record<string, string> = {
  new_application: "New",
  documents_pending: "Documents Pending",
  under_review: "Internal Review",
  submitted: "Submitted to Carrier",
  quoted: "Quoted",
  bound: "Bound",
  declined: "Declined",
  claim: "Claim",
};

export const PGI_STAGE_TERMINAL: Record<string, boolean> = {
  new_application: false,
  documents_pending: false,
  under_review: false,
  submitted: false,
  quoted: false,
  bound: true,
  declined: true,
  claim: false,
};
