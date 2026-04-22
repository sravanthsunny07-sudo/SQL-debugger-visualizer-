import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LearningSidebar from "../components/LearningSidebar.jsx";
import TopicViewer from "../components/TopicViewer.jsx";
import { sqlTopics } from "../data/sqlTopics.js";

export default function Learning() {
  const categories = useMemo(
    () => sqlTopics.map((entry) => entry.category).filter(Boolean),
    []
  );
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "");
  const navigate = useNavigate();

  const activeGroup = sqlTopics.find((entry) => entry.category === activeCategory) ?? sqlTopics[0];
  const topics = activeGroup?.topics ?? [];
  const [activeTopic, setActiveTopic] = useState(topics[0]?.title ?? "");

  useEffect(() => {
    if (!topics.some((topic) => topic.title === activeTopic) && topics[0]) {
      setActiveTopic(topics[0].title);
    }
  }, [activeTopic, topics]);

  function handleSelectCategory(category) {
    setActiveCategory(category);

    const nextGroup = sqlTopics.find((entry) => entry.category === category);
    setActiveTopic(nextGroup?.topics?.[0]?.title ?? "");
  }

  function handleRunTopic(query) {
    navigate("/", {
      state: {
        query,
        autoRun: true
      }
    });
  }

  return (
    <div className="min-h-screen text-ink">
      <header className="border-b border-white/10 bg-panel/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent">SQL Learning Hub</p>
            <h1 className="text-2xl font-semibold">Learn SQL by Exploring Topics</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/20 hover:text-ink"
            >
              Visualizer
            </Link>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              Learning Hub
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <LearningSidebar
          categories={categories}
          activeCategory={activeGroup?.category ?? ""}
          onSelectCategory={handleSelectCategory}
        />

        <TopicViewer
          topics={topics}
          activeTopic={activeTopic}
          onSelectTopic={setActiveTopic}
          onRunTopic={handleRunTopic}
        />
      </main>
    </div>
  );
}
