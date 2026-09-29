// BI_WEBSITE_US_COPY_SWEEP_v23 - coverage area is Canada and the United
// States. This component renders on Home AND CSBFP, so a Canada-only claim
// here appeared on multiple pages.
// BI_WEBSITE_BLOCK_v100_SCORE_LAYOUT_AND_BRAND_v2
// Real Markel image at assets/logos/markel_logo.svg; bundled by Vite.
import markelLogo from "../../assets/logos/markel_logo.svg";
type Props = { variant?: "compact" | "stacked"; className?: string };
export default function MarkelBadge({ variant = "compact", className = "" }: Props) {
  if (variant === "stacked") return <div className={className}><img src={markelLogo} alt="Markel" className="h-10 w-auto"/></div>;
  // BI_WEBSITE_READABILITY_v3: the compact badge sits on dark sections, so its
  // text is light and the Markel logo is shown reversed (white).
  return <div className={`inline-flex items-center gap-3 text-bf-textMuted ${className}`}><span>Underwritten by</span><img src={markelLogo} alt="Markel" className="h-6 w-auto brightness-0 invert"/><span>A-rated · Canada & United States</span></div>;
}
