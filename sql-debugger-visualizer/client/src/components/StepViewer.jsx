function buildExplanation(stepName, description) {
  if (stepName === "FROM") {
    const match = description.match(/Load table\s+(.+)$/i);
    const tableName = match?.[1]?.trim();

    return tableName
      ? `Loading all rows from the ${tableName} table`
      : "Loading all rows from the table";
  }

  if (stepName === "WHERE") {
    const match = description.match(/where\s+(.+)$/i);
    const condition = match?.[1]?.trim();

    return condition
      ? `Filtering rows where ${condition}`
      : "Filtering rows based on condition";
  }

  if (stepName === "SELECT") {
    return "Returning final selected data";
  }

  if (stepName === "LOAD_USERS" || stepName === "LOAD_ORDERS") {
    return "Loading all rows from the table before the join begins";
  }

  if (stepName === "JOIN") {
    const match = description.match(/Matching\s+(.+)\s+with\s+(.+)$/i);

    if (match) {
      return `Matching rows from both tables using ${match[1]} and ${match[2]}`;
    }

    return "Matching rows from both tables";
  }

  return "Inspecting this execution step.";
}

function isJoinStep(label) {
  return label === "JOIN";
}

function StepButton({ label, description, explanation, isActive, onClick }) {
  const joinStep = isJoinStep(label);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[180px] rounded-3xl border px-4 py-4 text-left transition-all duration-300 ${
        isActive
          ? joinStep
            ? "border-emerald-400/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
            : "border-accent/50 bg-accent/15 shadow-lg shadow-amber-500/10"
          : joinStep
            ? "border-emerald-400/20 bg-emerald-500/5 hover:border-emerald-300/40 hover:bg-emerald-500/10"
            : "border-white/10 bg-canvas/40 hover:border-white/20 hover:bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className={`text-xs uppercase tracking-[0.3em] ${joinStep ? "text-emerald-300" : "text-accent"}`}>
          {label}
        </div>
        {joinStep ? (
          <span className="rounded-full border border-emerald-400/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
            Match
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-sm leading-6 text-ink/90">{description}</div>
      <div className="mt-2 text-xs leading-5 text-slate-400">{explanation}</div>
    </button>
  );
}

export default function StepViewer({ steps, activeStepKey, onSelectStep }) {
  if (!steps.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-canvas/40 px-4 py-5 text-sm text-muted">
        Execution steps will appear here after the backend returns a stepped response.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-full gap-4 transition-all duration-300">
        <StepButton
          label="FINAL"
          description="Show the final query result."
          explanation="Returning final selected data"
          isActive={activeStepKey === "final"}
          onClick={() => onSelectStep("final")}
        />

        {steps.map((step, index) => (
          <StepButton
            key={`${step.name}-${index}`}
            label={step.name}
            description={step.description}
            explanation={buildExplanation(step.name, step.description)}
            isActive={activeStepKey === index}
            onClick={() => onSelectStep(index)}
          />
        ))}
      </div>
    </div>
  );
}
