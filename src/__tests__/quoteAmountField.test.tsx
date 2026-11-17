// BI_WEBSITE_QUOTE_AMOUNT_FIELD_v1 - the calculator's amount reads as money and never offers more than the cover limit.
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../lib/analytics", () => ({ track: vi.fn() }));

import { MarketProvider } from "../lib/market";
import Quote from "../pages/Quote";

const page = (m: "US" | "CA") => render(<MemoryRouter><MarketProvider initial={m}><Quote /></MarketProvider></MemoryRouter>);

describe("the quote calculator's amount", () => {
  it("shows commas as it is typed and stops at the United States limit of $5,000,000", () => {
    const { container } = page("US");
    const field = screen.getByLabelText("Debt amount") as HTMLInputElement;
    expect(field.value).toBe("1,000,000");
    fireEvent.change(field, { target: { value: "2500000" } });
    expect(field.value).toBe("2,500,000");
    fireEvent.change(field, { target: { value: "$3,250,000" } });
    expect(field.value).toBe("3,250,000");
    fireEvent.change(field, { target: { value: "50000000" } });
    expect(field.value).toBe("5,000,000");
    expect(container.textContent).toContain("Maximum $5,000,000");
    expect(container.textContent).not.toContain("50,000,000");
  });
  it("stops at $1,000,000 on the Canadian site", () => {
    const { container } = page("CA");
    const field = screen.getByLabelText("Debt amount") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "9000000" } });
    expect(field.value).toBe("1,000,000");
    expect(container.textContent).toContain("Maximum $1,000,000");
  });
});
