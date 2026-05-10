// BI_WEBSITE_BLOCK_v99_MARKETING_HOME_v1
import markelLogo from "/assets/carriers/markel.webp";

type Props = { variant?: "compact" | "stacked"; className?: string };

export default function MarkelBadge({ variant = "compact", className = "" }: Props) {
  if (variant === "stacked") return <div className={className}> <img src={markelLogo} alt="Markel" className="h-10 w-auto"/> </div>;
  return <div className={`inline-flex items-center gap-3 ${className}`}><span>Underwritten by</span><img src={markelLogo} alt="Markel" className="h-6 w-auto"/><span>A-rated · Available across Canada</span></div>;
}
