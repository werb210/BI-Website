// BI_WEBSITE_v792_US_APPLICATIONS - US businesses can start a quote.
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../lib/api", () => ({ api: { score: vi.fn(async () => ({ public_id: "ABC123DEF456" })) } }));

import Score from "../Score";

describe("quote page country", () => {
  it("starts on the United States, listed first, with Canada selectable (BI_WEBSITE_US_FIRST_v1)", () => {
    render(<MemoryRouter><Score /></MemoryRouter>);
    const select = screen.getByDisplayValue(/United States/) as HTMLSelectElement;
    expect(select.value).toBe("US");
    expect(Array.from(select.options).map((o) => o.value)).toEqual(["US", "CA"]);
    fireEvent.change(select, { target: { value: "CA" } });
    expect(select.value).toBe("CA");
    expect(screen.queryByText(/coming soon/i)).toBeNull();
    expect(screen.queryByText(/Only Canadian businesses/i)).toBeNull();
  });
});
