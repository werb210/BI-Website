// BI_WEBSITE_BLOCK_v170_CROSS_LINK_LABEL_UNIFY_v1
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}
function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe("BI_WEBSITE_BLOCK_v170 — Header cross-link", () => {
  it("desktop label is the unified 'Boreal Financial'", () => {
    renderHeader();
    const link = screen.getByTestId("bi-link-boreal-financial") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("https://boreal.financial");
    expect(link.textContent?.trim()).toBe("Boreal Financial");
  });

  it("desktop cross-link opens in the same tab (no target=_blank)", () => {
    renderHeader();
    const link = screen.getByTestId("bi-link-boreal-financial") as HTMLAnchorElement;
    expect(link.getAttribute("target")).toBeNull();
    // rel kept for safety even without target=_blank.
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("mobile drawer cross-link uses the unified label", () => {
    renderHeader();
    // Open the mobile menu. The toggle button has aria-label
    // "Toggle navigation menu" in BI's Header.
    const toggle = screen.getByRole("button", { name: /toggle navigation menu/i });
    fireEvent.click(toggle);
    const link = screen.getByTestId(
      "bi-mobile-link-boreal-financial",
    ) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("https://boreal.financial");
    expect(link.textContent?.trim()).toBe("Boreal Financial");
    expect(link.getAttribute("target")).toBeNull();
  });
});

describe("BI_WEBSITE_BLOCK_v170 — Footer cross-link", () => {
  it("Explore column links to boreal.financial with the unified label", () => {
    renderFooter();
    const link = screen.getByTestId(
      "bi-footer-link-boreal-financial",
    ) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("https://boreal.financial");
    expect(link.textContent?.trim()).toBe("Boreal Financial");
    expect(link.getAttribute("target")).toBeNull();
  });
});

describe("BI_WEBSITE_BLOCK_v170 — no stale 'Visit Boreal Financial' label", () => {
  it("Header does not contain the old label anywhere", () => {
    const { container } = renderHeader();
    expect(within(container).queryByText(/Visit Boreal Financial/i)).toBeNull();
  });

  it("Footer does not contain the old label anywhere", () => {
    const { container } = renderFooter();
    expect(within(container).queryByText(/Visit Boreal Financial/i)).toBeNull();
  });
});
