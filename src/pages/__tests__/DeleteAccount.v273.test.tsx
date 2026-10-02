// BI_WEBSITE_DELETE_ACCOUNT_v273
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import DeleteAccount from "../DeleteAccount";

describe("Boreal Risk delete-account page (Google Play)", () => {
  it("names the app and gives the in-app steps and an email route", () => {
    render(<DeleteAccount />);
    expect(screen.getByText(/For the Boreal Risk app/)).toBeTruthy();
    expect(screen.getByText(/tap Delete my account/)).toBeTruthy();
    expect(screen.getByText(/Yes, delete everything/)).toBeTruthy();
    expect(screen.getByText(/info@boreal\.financial/)).toBeTruthy();
  });
  it("says what is deleted and what is kept, and for how long", () => {
    render(<DeleteAccount />);
    expect(screen.getByText("What is deleted")).toBeTruthy();
    expect(screen.getByText("What is kept, and for how long")).toBeTruthy();
    expect(screen.getAllByText(/as long as the law requires/).length).toBeGreaterThan(0);
  });
  it("is routed at /delete-account", () => {
    expect(readFileSync("src/App.tsx", "utf8")).toContain('<Route path="/delete-account" element={<DeleteAccount />} />');
  });
});
