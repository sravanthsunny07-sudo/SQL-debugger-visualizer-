import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import QueryEditor from "../components/QueryEditor.jsx";
import JoinPreview from "../components/JoinPreview.jsx";
import ResultTable from "../components/ResultTable.jsx";
import StepViewer from "../components/StepViewer.jsx";

const defaultQuery = "SELECT * FROM users;";

function parseDatabaseCommand(query) {
  const normalizedQuery = query.trim().replace(/;$/, "");

  if (/^CREATE\s+DATABASE\s+/i.test(normalizedQuery)) {
    return "CREATE_DATABASE";
  }

  if (/^USE\s+/i.test(normalizedQuery)) {
    return "USE_DATABASE";
  }

  if (/^SHOW\s+DATABASES$/i.test(normalizedQuery)) {
    return "SHOW_DATABASES";
  }

  return null;
}

function extractDatabaseName(message) {
  const match = message?.match(/'([^']+)'/);
  return match?.[1] ?? null;
}

function getPreferredStepKey(query, steps) {
  const normalizedQuery = query.trim().toUpperCase();

  if (normalizedQuery.includes("INNER JOIN")) {
    const joinIndex = steps.findIndex((step) => step.name === "JOIN");
    return joinIndex >= 0 ? joinIndex : "final";
  }

  if (normalizedQuery.includes(" WHERE ")) {
    const whereIndex = steps.findIndex((step) => step.name === "WHERE");
    return whereIndex >= 0 ? whereIndex : "final";
  }

  return "final";
}

function getRowIdentity(row, index) {
  if (row?.id != null) {
    return String(row.id);
  }

  if (row?.["users.id"] != null && row?.["orders.id"] != null) {
    return `join-${row["users.id"]}-${row["orders.id"]}`;
  }

  if (row?.["users.id"] != null) {
    return `users-${row["users.id"]}`;
  }

  if (row?.["orders.id"] != null) {
    return `orders-${row["orders.id"]}`;
  }

  return `row-${index}`;
}

function getRowsForStep(steps, rows, stepKey) {
  if (typeof stepKey === "number" && stepKey >= 0) {
    return Array.isArray(steps[stepKey]?.data) ? steps[stepKey].data : [];
  }

  return rows;
}

function getPreviousStepKey(stepKey, steps) {
  if (typeof stepKey === "number") {
    return stepKey > 0 ? stepKey - 1 : null;
  }

  return steps.length ? steps.length - 1 : null;
}

function buildHighlightedRows(previousRows, currentRows) {
  const previousMap = new Map(
    previousRows
      .filter((row) => row)
      .map((row, index) => [getRowIdentity(row, index), row])
  );
  const currentMap = new Map(
    currentRows
      .filter((row) => row)
      .map((row, index) => [getRowIdentity(row, index), row])
  );
  const highlightedRows = {};
  const removedRows = [];

  for (const [identity] of currentMap) {
    if (!previousMap.has(identity)) {
      highlightedRows[identity] = "added";
    }
  }

  for (const [identity, row] of previousMap) {
    if (!currentMap.has(identity)) {
      highlightedRows[identity] = "removed";
      removedRows.push(row);
    }
  }

  return {
    highlightedRows,
    removedRows
  };
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const handledNavigationKeyRef = useRef(null);
  const resultsRef = useRef(null);
  const [query, setQuery] = useState(defaultQuery);
  const [rows, setRows] = useState([]);
  const [steps, setSteps] = useState([]);
  const [activeStepKey, setActiveStepKey] = useState("final");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentDatabase, setCurrentDatabase] = useState("default");
  const [isLoading, setIsLoading] = useState(false);

  const selectedRows = getRowsForStep(steps, rows, activeStepKey);
  const selectedStep =
    typeof activeStepKey === "number" && activeStepKey >= 0 ? steps[activeStepKey] : null;
  const isJoinStep = selectedStep?.name === "JOIN";
  const usersStep = steps.find((step) => step.name === "LOAD_USERS");
  const ordersStep = steps.find((step) => step.name === "LOAD_ORDERS");
  const previousStepKey = getPreviousStepKey(activeStepKey, steps);
  const previousRows = previousStepKey == null ? [] : getRowsForStep(steps, rows, previousStepKey);
  const { highlightedRows, removedRows } = buildHighlightedRows(previousRows, selectedRows);
  const displayedRows = [...selectedRows, ...removedRows];

  function scrollToResults() {
    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  async function runQuery(nextQuery = query, options = {}) {
    const commandType = parseDatabaseCommand(nextQuery);
    const { autoHighlight = false } = options;
    setIsLoading(true);
    setError("");
    setMessage("");
    setActiveStepKey("final");

    try {
      const response = await fetch("http://localhost:4013/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: nextQuery })
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to execute the SQL query.");
      }

      if (payload.message) {
        setMessage(payload.message);
      }

      if (commandType) {
        setRows([]);
        setSteps([]);
      } else {
        const nextRows = Array.isArray(payload.data) ? payload.data : [];
        const nextSteps = Array.isArray(payload.steps) ? payload.steps : [];

        setRows(nextRows);
        setSteps(nextSteps);
        setActiveStepKey(autoHighlight ? getPreferredStepKey(nextQuery, nextSteps) : "final");
      }

      if (commandType === "USE_DATABASE" && payload.message) {
        setCurrentDatabase(extractDatabaseName(payload.message) ?? currentDatabase);
      }
    } catch (requestError) {
      setRows([]);
      setSteps([]);
      setMessage("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to execute the SQL query."
      );
      setActiveStepKey("final");
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => {
        scrollToResults();
      });
    }
  }

  async function handleRunQuery() {
    await runQuery(query);
  }

  useEffect(() => {
    if (!location.state?.query || handledNavigationKeyRef.current === location.key) {
      return;
    }

    handledNavigationKeyRef.current = location.key;
    setQuery(location.state.query);

    if (location.state.autoRun) {
      void runQuery(location.state.query, { autoHighlight: true });
    }

    navigate(location.pathname, {
      replace: true,
      state: null
    });
  }, [location.key, location.pathname, location.state, navigate]);

  return (
    <div className="min-h-screen text-ink">
      <header className="border-b border-white/10 bg-panel/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Query Workspace</p>
            <h1 className="text-2xl font-semibold">SQL Debugger Visualizer</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/learning"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/20 hover:text-ink"
            >
              Learning Hub
            </Link>
            <div className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm text-accent">
              Frontend Connected
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl gap-6 px-6 py-8 lg:grid-cols-2">
        <QueryEditor
          currentDatabase={currentDatabase}
          message={message}
          error={error}
          query={query}
          onQueryChange={setQuery}
          onRunQuery={handleRunQuery}
          isLoading={isLoading}
        />

        <section
          ref={resultsRef}
          className="flex h-full flex-col rounded-3xl border border-white/10 bg-panel/80 p-5 shadow-2xl shadow-black/20"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Results</p>
              <h2 className="mt-2 text-xl font-medium">Query Output</h2>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
              {isLoading
                ? "Loading"
                : `${selectedRows.length} row${selectedRows.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted">
            Results render dynamically from the backend response, including SQL errors and
            loading state.
          </p>

          <div className="mt-5">
            <StepViewer
              steps={steps}
              activeStepKey={activeStepKey}
              onSelectStep={setActiveStepKey}
            />
          </div>

          <div className="mt-5 flex-1">
            {isJoinStep ? (
              <div>
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-canvas/40 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Join Result</p>
                  <p className="mt-1 text-sm text-muted">
                    Matching rows between users and orders
                  </p>
                </div>
                </div>
                <JoinPreview
                  users={usersStep?.data || []}
                  orders={ordersStep?.data || []}
                  joined={selectedStep?.data || []}
                />
              </div>
            ) : (
              <ResultTable
                rows={displayedRows}
                highlightedRows={highlightedRows}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
