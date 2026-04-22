export default function TopicViewer({ topics, activeTopic, onSelectTopic, onRunTopic }) {
  if (!topics.length) {
    return (
      <section className="rounded-3xl border border-dashed border-white/10 bg-panel/70 p-8 text-center text-muted">
        No topics are available for this category yet.
      </section>
    );
  }

  const topic = topics.find((item) => item.title === activeTopic) ?? topics[0];

  return (
    <section className="rounded-3xl border border-white/10 bg-panel/80 p-6 shadow-2xl shadow-black/20">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-canvas/40 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Topics</p>
          <div className="mt-4 space-y-2">
            {topics.map((item) => {
              const isActive = item.title === topic.title;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onSelectTopic(item.title)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                    isActive
                      ? "border-emerald-400/30 bg-emerald-500/10 text-ink shadow-lg shadow-emerald-500/10"
                      : "border-white/10 bg-slate-950/20 text-muted hover:border-white/20 hover:bg-white/5 hover:text-ink"
                  }`}
                >
                  <div className="text-sm font-medium">{item.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-canvas/45 p-6">
          {!topic ? (
            <div className="flex min-h-[320px] items-center justify-center text-center text-muted">
              Select a topic to explore its explanation and example query.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent">Selected Topic</p>
                <h3 className="mt-2 text-2xl font-semibold text-ink">{topic.title}</h3>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{topic.description}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-inner shadow-black/20">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Example Query</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                    SQL
                  </span>
                </div>
                <pre className="overflow-x-auto text-sm leading-7 text-ink">
                  <code>{topic.query}</code>
                </pre>
              </div>

              <button
                type="button"
                onClick={() => onRunTopic(topic.query)}
                className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                Run in Visualizer
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
