// BI_WEBSITE_FIELD_REPS_v1 - the page an outside rep keeps open at an event: a QR code to show people, a way to add
// the people they meet (photo of a business card, or typed), a button to book a call, and the list of who they have
// added and what has happened since. Signed in with the rep's PIN.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/request";
import { OPERATOR_PHONE_DISPLAY } from "../lib/operator";
import { REP_TOKEN_KEY, bookUrlFor, qrPath, repCode, shareUrlFor, shrinkPhoto } from "../lib/fieldRep";

type Contact = { id: string; full_name: string | null; company_name: string | null; email: string | null; phone_e164: string | null; status: string; created_at: string };
type Me = { rep: { code: string; full_name: string; company_name: string | null }; links: { share: string; book: string }; counts: { total: number; opened: number }; contacts: Contact[] };
type Form = { full_name: string; company_name: string; title: string; email: string; phone: string; notes: string };
const EMPTY: Form = { full_name: "", company_name: "", title: "", email: "", phone: "", notes: "" };
const INPUT = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-[#0B1F3A]";
const LABEL = "block text-sm font-semibold text-[#0B1F3A]";
export const REP_CONSENT_NOTE = "Only add people who gave you their details and are happy to hear from us. Each person gets one email with the information; if it is not opened in 72 hours and you entered a mobile number, one text follows.";

const readToken = (code: string) => { try { return localStorage.getItem(REP_TOKEN_KEY(code)) || ""; } catch { return ""; } };
const saveToken = (code: string, t: string) => { try { if (t) localStorage.setItem(REP_TOKEN_KEY(code), t); else localStorage.removeItem(REP_TOKEN_KEY(code)); } catch { /* private window */ } };
const message = (err: unknown, fallback: string) => { const d = (err as { detail?: { message?: string } })?.detail; return d?.message || fallback; };

export default function RepPage() {
  const code = repCode(useParams().code);
  const [token, setToken] = useState(() => (code ? readToken(code) : ""));
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [fromCard, setFromCard] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState<"" | "pin" | "scan" | "save">("");
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const auth = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const signOut = useCallback(() => { saveToken(code, ""); setToken(""); setMe(null); }, [code]);
  const load = useCallback(async () => {
    if (!token) return;
    try { setMe(await apiRequest<Me & { ok: boolean }>("/api/v1/field/me", { headers: auth })); }
    catch (err) { if ((err as { status?: number })?.status === 401) signOut(); }
  }, [token, auth, signOut]);
  useEffect(() => { void load(); }, [load]);

  async function signIn(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy("pin"); setPinError("");
    try {
      const r = await apiRequest<{ token: string }>("/api/v1/field/login", { method: "POST", headers: { Authorization: "" }, body: JSON.stringify({ code, pin }) });
      saveToken(code, r.token); setToken(r.token); setPin("");
    } catch (err) { setPinError(message(err, "That PIN is not right.")); }
    finally { setBusy(""); }
  }

  async function onPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    setBusy("scan"); setNote(null);
    try {
      const image = await shrinkPhoto(file);
      const r = await apiRequest<{ fields: Partial<Form>; found: boolean }>("/api/v1/field/scan", { method: "POST", headers: auth, body: JSON.stringify({ image }) });
      setForm({ ...EMPTY, ...r.fields }); setFromCard(true); setShowForm(true);
      setNote(r.found ? { ok: true, text: "Check the details, fix anything that is wrong, then save." } : { ok: false, text: "We could not read that card. Type the details in, or try the photo again." });
    } catch (err) {
      setForm(EMPTY); setFromCard(false); setShowForm(true);
      setNote({ ok: false, text: message(err, "We could not read that card. Type the details in instead.") });
    } finally { setBusy(""); }
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) { setNote({ ok: false, text: "Enter an email address or a mobile number." }); return; }
    setBusy("save"); setNote(null);
    try {
      const r = await apiRequest<{ created: boolean; emailed: boolean }>("/api/v1/field/contacts", { method: "POST", headers: auth, body: JSON.stringify({ ...form, source: fromCard ? "card" : "manual" }) });
      const who = form.full_name.trim() || form.email.trim() || form.phone.trim();
      setNote({ ok: true, text: r.emailed ? `Saved. We emailed ${who} the information.` : r.created ? `Saved ${who}.` : `${who} was already on your list. Details updated.` });
      setForm(EMPTY); setFromCard(false); setShowForm(false);
      void load();
    } catch (err) { setNote({ ok: false, text: message(err, `We could not save that. Try again, or call us at ${OPERATOR_PHONE_DISPLAY}.`) }); }
    finally { setBusy(""); }
  }

  const shareUrl = me?.links.share || (code ? shareUrlFor(typeof window === "undefined" ? "" : window.location.origin, code) : "");
  const qr = useMemo(() => (shareUrl ? qrPath(shareUrl) : null), [shareUrl]);
  async function share() {
    const data = { title: "Personal Guarantee Insurance for lenders and brokers", url: shareUrl };
    try { if (navigator.share) { await navigator.share(data); return; } } catch { return; }
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* nothing to do */ }
  }

  if (!code) return <main className="min-h-screen bg-bf-bg px-5 py-16 text-center text-white" data-testid="rep-page"><h1 className="text-2xl font-bold">This link is not right.</h1><p className="mt-3 text-bf-textMuted">Ask us for your link again, or call {OPERATOR_PHONE_DISPLAY}.</p></main>;

  if (!token) return (
    <main className="min-h-screen bg-bf-bg px-5 py-12 text-white" data-testid="rep-page">
      <form onSubmit={signIn} className="mx-auto max-w-sm rounded-2xl bg-white p-6 text-[#0B1F3A]" aria-label="Enter your PIN">
        <h1 className="text-2xl font-bold">Your Boreal contact page</h1>
        <p className="mt-2 text-sm text-slate-700">Enter the PIN we sent you.</p>
        <label className={`${LABEL} mt-4`} htmlFor="rep-pin">PIN</label>
        <input id="rep-pin" className={`${INPUT} text-center text-2xl tracking-[0.4em]`} inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
        {pinError ? <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{pinError}</p> : null}
        <button type="submit" disabled={busy === "pin" || pin.length < 4} className="bf-btn bf-btn--primary mt-4 w-full">{busy === "pin" ? "Checking..." : "Open my page"}</button>
        <p className="mt-4 text-xs text-slate-600">Lost your PIN? Call us at {OPERATOR_PHONE_DISPLAY}.</p>
      </form>
    </main>
  );

  const set = <K extends keyof Form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <main className="min-h-screen bg-bf-bg px-4 pb-16 pt-6 text-white" data-testid="rep-page">
      <div className="mx-auto max-w-xl">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-bold">{me ? `Hi ${me.rep.full_name.split(" ")[0]}` : "Your contact page"}</h1>
          <button type="button" onClick={signOut} className="text-sm text-bf-textMuted underline">Lock</button>
        </div>
        {me ? <p className="mt-1 text-sm text-bf-textMuted">{me.counts.total} {me.counts.total === 1 ? "contact" : "contacts"} so far, {me.counts.opened} opened the information. Everyone here is credited to you.</p> : null}

        <section className="mt-5 rounded-2xl bg-white p-5 text-center text-[#0B1F3A]" aria-label="Your QR code">
          <h2 className="text-lg font-bold">Let them scan this</h2>
          <p className="mt-1 text-sm text-slate-700">It opens the information page for banks, lenders and brokers. Anyone who leaves their details there is credited to you.</p>
          {qr ? (
            <svg role="img" aria-label="QR code for your information page" viewBox={`-2 -2 ${qr.size + 4} ${qr.size + 4}`} className="mx-auto mt-4 h-auto w-full max-w-[18rem]" shapeRendering="crispEdges">
              <rect x={-2} y={-2} width={qr.size + 4} height={qr.size + 4} fill="#ffffff" /><path d={qr.d} fill="#000000" />
            </svg>
          ) : null}
          <p className="mt-3 break-all text-xs text-slate-600">{shareUrl}</p>
          <button type="button" onClick={share} className="bf-btn bf-btn--secondary mt-3 w-full !border-[#0B1F3A] !text-[#0B1F3A]">{copied ? "Link copied" : "Share the link"}</button>
        </section>

        <section className="mt-5 grid gap-3" aria-label="Add a contact">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} data-testid="rep-card-photo" />
          <button type="button" disabled={busy === "scan"} onClick={() => fileRef.current?.click()} className="bf-btn bf-btn--primary w-full">{busy === "scan" ? "Reading the card..." : "Scan a business card"}</button>
          <button type="button" onClick={() => { setForm(EMPTY); setFromCard(false); setShowForm(true); setNote(null); }} className="bf-btn bf-btn--secondary w-full">Add by hand</button>
          <a href={me?.links.book || bookUrlFor(code)} target="_blank" rel="noopener noreferrer" className="bf-btn bf-btn--secondary w-full text-center">Book a call with Boreal</a>
        </section>

        {note ? <p role={note.ok ? "status" : "alert"} className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${note.ok ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{note.text}</p> : null}

        {showForm ? (
          <form onSubmit={save} noValidate className="mt-4 rounded-2xl bg-white p-5 text-[#0B1F3A]" aria-label="Contact details">
            <h2 className="text-lg font-bold">{fromCard ? "From the card" : "New contact"}</h2>
            <label className={`${LABEL} mt-3`} htmlFor="rc-name">Name</label>
            <input id="rc-name" className={INPUT} autoComplete="off" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            <label className={`${LABEL} mt-3`} htmlFor="rc-company">Bank, lender or brokerage</label>
            <input id="rc-company" className={INPUT} autoComplete="off" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
            <label className={`${LABEL} mt-3`} htmlFor="rc-title">Title</label>
            <input id="rc-title" className={INPUT} autoComplete="off" value={form.title} onChange={(e) => set("title", e.target.value)} />
            <label className={`${LABEL} mt-3`} htmlFor="rc-email">Email</label>
            <input id="rc-email" className={INPUT} type="email" inputMode="email" autoComplete="off" autoCapitalize="none" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <label className={`${LABEL} mt-3`} htmlFor="rc-phone">Mobile</label>
            <input id="rc-phone" className={INPUT} type="tel" inputMode="tel" autoComplete="off" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            <label className={`${LABEL} mt-3`} htmlFor="rc-notes">Notes for us</label>
            <textarea id="rc-notes" className={INPUT} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            <p className="mt-3 text-xs text-slate-600">{REP_CONSENT_NOTE}</p>
            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={busy === "save"} className="bf-btn bf-btn--primary flex-1">{busy === "save" ? "Saving..." : "Save and send the information"}</button>
              <button type="button" onClick={() => { setShowForm(false); setNote(null); }} className="bf-btn bf-btn--secondary !border-[#0B1F3A] !text-[#0B1F3A]">Cancel</button>
            </div>
          </form>
        ) : null}

        <section className="mt-8" aria-label="Your contacts">
          <h2 className="text-lg font-bold">Your contacts</h2>
          {!me ? <p className="mt-2 text-sm text-bf-textMuted">Loading...</p> : me.contacts.length === 0 ? <p className="mt-2 text-sm text-bf-textMuted">Nobody yet. Scan a card or add someone by hand.</p> : (
            <ul className="mt-3 grid gap-2">
              {me.contacts.map((c) => (
                <li key={c.id} className="rounded-xl bg-white px-4 py-3 text-[#0B1F3A]">
                  <p className="font-semibold">{c.full_name || c.email || c.phone_e164}</p>
                  {c.company_name ? <p className="text-sm text-slate-700">{c.company_name}</p> : null}
                  <p className="text-sm text-slate-700">{[c.full_name ? c.email : null, c.phone_e164].filter(Boolean).join(" | ")}</p>
                  <p className="mt-1 text-xs font-semibold text-[#1e3a8a]">{c.status}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
