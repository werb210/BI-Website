// BI_DOC_LIST_v61 — reusable required-documents widget. Renders the
// canonical slot list, hides startup-only slots when not applicable,
// and provides a "period ending" date input next to dated financial docs.
import { type BiDocSlot, type BiDocRequirement, requiredRequirements } from "../../lib/biDocumentRequirements";

export type DocUpload = { file: File | null; periodEnd: string };
export type DocUploadState = Partial<Record<BiDocSlot, DocUpload>>;

type Props = {
  formationDate: string | null;
  value: DocUploadState;
  onChange: (next: DocUploadState) => void;
};

export default function RequiredDocumentsList({ formationDate, value, onChange }: Props) {
  const required = requiredRequirements(formationDate);

  function setSlot(slot: BiDocSlot, patch: Partial<DocUpload>) {
    const current = value[slot] ?? { file: null, periodEnd: "" };
    onChange({ ...value, [slot]: { ...current, ...patch } });
  }

  return (
    <div className="space-y-4">
      <Group title="Required financial documents (sent to carrier)">
        {required.filter((r) => r.carrierBound && r.conditional === "always").map((r) => (
          <Slot key={r.slot} req={r} state={value[r.slot]} onSet={setSlot} />
        ))}
      </Group>

      {required.some((r) => r.conditional === "startup_only") && (
        <Group title="Startup-specific documents (sent to carrier)" hint="Required because the business is under 3 years old.">
          {required.filter((r) => r.conditional === "startup_only").map((r) => (
            <Slot key={r.slot} req={r} state={value[r.slot]} onSet={setSlot} />
          ))}
        </Group>
      )}

      <Group title="Identification (Boreal-internal, not sent to carrier)">
        {required.filter((r) => !r.carrierBound).map((r) => (
          <Slot key={r.slot} req={r} state={value[r.slot]} onSet={setSlot} />
        ))}
      </Group>
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white/80 mb-1">{title}</h3>
      {hint && <p className="text-xs text-white/50 mb-2">{hint}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Slot({
  req, state, onSet,
}: {
  req: BiDocRequirement;
  state: DocUpload | undefined;
  onSet: (slot: BiDocSlot, patch: Partial<DocUpload>) => void;
}) {
  const file = state?.file ?? null;
  const periodEnd = state?.periodEnd ?? "";
  return (
    <div className="rounded border border-white/10 bg-white/5 p-3">
      <label className="block text-sm font-medium text-white">{req.label}*</label>
      <p className="text-xs text-white/60 mt-0.5">{req.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".pdf,.docx,.xlsx,.xls,.csv,.md,image/png,image/jpeg"
          onChange={(e) => onSet(req.slot, { file: e.target.files?.[0] ?? null })}
          className="text-sm text-white/80"
        />
        {req.hasPeriodEnd && (
          <label className="text-xs text-white/70 flex items-center gap-2">
            Period ending
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => onSet(req.slot, { periodEnd: e.target.value })}
              className="input"
            />
          </label>
        )}
      </div>
      {file && <p className="mt-1 text-xs text-emerald-300">✓ {file.name}</p>}
    </div>
  );
}
