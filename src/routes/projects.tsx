import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  loadProjects,
  newId,
  saveProjects,
  STATUSES,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";
import { ProjectFormDialog } from "@/components/ledger/ProjectFormDialog";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Manajemen Proyek — ProyekLedger" },
      {
        name: "description",
        content: "Buat, ubah, dan kelola daftar proyek: deskripsi, PIC, tanggal, dan status progres.",
      },
      { property: "og:title", content: "Manajemen Proyek — ProyekLedger" },
      {
        property: "og:description",
        content: "Modul lengkap untuk mengelola portofolio proyek dengan progres dan status.",
      },
    ],
  }),
  component: ProjectsPage,
});

const statusStyles: Record<ProjectStatus, string> = {
  Planning: "border-ledger-border text-muted-foreground",
  "On Track": "border-success-ink text-success-ink",
  "In Review": "border-warning-ink text-warning-ink",
  "At Risk": "border-destructive text-destructive",
  Completed: "border-audit-blue text-audit-blue",
};

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.pic.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [projects, query, statusFilter]);

  const persist = (next: Project[]) => {
    setProjects(next);
    saveProjects(next);
  };

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (p: Project) => {
    setEditing(p);
    setDialogOpen(true);
  };

  const handleSubmit = (v: {
    name: string;
    description?: string;
    pic: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    status: ProjectStatus;
  }) => {
    if (editing) {
      const updated: Project = {
        ...editing,
        name: v.name,
        description: v.description ?? "",
        pic: v.pic,
        startDate: v.startDate.toISOString().slice(0, 10),
        endDate: v.endDate.toISOString().slice(0, 10),
        progress: v.progress,
        status: v.status,
      };
      persist(projects.map((p) => (p.id === editing.id ? updated : p)));
      toast.success("Proyek diperbarui");
    } else {
      const created: Project = {
        id: newId(),
        name: v.name,
        description: v.description ?? "",
        pic: v.pic,
        startDate: v.startDate.toISOString().slice(0, 10),
        endDate: v.endDate.toISOString().slice(0, 10),
        progress: v.progress,
        status: v.status,
        createdAt: new Date().toISOString(),
      };
      persist([created, ...projects]);
      toast.success("Proyek ditambahkan");
    }
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    persist(projects.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    toast.success("Proyek dihapus");
  };

  return (
    <div className="min-h-dvh bg-background text-foreground p-6 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-ledger-border pb-6">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground transition-colors">
              ← Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span>Manajemen Proyek</span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight">Daftar Proyek</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buat, ubah, dan kelola seluruh proyek beserta progresnya.
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-ink text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-1" />
          Proyek Baru
        </Button>
      </header>

      <main className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Cari nama, PIC, atau ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="md:max-w-sm bg-paper"
            maxLength={120}
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="md:w-56 bg-paper">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-paper border border-ledger-border">
          <div className="p-4 border-b border-ledger-border bg-secondary/40 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Registrasi Proyek
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {filtered.length} entri
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase text-muted-foreground bg-paper border-b border-ledger-border">
                  <th className="p-4">Proyek</th>
                  <th className="p-4">PIC</th>
                  <th className="p-4">Periode</th>
                  <th className="p-4 min-w-[180px]">Progres</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-muted-foreground">
                      Belum ada proyek. Klik <span className="font-semibold">Proyek Baru</span> untuk menambah.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="ledger-row border-b border-ledger-border/60 hover:bg-accent transition-colors align-top"
                    >
                      <td className="p-4">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">ID: {p.id}</div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-md line-clamp-2">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">{p.pic}</td>
                      <td className="p-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(p.startDate), "dd MMM yyyy")}
                        <br />
                        {format(new Date(p.endDate), "dd MMM yyyy")}
                      </td>
                      <td className="p-4">
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
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 border text-[10px] font-bold uppercase whitespace-nowrap ${statusStyles[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(p)}
                          aria-label="Ubah"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(p.id)}
                          aria-label="Hapus"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus proyek?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data proyek akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}
