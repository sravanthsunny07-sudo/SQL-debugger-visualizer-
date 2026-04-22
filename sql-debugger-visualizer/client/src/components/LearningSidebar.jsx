export default function LearningSidebar({
  categories,
  activeCategory,
  onSelectCategory
}) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-panel/80 p-5 shadow-2xl shadow-black/20">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Learning Hub</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">Browse SQL Topics</h2>
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                isActive
                  ? "border-accent/40 bg-accent/10 text-ink shadow-lg shadow-amber-500/10"
                  : "border-white/10 bg-canvas/35 text-muted hover:border-white/20 hover:bg-white/5 hover:text-ink"
              }`}
            >
              <div className="text-sm font-medium">{category}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
