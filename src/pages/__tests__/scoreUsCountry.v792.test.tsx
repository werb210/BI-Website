// BI_WEBSITE_v792_US_APPLICATIONS - US businesses can start a quote.
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../lib/api", () => ({ api: { score: vi.fn(async () => ({ public_id: "ABC123DEF456" })) } }));

import Score from "../Score";

describe("quote page country", () => {
  it("offers the United States as a selectable country", () => {
    render(<MemoryRouter><Score /></MemoryRouter>);
    const select = screen.getByDisplayValue(/Canada/) as HTMLSelectElement;
    const us = Array.from(select.options).find((o) => o.value === "US");
    expect(us).toBeTruthy();
    expect(us!.disabled).toBe(false);
    fireEvent.change(select, { target: { value: "US" } });
    expect(select.value).toBe("US");
    expect(screen.queryByText(/coming soon/i)).toBeNull();
    expect(screen.queryByText(/Only Canadian businesses/i)).toBeNull();
  });
});
