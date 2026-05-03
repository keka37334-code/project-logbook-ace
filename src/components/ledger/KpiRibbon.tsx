type Kpi = { label: string; value: string; tone?: "default" | "blue" };

const items: Kpi[] = [
  { label: "Total Alokasi Anggaran", value: "Rp 1.482.000.000" },
  { label: "Realisasi Biaya", value: "Rp 892.450.000", tone: "blue" },
  { label: "Progres Rata-rata", value: "64.8%" },
  { label: "Proyek Aktif", value: "12" },
];

export function KpiRibbon() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 border border-ledger-border bg-paper shadow-sm">
      {items.map((k, i) => (
        <div
          key={k.label}
          className={`p-6 ${i < items.length - 1 ? "md:border-r border-ledger-border" : ""} ${i % 2 === 0 ? "border-r md:border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}
        >
          <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
            {k.label}
          </div>
          <div
            className={`text-2xl font-mono tabular-nums ${k.tone === "blue" ? "text-audit-blue" : ""}`}
          >
            {k.value}
          </div>
        </div>
      ))}
    </section>
  );
}
