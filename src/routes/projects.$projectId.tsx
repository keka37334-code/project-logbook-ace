import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { ArrowLeft, CalendarDays, History, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  formatIDR,
  loadProjects,
  saveProjects,
  STATUSES,
  type ProgressEntry,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";
import { ProjectFormDialog } from "@/components/ledger/ProjectFormDialog";

export const Route = createFileRoute("/projects/$projectId")({
  head: ({ params }) => ({
    meta: [
      { title: `Proyek ${params.projectId} — ProyekLedger` },
      {
        name: "description",
        content: "Detail proyek: ringkasan, timeline, dan histori perubahan progres.",
      },
      { property: "og:title", content: `Proyek ${params.projectId} — ProyekLedger` },
      {
        property: "og:description",
        content: "Lihat ringkasan, timeline pelaksanaan, dan jejak perubahan progres proyek.",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-dvh flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-medium">Proyek tidak ditemukan</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          ID yang Anda akses tidak ada di daftar.
        </p>
        <Button asChild>
          <Link to="/projects">Kembali ke daftar</Link>
        </Button>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-dvh flex items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-medium">Terjadi kesalahan</h1>
          <p className="text-muted-foreground mt-2 mb-6">{error.message}</p>
          <Button onClick={() => { router.invalidate(); reset(); }}>Coba lagi</Button>
        </div>
      </div>
    );
  },
  component: ProjectDetail,
});

const statusStyles: Record<ProjectStatus, string> = {
  Planning: "border-ledger-border text-muted-foreground",
  "On Track": "border-success-ink text-success-ink",
  "In Review": "border-warning-ink text-warning-ink",
  "At Risk": "border-destructive text-destructive",
  Completed: "border-audit-blue text-audit-blue",
};

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setHydrated(true);
  }, []);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId],
  );

  if (hydrated && !project) {
    throw notFound();
  }
  if (!project) return null;

  const persist = (next: Project[]) => {
    setProjects(next);
    saveProjects(next);
  };

  const updateProject = (updater: (p: Project) => Project) => {
    persist(projects.map((p) => (p.id === project.id ? updater(p) : p)));
  };

  const totalDays = Math.max(
    differenceInCalendarDays(new Date(project.endDate), new Date(project.startDate)),
    1,
  );
  const elapsed = Math.max(
    Math.min(
      differenceInCalendarDays(new Date(), new Date(project.startDate)),
      totalDays,
    ),
    0,
  );
  const timeProgress = (elapsed / totalDays) * 100;
  const used = project.budget > 0 ? Math.min((project.spent / project.budget) * 100, 100) : 0;
  const over = project.spent > project.budget;
  const sortedHistory = [...project.history].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <div className="min-h-dvh bg-background text-foreground p-6 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 border-b border-ledger-border pb-6">
        <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-foreground transition-colors">Proyek</Link>
          <span>/</span>
          <span className="font-mono">{project.id}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-1" /> Daftar
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4 mr-1" /> Ubah
            </Button>
            <Button onClick={() => setUpdateOpen(true)} className="bg-ink text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-1" /> Update Progres
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-12 gap-6 md:gap-8">
        {/* Summary */}
        <section className="col-span-12 grid grid-cols-2 md:grid-cols-4 border border-ledger-border bg-paper">
          <SummaryCell label="Status">
            <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${statusStyles[project.status]}`}>
              {project.status}
            </span>
          </SummaryCell>
          <SummaryCell label="PIC">
            <span className="text-sm font-medium">{project.pic}</span>
          </SummaryCell>
          <SummaryCell label="Progres">
            <span className="text-xl font-mono tabular-nums">{project.progress}%</span>
          </SummaryCell>
          <SummaryCell label="Pemakaian Anggaran">
            <span className={`text-xl font-mono tabular-nums ${over ? "text-destructive" : "text-audit-blue"}`}>
              {used.toFixed(1)}%
            </span>
          </SummaryCell>
        </section>

        {/* Left: Progress + Budget */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
          <Card title="Realisasi Anggaran">
            <div className="flex items-baseline justify-between mb-2 font-mono">
              <span className="text-sm">{formatIDR(project.spent)}</span>
              <span className="text-xs text-muted-foreground">dari {formatIDR(project.budget)}</span>
            </div>
            <div className="h-2 bg-muted relative">
              <div
                className={`absolute inset-y-0 left-0 ${over ? "bg-destructive" : "bg-audit-blue"}`}
                style={{ width: `${used}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
              <Stat label="Anggaran" value={formatIDR(project.budget)} />
              <Stat label="Realisasi" value={formatIDR(project.spent)} tone={over ? "danger" : "blue"} />
              <Stat
                label="Sisa"
                value={formatIDR(Math.max(project.budget - project.spent, 0))}
                tone="success"
              />
            </div>
          </Card>

          <Card title="Timeline">
            <div className="flex items-center gap-3 text-sm font-mono">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span>{format(new Date(project.startDate), "dd MMM yyyy")}</span>
              <span className="text-muted-foreground">→</span>
              <span>{format(new Date(project.endDate), "dd MMM yyyy")}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {totalDays} hari · {elapsed} hari berjalan
              </span>
            </div>
            <div className="mt-4 h-2 bg-muted relative">
              <div
                className="absolute inset-y-0 left-0 bg-foreground/70"
                style={{ width: `${timeProgress}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 border-r-2 border-audit-blue"
                style={{ width: `${project.progress}%` }}
                title={`Progres ${project.progress}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground mt-2">
              <span>Waktu: {timeProgress.toFixed(0)}%</span>
              <span>Progres: {project.progress}%</span>
            </div>
          </Card>

          <Card
            title={
              <span className="flex items-center gap-2">
                <History className="w-4 h-4" /> Histori Perubahan Progres
              </span>
            }
          >
            {sortedHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada riwayat. Klik <span className="font-semibold">Update Progres</span> untuk mencatat perubahan.
              </p>
            ) : (
              <ol className="relative pl-6 border-l border-ledger-border space-y-6">
                {sortedHistory.map((h, i) => {
                  const prev = sortedHistory[i + 1];
                  const delta = prev ? h.progress - prev.progress : h.progress;
                  return (
                    <li key={`${h.at}-${i}`} className="relative">
                      <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-audit-blue ring-4 ring-background" />
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {format(new Date(h.at), "dd MMM yyyy HH:mm")}
                        </span>
                        <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${statusStyles[h.status]}`}>
                          {h.status}
                        </span>
                        <span className="text-sm font-mono tabular-nums">
                          {h.progress}%{" "}
                          {prev && (
                            <span className={delta > 0 ? "text-success-ink" : delta < 0 ? "text-destructive" : "text-muted-foreground"}>
                              ({delta > 0 ? "+" : ""}{delta})
                            </span>
                          )}
                        </span>
                      </div>
                      {h.note && <p className="text-sm text-muted-foreground mt-1">{h.note}</p>}
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </section>

        {/* Right: Meta */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <Card title="Identitas">
            <dl className="text-sm space-y-3">
              <Row k="ID Proyek" v={<span className="font-mono">{project.id}</span>} />
              <Row k="PIC" v={project.pic} />
              <Row k="Status" v={project.status} />
              <Row
                k="Arsip"
                v={project.archived ? "Diarsipkan" : "Aktif"}
              />
              <Row
                k="Dibuat"
                v={<span className="font-mono text-xs">{format(new Date(project.createdAt), "dd MMM yyyy")}</span>}
              />
            </dl>
          </Card>
        </aside>
      </main>

      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={project}
        onSubmit={(v) => {
          const now = new Date().toISOString();
          updateProject((p) => {
            const changed = p.progress !== v.progress || p.status !== v.status;
            return {
              ...p,
              name: v.name,
              description: v.description ?? "",
              pic: v.pic,
              startDate: v.startDate.toISOString().slice(0, 10),
              endDate: v.endDate.toISOString().slice(0, 10),
              progress: v.progress,
              status: v.status,
              budget: v.budget,
              spent: v.spent,
              history: changed
                ? [...p.history, { at: now, progress: v.progress, status: v.status, note: "Pembaruan dari form edit." }]
                : p.history,
            };
          });
          toast.success("Proyek diperbarui");
        }}
      />

      <UpdateProgressDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        current={{ progress: project.progress, status: project.status }}
        onSubmit={(entry) => {
          updateProject((p) => ({
            ...p,
            progress: entry.progress,
            status: entry.status,
            history: [...p.history, entry],
          }));
          toast.success("Progres tercatat");
        }}
      />

      <Toaster />
    </div>
  );
}

function SummaryCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-5 border-b md:border-b-0 md:border-r last:border-r-0 border-ledger-border [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-paper border border-ledger-border">
      <div className="p-4 border-b border-ledger-border bg-secondary/40">
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "blue" | "success" | "danger";
}) {
  const color =
    tone === "blue"
      ? "text-audit-blue"
      : tone === "success"
        ? "text-success-ink"
        : tone === "danger"
          ? "text-destructive"
          : "";
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </div>
      <div className={`font-mono tabular-nums text-sm ${color}`}>{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ledger-border/60 pb-2 last:border-b-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function UpdateProgressDialog({
  open,
  onOpenChange,
  current,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  current: { progress: number; status: ProjectStatus };
  onSubmit: (e: ProgressEntry) => void;
}) {
  const [progress, setProgress] = useState(current.progress);
  const [status, setStatus] = useState<ProjectStatus>(current.status);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProgress(current.progress);
      setStatus(current.status);
      setNote("");
      setError(null);
    }
  }, [open, current]);

  const submit = () => {
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      setError("Progres harus antara 0 dan 100");
      return;
    }
    if (note.length > 500) {
      setError("Catatan maksimal 500 karakter");
      return;
    }
    onSubmit({
      at: new Date().toISOString(),
      progress: Math.round(progress),
      status,
      note: note.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest text-sm">
            Update Progres
          </DialogTitle>
          <DialogDescription>
            Catat perubahan progres dan status untuk membentuk histori proyek.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Progres (%)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Catatan</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Misal: Modul autentikasi selesai, mulai integrasi pembayaran."
              className="mt-1"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
