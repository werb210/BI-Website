// BI_WEBSITE_BLOCK_v784_OCT11_AUDIT_v1
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import LegacyReferrerRedirect from "../components/LegacyReferrerRedirect";

function Where() {
  const { pathname, search } = useLocation();
  return <div data-testid="where">{pathname + search}</div>;
}

function landAt(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/referrer/*" element={<LegacyReferrerRedirect />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
  return screen.getByTestId("where").textContent;
}

afterEach(cleanup);

describe("LegacyReferrerRedirect", () => {
  it("forwards a valid short code to /r/<code>", () => {
    expect(landAt("/referrer/invite?ref=abc123")).toBe("/r/abc123");
  });

  it("forwards a valid UUID to /r/<uuid>", () => {
    const uuid = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
    expect(landAt(`/referrer/login?ref=${uuid}`)).toBe(`/r/${uuid}`);
  });

  it("sends missing or invalid refs to /applications/new with no ref", () => {
    expect(landAt("/referrer/login")).toBe("/applications/new");
    cleanup();
    expect(landAt("/referrer?ref=x")).toBe("/applications/new");
    cleanup();
    expect(landAt("/referrer/dash?ref=%3Cscript%3E")).toBe("/applications/new");
  });
});
