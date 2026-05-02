import { useState, ReactNode } from "react";

export function Section({
  title, answered, total, children, defaultOpen = false,
}: { title: string; answered: number; total: number; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const complete = answered >= total;
  return (
    <div className={`bi-section ${complete ? "complete" : "incomplete"}`}>
      <button type="button" className="bi-section-head" onClick={() => setOpen(!open)}>
        <div>
          <div className="bi-section-title">{title}</div>
          <div className="bi-section-progress">{answered} of {total} questions answered</div>
        </div>
        <span className="bi-section-status">{complete ? "Complete" : "Incomplete"} {open ? "▴" : "▾"}</span>
      </button>
      {open && <div className="bi-section-body">{children}</div>}
    </div>
  );
}
