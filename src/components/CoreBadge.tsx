// BI_WEBSITE_BLOCK_v100_SCORE_LAYOUT_AND_BRAND_v2
type Props = { decision?: string | null; score?: number | null };
export function CoreBadge({ decision, score }: Props = {}) {
  const hasData = decision != null || score != null;
  if (!hasData) {
    return <span className="core-badge" title="This field contributed to your CORE score">CORE</span>;
  }
  const tone =
    decision === "approve" ? "ok" :
    decision === "decline" ? "bad" : "neutral";
  return (
    <span className={`core-badge core-badge-${tone}`} title={`CORE score: ${score ?? "—"} · ${decision ?? "pending"}`}>
      CORE{score != null ? <> <strong>{score}</strong></> : null}{decision ? <> · {decision}</> : null}
    </span>
  );
}
