const matchPalette = [
  "bg-emerald-500/12",
  "bg-sky-500/12",
  "bg-amber-500/12",
  "bg-fuchsia-500/12",
  "bg-cyan-500/12"
];

function TablePreview({ title, rows, matchKey, rowHighlights }) {
  if (!rows.length) {
    return null;
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="rounded-3xl border border-white/10 bg-canvas/55 p-5 shadow-xl shadow-black/10 transition-all duration-300">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Source Table</p>
          <h3 className="mt-2 text-base font-semibold text-ink">{title}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted">
          {matchKey}
        </span>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.24em] text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column} className="border-b border-white/10 px-3 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowClassName = rowHighlights.get(row.id) ?? "";

              return (
                <tr
                  key={row.id ?? index}
                  className={`border-b border-white/5 transition-all duration-300 hover:bg-white/5 last:border-b-0 ${rowClassName}`}
                >
                  {columns.map((column) => (
                    <td key={`${row.id ?? index}-${column}`} className="px-3 py-3 text-[13px] text-ink/90">
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

function JoinedTable({ rows }) {
  if (!rows.length) {
    return null;
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-canvas/55 p-5 shadow-xl shadow-black/10 transition-all duration-300">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Join Result</p>
          <h3 className="mt-2 text-base font-semibold text-ink">Join Result</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
          {rows.length} rows
        </span>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.24em] text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column} className="border-b border-white/10 px-3 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row["users.id"] ?? "u"}-${row["orders.id"] ?? "o"}-${index}`}
                className="border-b border-white/5 transition-all duration-300 hover:bg-white/5 last:border-b-0"
              >
                {columns.map((column) => (
                  <td key={`${index}-${column}`} className="px-3 py-3 text-[13px] text-ink/90">
                    {String(row[column] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function JoinPreview({ users = [], orders = [], joined = [] }) {
  if (!users.length && !orders.length && !joined.length) {
    return null;
  }

  const matches = joined
    .filter((row) => row["users.id"] != null && row["orders.id"] != null)
    .map((row) => ({
      leftId: row["users.id"],
      rightId: row["orders.id"]
    }));
  const leftRowHighlights = new Map();
  const rightRowHighlights = new Map();

  matches.forEach((match, index) => {
    const colorClass = matchPalette[index % matchPalette.length];

    if (match.leftId != null) {
      leftRowHighlights.set(match.leftId, colorClass);
    }

    if (match.rightId != null) {
      rightRowHighlights.set(match.rightId, colorClass);
    }
  });

  return (
    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-5 shadow-2xl shadow-black/10 transition-all duration-300">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Join Preview</p>
          <h3 className="mt-2 text-base font-semibold text-ink">Matching rows between users and orders</h3>
        </div>
        <span className="rounded-full border border-emerald-400/20 px-3 py-1 text-xs text-emerald-200">
          {matches.length} matches
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <TablePreview
          title="Users Table"
          rows={users}
          matchKey="id"
          rowHighlights={leftRowHighlights}
        />
        <TablePreview
          title="Orders Table"
          rows={orders}
          matchKey="user_id"
          rowHighlights={rightRowHighlights}
        />
      </div>

      <JoinedTable rows={joined} />
    </div>
  );
}
