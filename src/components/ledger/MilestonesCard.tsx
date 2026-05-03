type Milestone = {
  index: string;
  title: string;
  meta: string;
  state: "done" | "active" | "planned";
};

const milestones: Milestone[] = [
  { index: "01", title: "Persetujuan Anggaran Tahunan", meta: "COMPLETED — 14 JUL 2024", state: "done" },
  { index: "02", title: "Pengadaan Hardware Server", meta: "IN PROGRESS — DUE 20 OKT", state: "active" },
  { index: "03", title: "Penetapan Vendor Keamanan", meta: "PLANNED — NOV 2024", state: "planned" },
  { index: "04", title: "Audit Pra-Implementasi", meta: "PLANNED — DES 2024", state: "planned" },
];

export function MilestonesCard() {
  return (
    <div className="bg-paper border border-ledger-border shadow-sm">
      <div className="p-4 border-b border-ledger-border bg-secondary/40">
        <h3 className="text-[11px] font-bold uppercase tracking-widest">
          Milestones Utama
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {milestones.map((m) => {
          const box =
            m.state === "done"
              ? "border-ledger-border bg-muted text-muted-foreground"
              : m.state === "active"
                ? "border-2 border-audit-blue bg-paper text-audit-blue"
                : "border-ledger-border bg-paper text-muted-foreground/50";
          const metaColor =
            m.state === "done"
              ? "text-success-ink"
              : m.state === "active"
                ? "text-audit-blue"
                : "text-muted-foreground/60";
          const titleColor = m.state === "planned" ? "text-muted-foreground/60" : "";
          return (
            <div key={m.index} className="flex gap-4">
              <div
                className={`w-5 h-5 flex-shrink-0 flex items-center justify-center font-mono text-[10px] ${box}`}
              >
                {m.index}
              </div>
              <div>
                <div className={`text-sm font-medium ${titleColor}`}>{m.title}</div>
                <div className={`text-[10px] font-mono ${metaColor}`}>{m.meta}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
