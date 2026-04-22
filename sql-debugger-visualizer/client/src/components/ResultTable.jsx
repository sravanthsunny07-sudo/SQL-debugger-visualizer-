function EmptyState({ message }) {
  return (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-canvas/50 px-6 text-center text-sm text-muted shadow-xl shadow-black/10 transition-all duration-300">
      {message}
    </div>
  );
}

function getRowIdentity(row, index) {
  if (row.id != null) {
    return String(row.id);
  }

  if (row["users.id"] != null && row["orders.id"] != null) {
    return `join-${row["users.id"]}-${row["orders.id"]}`;
  }

  if (row["users.id"] != null) {
    return `users-${row["users.id"]}`;
  }

  if (row["orders.id"] != null) {
    return `orders-${row["orders.id"]}`;
  }

  return `row-${index}`;
}

function getRowClassName(highlightType) {
  if (highlightType === "added") {
    return "bg-emerald-500/10 transition-colors duration-300";
  }

  if (highlightType === "removed") {
    return "bg-rose-500/10 transition-colors duration-300";
  }

  return "transition-colors duration-300";
}

export default function ResultTable({ rows, highlightedRows = {}, isLoading, error }) {
  if (isLoading) {
    return <EmptyState message="Executing query and loading rows..." />;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200 shadow-xl shadow-black/10">
        {error}
      </div>
    );
  }

  if (!rows.length) {
    return <EmptyState message="Run a query to inspect rows from the backend." />;
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-canvas/60 shadow-2xl shadow-black/10 transition-all duration-300">
      <div className="max-h-[520px] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-slate-950/90 text-xs uppercase tracking-[0.28em] text-muted backdrop-blur">
            <tr>
              {columns.map((column) => (
                <th key={column} className="border-b border-white/10 px-4 py-4 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowIdentity = getRowIdentity(row, index);

              return (
                <tr
                  key={rowIdentity}
                  className={`border-b border-white/5 transition-all duration-300 hover:bg-white/5 last:border-b-0 ${getRowClassName(
                    highlightedRows[rowIdentity]
                  )}`}
                >
                {columns.map((column) => (
                  <td
                    key={`${rowIdentity}-${column}`}
                    className={`px-4 py-4 text-[13px] text-ink/90 transition-opacity duration-300 ${
                      highlightedRows[rowIdentity] === "removed" ? "opacity-70" : "opacity-100"
                    }`}
                  >
                    {String(row[column] ?? "")}
                  </td>
                ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
