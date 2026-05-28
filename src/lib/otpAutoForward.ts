// BI_WEBSITE_BLOCK_v98_OTP_AUTOFORWARD_ALL_v1
// Single source of truth for OTP auto-forward heuristics. Mirrors the server
// normalizer so we send when the server will accept the number.
// (See BI-Server src/util/phoneE164.ts — same length rules.)
//
// Phone is "ready to send" when:
//   - starts with '+'  AND has 8-15 digits total, OR
//   - 10 digits (CA/US default), OR
//   - 11 digits starting with 1
// OTP code is "ready to verify" when 6 digits exactly.
export function isPhoneReady(raw: string): boolean {
  const s = (raw ?? "").trim();
  if (!s) return false;
  const hasPlus = s.startsWith("+");
  const digits = s.replace(/[^0-9]/g, "");
  if (hasPlus) return digits.length >= 8 && digits.length <= 15;
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}
// BI_WEBSITE_BLOCK_v399_OTP_CANONICAL_KEY_v1
// Collapse a phone to a stable key so the auto-fire guard treats e.g.
// "7802648467" (10) and "17802648467" (11, leading 1) as the SAME number.
// The raw-digit guard didn't, so typing/autofilling the country code fired
// /otp/start twice — and the server then canceled the first (live) code.
export function canonicalPhoneDigits(raw: string): string {
  const d = (raw ?? "").replace(/[^0-9]/g, "");
  if (d.length === 11 && d.startsWith("1")) return d.slice(1);
  return d;
}
export const OTP_CODE_LENGTH = 6;
export function isCodeReady(raw: string): boolean {
  return (raw ?? "").replace(/[^0-9]/g, "").length === OTP_CODE_LENGTH;
}
