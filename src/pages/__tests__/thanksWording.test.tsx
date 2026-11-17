// BI_WEBSITE_THANKS_WORDING_v1
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Thanks, { thanksLines } from "../Thanks";

describe("the thank-you page", () => {
  it("says documents are still needed when some are missing", () => {
    render(<MemoryRouter initialEntries={["/applications/X/thanks?missing=4"]}><Thanks /></MemoryRouter>);
    expect(screen.getByText(/We still need 4 documents/)).toBeInTheDocument();
    expect(screen.queryByText(/will review your documents and submit/)).not.toBeInTheDocument();
  });
  it("keeps the review wording when everything is uploaded", () => {
    expect(thanksLines(0)[0]).toContain("will review your documents");
    expect(thanksLines(1)[0]).toContain("one document");
  });
});
