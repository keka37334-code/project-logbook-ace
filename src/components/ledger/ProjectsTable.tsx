type Status = "On Track" | "In Review" | "Pending" | "At Risk";
type Project = {
  id: string;
  name: string;
  progress: number;
  timeline: string;
  status: Status;
};

const projects: Project[] = [
  { id: "PRJ-2024-001", name: "Revitalisasi Infrastruktur TI", progress: 82, timeline: "15 Agt - 20 Des", status: "In Review" },
  { id: "PRJ-2024-008", name: "Audit Keamanan Siber Q3", progress: 45, timeline: "01 Sep - 15 Okt", status: "On Track" },
  { id: "PRJ-2024-012", name: "Migrasi Cloud Database", progress: 15, timeline: "12 Okt - 30 Nov", status: "Pending" },
  { id: "PRJ-2024-015", name: "Implementasi ERP Cabang", progress: 58, timeline: "05 Sep - 28 Nov", status: "On Track" },
  { id: "PRJ-2024-019", name: "Renovasi Kantor Pusat", progress: 33, timeline: "20 Sep - 30 Jan", status: "At Risk" },
];

const statusStyles: Record<Status, string> = {
  "On Track": "border-success-ink text-success-ink",
  "In Review": "border-warning-ink text-warning-ink",
  Pending: "border-ledger-border text-muted-foreground",
  "At Risk": "border-destructive text-destructive",
};

export function ProjectsTable() {
  return (
    <div className="bg-paper border border-ledger-border">
      <div className="p-4 border-b border-ledger-border flex justify-between items-center bg-secondary/40">
        <h2 className="text-sm font-bold uppercase tracking-widest">
          Daftar Proyek Berjalan
        </h2>
        <button className="px-3 py-1 bg-ink text-primary-foreground text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
          Ekspor Laporan
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold uppercase text-muted-foreground bg-paper border-b border-ledger-border">
              <th className="p-4 w-1/3">Identitas Proyek</th>
              <th className="p-4">Pemanfaatan Anggaran</th>
              <th className="p-4">Timeline</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {projects.map((p) => (
              <tr
                key={p.id}
                className="ledger-row border-b border-ledger-border/60 hover:bg-accent transition-colors"
              >
                <td className="p-4">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    ID: {p.id}
                  </div>
                </td>
                <td className="p-4 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-audit-blue"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono tabular-nums w-10 text-right">
                      {p.progress}%
                    </span>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {p.timeline}
                </td>
                <td className="p-4 text-right">
                  <span
                    className={`px-2 py-0.5 border text-[10px] font-bold uppercase whitespace-nowrap ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
