const team = [
  { name: "Bambang Sudjatmiko", role: "Financial Controller", seed: "p1" },
  { name: "Siti Wahyuni", role: "Lead Project Accountant", seed: "p2" },
  { name: "Aditya Pratama", role: "Compliance Officer", seed: "p3" },
];

export function TeamCard() {
  return (
    <div className="bg-paper border border-ledger-border shadow-sm">
      <div className="p-4 border-b border-ledger-border bg-secondary/40">
        <h3 className="text-[11px] font-bold uppercase tracking-widest">
          Audit Oversight Team
        </h3>
      </div>
      <div className="p-4 grid grid-cols-1 gap-4">
        {team.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <div className="size-10 bg-muted border border-ledger-border shrink-0 overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${m.seed}/100/100`}
                alt={m.name}
                className="w-full h-full object-cover grayscale"
                loading="lazy"
              />
            </div>
            <div>
              <div className="text-sm font-semibold">{m.name}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-mono">
                {m.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
