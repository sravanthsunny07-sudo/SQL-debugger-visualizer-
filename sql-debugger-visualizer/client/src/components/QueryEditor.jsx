export default function QueryEditor({
  currentDatabase,
  message,
  error,
  query,
  onQueryChange,
  onRunQuery,
  isLoading
}) {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-panel/80 p-5 shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Query Editor</p>
          <h2 className="mt-2 text-xl font-medium">Write and Execute SQL</h2>
          <p className="mt-3 text-sm text-muted">
            Current DB: <span className="font-medium text-ink">{currentDatabase}</span>
          </p>
        </div>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
          SQLite API
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">
        Run ad hoc SQL against the in-memory dataset served by the existing backend endpoint.
      </p>

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-5 flex flex-1 flex-col rounded-2xl border border-white/10 bg-canvas/80 p-4">
        <textarea
          className="min-h-[320px] flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-ink outline-none transition focus:border-accent"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Type SQL or DB command (CREATE DATABASE, USE, SHOW DATABASES)"
          spellCheck={false}
          disabled={isLoading}
        />

        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-accent/60"
          onClick={onRunQuery}
          disabled={isLoading}
        >
          {isLoading ? "Running..." : "Run Query"}
        </button>

        {isLoading ? (
          <p className="mt-3 text-center text-sm text-muted">Executing query...</p>
        ) : null}
      </div>
    </section>
  );
}
