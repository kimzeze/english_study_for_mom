export function BigDate({ date }: { date: Date | string }) {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return (
    <div className="space-y-1">
      <div className="text-[18px] font-medium tabular-nums text-ink-muted">
        {year}
      </div>
      <div className="text-big-date tabular-nums text-ink">
        {month}.{day}
      </div>
    </div>
  );
}
