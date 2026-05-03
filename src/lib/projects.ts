import { z } from "zod";

export const STATUSES = ["Planning", "On Track", "In Review", "At Risk", "Completed"] as const;
export type ProjectStatus = (typeof STATUSES)[number];

export const projectSchema = z
  .object({
    id: z.string(),
    name: z.string().trim().min(1, "Nama proyek wajib diisi").max(120),
    description: z.string().trim().max(1000).optional().default(""),
    pic: z.string().trim().min(1, "PIC wajib diisi").max(80),
    startDate: z.string().min(1, "Tanggal mulai wajib"),
    endDate: z.string().min(1, "Tanggal selesai wajib"),
    progress: z.number().int().min(0).max(100),
    status: z.enum(STATUSES),
    budget: z.number().nonnegative().default(0),
    spent: z.number().nonnegative().default(0),
    archived: z.boolean().default(false),
    createdAt: z.string(),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endDate"],
  });

export type Project = z.infer<typeof projectSchema>;

export const projectFormSchema = z
  .object({
    name: z.string().trim().min(1, "Nama proyek wajib diisi").max(120, "Maks 120 karakter"),
    description: z.string().trim().max(1000, "Maks 1000 karakter").optional(),
    pic: z.string().trim().min(1, "PIC wajib diisi").max(80, "Maks 80 karakter"),
    startDate: z.date({ required_error: "Pilih tanggal mulai" }),
    endDate: z.date({ required_error: "Pilih tanggal selesai" }),
    progress: z.coerce.number().int().min(0, "Min 0").max(100, "Maks 100"),
    status: z.enum(STATUSES),
    budget: z.coerce.number().nonnegative("Anggaran tidak boleh negatif").max(1e15, "Nilai terlalu besar"),
    spent: z.coerce.number().nonnegative("Realisasi tidak boleh negatif").max(1e15, "Nilai terlalu besar"),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endDate"],
  })
  .refine((d) => d.spent <= d.budget, {
    message: "Realisasi tidak boleh melebihi anggaran",
    path: ["spent"],
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

const STORAGE_KEY = "proyek-ledger:projects:v2";

function seed(): Project[] {
  const now = new Date().toISOString();
  return [
    {
      id: "PRJ-2024-001",
      name: "Revitalisasi Infrastruktur TI",
      description: "Peremajaan server, jaringan, dan endpoint kantor pusat.",
      pic: "Bambang Sudjatmiko",
      startDate: "2024-08-15",
      endDate: "2024-12-20",
      progress: 82,
      status: "In Review",
      budget: 750_000_000,
      spent: 615_000_000,
      archived: false,
      createdAt: now,
    },
    {
      id: "PRJ-2024-008",
      name: "Audit Keamanan Siber Q3",
      description: "Penetration test dan review kebijakan keamanan.",
      pic: "Siti Wahyuni",
      startDate: "2024-09-01",
      endDate: "2024-10-15",
      progress: 45,
      status: "On Track",
      budget: 220_000_000,
      spent: 99_000_000,
      archived: false,
      createdAt: now,
    },
    {
      id: "PRJ-2024-012",
      name: "Migrasi Cloud Database",
      description: "Migrasi DB on-prem ke cloud dengan zero downtime.",
      pic: "Aditya Pratama",
      startDate: "2024-10-12",
      endDate: "2024-11-30",
      progress: 15,
      status: "Planning",
      budget: 512_000_000,
      spent: 76_800_000,
      archived: false,
      createdAt: now,
    },
  ];
}

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => projectSchema.safeParse(p))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: Project }).data);
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function newId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `PRJ-${new Date().getFullYear()}-${n}`;
}

export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
