# OTP Audit — BI-Website (2026-05-19)

## Scope
- Route behavior reviewed:
  - `/lender/login`
  - `/referrer/login` (implemented through `/referrer/*`)
- Goal: verify OTP entry wiring and BI-Server API usage consistency.

## Step 1 — OTP code discovery
Command run:

```bash
git ls-files | xargs grep -nE 'otp|/auth/otp|phone' --include='*.tsx' --include='*.ts' 2>/dev/null
```

Key OTP/login hits:
- `src/pages/LenderLogin.tsx`
- `src/pages/ReferrerPortal.tsx`
- `src/lib/api.ts`
- `src/App.tsx` (route mapping)

## Step 2 — Route/component findings

### `/lender/login`
- Route maps directly to `LenderLogin` in `src/App.tsx`.
- Component uses explicit 2-stage OTP:
  1) phone/email collection (`stage="phone"`) calling `POST {API_BASE}/api/v1/lender/otp/start`
  2) code verification (`stage="code"`) calling `POST {API_BASE}/api/v1/lender/otp/verify`
- Only navigates to `/lender/portal` after successful verify response with `token`.

Conclusion: lender flow correctly gates portal access behind OTP verification.

### `/referrer/login`
- Header/footer link points to `/referrer/login`, but router defines `Route path="/referrer/*" element={<ReferrerPortal />}`.
- `ReferrerPortal` initializes `token` from `localStorage.getItem("bi.ref_token")` and default `stage="otp"`.
- A startup `useEffect` runs when `token` is present:
  - calls `GET /referrer/me`
  - if successful, sets `stage` to `dashboard` (if profile exists) or `intake` (if profile missing).
- This means **any existing valid `bi.ref_token` bypasses the OTP screen entirely**, taking user straight to intake/dashboard.

Conclusion: referrer OTP is skipped when prior token exists; this is consistent with the reported "shows intake form" symptom.

## Step 3 — BI-Server API base verification

### Lender login base
`LenderLogin.tsx`:
- `API_BASE = VITE_API_URL || VITE_BI_API_URL || "https://bi-server-...azurewebsites.net"`
- OTP endpoints call `${API_BASE}/api/v1/lender/otp/start` and `/verify`

### Referrer login base
`ReferrerPortal.tsx`:
- `BASE = (VITE_API_URL || VITE_BI_API_URL || window.location.origin) + "/api/v1"`
- OTP endpoints call `POST /referrer/otp/start` and `/referrer/otp/verify` via `jsonFetch(BASE + path)`

### Shared baseline in library
`src/lib/api.ts` uses the same env priority and appends `/api/v1`:
- `(VITE_API_URL || VITE_BI_API_URL || window.location.origin) + "/api/v1"`

Conclusion:
- Both lender and referrer OTP flows use the same env var precedence (`VITE_API_URL`, fallback `VITE_BI_API_URL`) and target BI-Server `/api/v1/...` routes.
- Difference is fallback host:
  - lender: hardcoded Azure BI-Server URL fallback
  - referrer/lib: `window.location.origin` fallback
- This base difference is **not** what causes OTP skipping; token bootstrap logic in referrer route is the direct cause of bypass behavior.

## Root-cause summary for reported bug
If `/referrer/login` lands on intake instead of OTP, the most likely immediate cause is existing `bi.ref_token` in local storage that still validates at `/referrer/me`.

Practical reproduction check:
1. Open `/referrer/login` with existing `bi.ref_token` -> likely intake/dashboard directly.
2. Clear `localStorage.removeItem('bi.ref_token')` and reload `/referrer/login` -> OTP stage should appear.

