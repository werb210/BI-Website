// BI_WEBSITE_BLOCK_v789_AUDIT_ROUND2 [141][147]
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Contact from "../pages/Contact";
import Footer from "../components/Footer";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import { FALLBACK_BI_SERVER_URL } from "../config";

const ENTITY = "2630108 Alberta Ltd. (Boreal Insurance)";
const ADDRESS = "450 Sparling Crt SW, Edmonton, Alberta T6X 1G9";
const CASL = "I agree to receive calls, texts and emails from Boreal Insurance about my inquiry. I can unsubscribe at any time.";

const inRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

let alertSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  alertSpy.mockRestore();
});

function fill() {
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Pat Lee" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pat@example.com" } });
  fireEvent.change(screen.getByLabelText("Phone number"), { target: { value: "(587) 555-1234" } });
}

describe("[147] contact form", () => {
  it("has labelled, named inputs on the site's field class", () => {
    inRouter(<Contact />);
    for (const [label, name] of [["Company name (optional)", "company"], ["Full name", "name"], ["Email", "email"], ["Phone number", "phone"]]) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute("name", name);
      expect(input).toHaveClass("bf-field");
    }
    expect(screen.getByRole("button", { name: "Send message" })).toHaveClass("bf-btn", "bf-btn--primary");
  });

  it("shows the CASL checkbox, notice and entity line", () => {
    inRouter(<Contact />);
    const box = screen.getByLabelText(CASL);
    expect(box).toHaveAttribute("type", "checkbox");
    expect(box).toHaveAttribute("name", "casl_consent");
    expect(box).not.toBeChecked();
    expect(screen.getByText(new RegExp(ENTITY.replace(/[().]/g, "\\$&")))).toHaveTextContent(ADDRESS);
  });

  it("validates inline, without alert(), and requires consent", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    inRouter(<Contact />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/consent/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("posts to BI-Server and shows an inline success message", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    inRouter(<Contact />);
    fill();
    fireEvent.click(screen.getByLabelText(CASL));
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/message was sent/));
    expect(fetchMock.mock.calls[0][0]).toBe(`${FALLBACK_BI_SERVER_URL}/api/v1/crm/lead`);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ name: "Pat Lee", email: "pat@example.com", casl_consent: true, casl_consent_text: CASL });
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("shows an inline error when the server fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })));
    inRouter(<Contact />);
    fill();
    fireEvent.click(screen.getByLabelText(CASL));
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("(866) 631-8939"));
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("is linked from the footer", () => {
    inRouter(<Footer />);
    expect(screen.getAllByRole("link").some((a) => a.getAttribute("href") === "/contact")).toBe(true);
  });
});

describe("[141] operator identity", () => {
  it("footer shows (c) <year> and the entity, and only the 866 number", () => {
    const { container } = inRouter(<Footer />);
    expect(container).toHaveTextContent(`(c) ${new Date().getFullYear()} ${ENTITY}`);
    expect(container.textContent).toContain("(866) 631-8939");
    expect(container.textContent).not.toContain("+1 (866)");
  });

  for (const [name, Page] of [["Privacy", Privacy], ["Terms", Terms]] as const) {
    it(`${name} names the operator, site, address and phone`, () => {
      const { container } = inRouter(<Page />);
      const text = container.textContent ?? "";
      expect(text).toContain(ENTITY);
      expect(text).toContain("boreal.insure");
      expect(text).toContain(ADDRESS);
      expect(text).toContain("(866) 631-8939");
      expect(text).not.toContain("boreal.financial and");
      expect(text).not.toContain("Cochrane");
    });
  }

  it("privacy policy discloses GTM, Google Ads, analytics cookies and the consent banner", () => {
    const { container } = inRouter(<Privacy />);
    const text = container.textContent ?? "";
    expect(text).toContain("Google Tag Manager");
    expect(text).toContain("Google Ads");
    expect(text).toContain("analytics cookies");
    expect(text).toContain("consent banner");
    expect(text).not.toContain("we do not place advertising trackers");
  });

  it("the pages and footer are ASCII", () => {
    for (const f of ["src/pages/Privacy.tsx", "src/pages/Terms.tsx", "src/pages/Contact.tsx", "src/components/Footer.tsx", "src/lib/operator.ts"]) {
      expect([...readFileSync(f, "utf8")].every((c) => c.charCodeAt(0) < 128), f).toBe(true);
    }
  });
});
