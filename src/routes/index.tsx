import { createFileRoute } from "@tanstack/react-router";
import { KpiRibbon } from "@/components/ledger/KpiRibbon";
import { ProjectsTable } from "@/components/ledger/ProjectsTable";
import { MilestonesCard } from "@/components/ledger/MilestonesCard";
import { TeamCard } from "@/components/ledger/TeamCard";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-dvh bg-background text-foreground p-6 md:p-8 pb-32">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-ledger-border pb-6">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            Sistem Manajemen Proyek v4.2
          </div>
          <h1 className="text-3xl font-medium tracking-tight">
            PT. Artha Citra Nusantara
          </h1>
        </div>
        <div className="flex gap-8 md:text-right">
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground/70">
              Periode Fiskal
            </div>
            <div className="text-sm font-mono">Q3 — 2024</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-muted-foreground/70">
              Status Audit
            </div>
            <div className="text-sm font-mono text-success-ink">VERIFIED</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12">
          <KpiRibbon />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <ProjectsTable />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6 md:space-y-8">
          <MilestonesCard />
          <TeamCard />
        </div>
      </main>

      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-7xl w-full px-4 md:px-8 z-10">
        <div className="bg-ink text-primary-foreground p-3 md:p-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center shadow-xl">
          <div className="flex flex-wrap gap-3 md:gap-6 items-center">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-success-ink rounded-full animate-pulse" />
              <span className="text-[10px] font-mono tracking-tighter uppercase">
                System Live: Central Database Connection Established
              </span>
            </div>
            <div className="hidden md:block h-4 w-px bg-primary-foreground/20" />
            <div className="text-[10px] font-mono text-primary-foreground/60">
              LAST RECONCILIATION: 12 OCT 2024 14:22:10
            </div>
          </div>
          <div className="flex gap-2 md:gap-4">
            <button className="px-3 md:px-4 py-1.5 border border-primary-foreground/20 hover:bg-primary-foreground/10 text-[11px] font-bold uppercase transition-colors">
              View Ledger
            </button>
            <button className="px-3 md:px-4 py-1.5 bg-audit-blue hover:opacity-90 text-[11px] font-bold uppercase transition-opacity">
              New Entry
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
