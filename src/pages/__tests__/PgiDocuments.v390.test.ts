import { describe, it, expect } from "vitest";
import { deriveDocState, shouldShowInput, bannerKind, summarize } from "../PgiDocuments";

const TYPES = ["loan_agreement", "profit_loss", "balance_sheet", "ar_aging", "ap_aging"];

function uploadedRow(doc_type: string, overrides: Record<string, unknown> = {}) {
  return {
    id: `${doc_type}-1`, doc_type, original_filename: `${doc_type}.pdf`, bytes: 1234,
    created_at: "2026-05-27T20:00:00.000Z", review_status: "pending", rejection_reason: null, reviewed_at: null,
    ...overrides,
  };
}

describe("deriveDocState (v390)", () => {
  it("tags uploaded unreviewed as uploaded", () => {
    const state = deriveDocState([uploadedRow("loan_agreement")]);
    expect(state.loan_agreement.status).toBe("uploaded");
    expect(state.loan_agreement.filename).toBe("loan_agreement.pdf");
    expect(state.profit_loss.status).toBe("pending");
  });
  it("all uploaded none reviewed", () => {
    const state = deriveDocState(TYPES.map((t) => uploadedRow(t)));
    for (const t of TYPES) expect(state[t].status).toBe("uploaded");
  });
  it("accepted/rejected", () => {
    const state = deriveDocState([
      uploadedRow("loan_agreement", { review_status: "accepted" }),
      uploadedRow("profit_loss", { review_status: "rejected", rejection_reason: "Wrong period" }),
    ]);
    expect(state.loan_agreement.status).toBe("accepted");
    expect(state.profit_loss.status).toBe("rejected");
  });
});

describe("shouldShowInput", () => {
  it("pending/rejected true", () => {
    expect(shouldShowInput("pending", false)).toBe(true);
    expect(shouldShowInput("rejected", false)).toBe(true);
  });
  it("uploaded gated by replace", () => {
    expect(shouldShowInput("uploaded", false)).toBe(false);
    expect(shouldShowInput("uploaded", true)).toBe(true);
  });
  it("accepted false", () => {
    expect(shouldShowInput("accepted", false)).toBe(false);
  });
});

describe("bannerKind", () => {
  it("all uploaded -> all_uploaded", () => {
    expect(bannerKind(summarize(deriveDocState(TYPES.map((t) => uploadedRow(t)))))).toBe("all_uploaded");
  });
  it("all accepted", () => {
    expect(bannerKind(summarize(deriveDocState(TYPES.map((t) => uploadedRow(t, { review_status: "accepted" })))))).toBe("all_accepted");
  });
  it("rejected priority", () => {
    const docs = TYPES.map((t, i) => uploadedRow(t, i === 0 ? { review_status: "rejected" } : {}));
    expect(bannerKind(summarize(deriveDocState(docs)))).toBe("rejected");
  });
});
