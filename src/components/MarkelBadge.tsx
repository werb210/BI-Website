// BI_WEBSITE_BLOCK_v100_SCORE_LAYOUT_AND_BRAND_v2
// Real Markel image at assets/logos/image001 (1)-1.webp; bundled by Vite.
import markelLogo from "../../assets/logos/image001 (1)-1.webp";
type Props = { variant?: "compact" | "stacked"; className?: string };
export default function MarkelBadge({ variant = "compact", className = "" }: Props) {
  if (variant === "stacked") return <div className={className}><img src={markelLogo} alt="Markel" className="h-10 w-auto"/></div>;
  return <div className={`inline-flex items-center gap-3 ${className}`}><span>Underwritten by</span><img src={markelLogo} alt="Markel" className="h-6 w-auto"/><span>A-rated · Available across Canada</span></div>;
}
