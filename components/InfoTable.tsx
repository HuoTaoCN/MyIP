interface Row {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

export default function InfoTable({ rows, title }: { rows: Row[]; title?: string }) {
  return (
    <div className="surface-2 rounded-xl overflow-hidden border border-themed">
      {title && (
        <div className="px-4 py-2.5 border-b border-themed">
          <h4 className="font-semibold text-fg text-sm">{title}</h4>
        </div>
      )}
      <div className="divide-y divide-[var(--border)]">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start px-4 py-2.5 gap-4">
            <span className="text-sm text-muted w-36 shrink-0 pt-0.5">{row.label}</span>
            <span
              className={`text-sm font-medium break-all ${
                row.highlight ? "text-[var(--accent)]" : "text-fg"
              }`}
            >
              {row.value ?? <span className="text-muted font-normal">—</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
