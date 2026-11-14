// BI_WEBSITE_FIELD_REPS_v1 - outside reps who hand out the US lenders page at events.
import qrcode from "qrcode-generator";

export const REP_BOOK_URL = "https://www.boreal.financial/book-pgi";
export const REP_TOKEN_KEY = (code: string) => `bi.rep.${code}`;

/** A rep code from a link: lower case letters and digits only, or nothing. */
export function repCode(raw: unknown): string {
  const s = String(raw ?? "").trim().toLowerCase();
  return /^[a-z0-9]{4,16}$/.test(s) ? s : "";
}
/** The token that ties an information email to the person it was sent to. */
export function contactToken(raw: unknown): string {
  const s = String(raw ?? "").trim();
  return /^[A-Za-z0-9_-]{16,40}$/.test(s) ? s : "";
}
export const bookUrlFor = (rep: string) => (rep ? `${REP_BOOK_URL}?rep=${encodeURIComponent(rep)}` : REP_BOOK_URL);
export type RepAudience = "lender" | "broker";
/** The page a rep's QR code opens: the visitor says whether they are a lender or a broker. */
export const repQrUrl = (origin: string, rep: string) => `${origin}/us?rep=${encodeURIComponent(rep)}`;
export const shareUrlFor = (origin: string, rep: string, audience: RepAudience = "lender") => `${origin}/${audience === "broker" ? "us-brokers" : "us-lenders"}?rep=${encodeURIComponent(rep)}`;

/** The QR code for a link, as an SVG path on a square grid (drawn by the page; nothing is fetched). */
export function qrPath(text: string): { size: number; d: string } {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) if (qr.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
  return { size: n, d };
}

/** Shrinks a card photo before it is sent: the longest side becomes 1600px and it is saved as a JPEG. */
export async function shrinkPhoto(file: File, max = 1600): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("photo"));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally { URL.revokeObjectURL(url); }
}
