// BI_WEBSITE_REFERRAL_LANDING_v1 - splash page a referred person lands on from a
// referrer invite SMS (boreal.insure/r/:code). PGI only. The ref code rides in
// the path and is appended to "Apply now" so attribution flows into the public
// PGI application (App.tsx captures ?ref into bi.referral_code, which Score.tsx
// sends to the server). "Apply now" uses a plain anchor (full navigation) so the
// capture effect runs. "Learn more" -> www.boreal.insure.
import { useParams } from "react-router-dom";

const BI_SITE = "https://www.boreal.insure/";

export default function ReferralLandingPgi() {
  const { code } = useParams<{ code: string }>();
  const refCode = (code || "").trim();

  if (!refCode) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">This referral link is no longer valid</h1>
        <p className="mt-3 text-white/60">
          Please ask your referrer to send you a fresh link, or visit{" "}
          <a href={BI_SITE} className="underline">boreal.insure</a>.
        </p>
      </div>
    );
  }

  const applyHref = `/applications/new?ref=${encodeURIComponent(refCode)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-bf-cta">
        You have been referred to Boreal Risk Management
      </p>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        Protect the personal guarantee behind your financing
      </h1>
      <p className="mt-4 text-white/70">
        Personal Guarantee coverage helps Canadian business owners respond to a
        covered claim on the personal guarantees behind their business
        financing - so a business setback does not have to become a personal one.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={applyHref}
          className="inline-flex items-center justify-center rounded-full bg-bf-cta px-7 py-3 font-medium text-[#0B1F3A] transition hover:bg-bf-ctaHover"
        >
          Apply now
        </a>
        <a
          href={BI_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3 font-medium text-white transition hover:bg-white/10"
        >
          Learn more
        </a>
      </div>
    </div>
  );
}
