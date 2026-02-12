import { useState } from "react";
import { createEventProcessor } from "../eventProcessor";

const SCENARIOS = {
  basic: [
    { id: "a", timestamp: 100, type: "created" },
    { id: "b", timestamp: 200, type: "created" },
    { id: "a", timestamp: 150, type: "updated" },
  ],
  lateCreateAfterDelete: [
    { id: "x", timestamp: 100, type: "created" },
    { id: "x", timestamp: 200, type: "deleted" },
    { id: "x", timestamp: 50, type: "created" },
  ],
  duplicateEvents: [
    { id: "d", timestamp: 100, type: "created" },
    { id: "d", timestamp: 100, type: "created" },
    { id: "d", timestamp: 150, type: "updated" },
    { id: "d", timestamp: 150, type: "updated" },
  ],
  outOfOrder: [
    { id: "y", timestamp: 300, type: "updated" },
    { id: "y", timestamp: 100, type: "created" },
    { id: "z", timestamp: 250, type: "created" },
    { id: "y", timestamp: 200, type: "deleted" },
    { id: "y", timestamp: 50, type: "created" },
  ],
  deleteBeforeCreate: [
    { id: "w", timestamp: 200, type: "deleted" },
    { id: "w", timestamp: 100, type: "created" },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }
  return a;
}

const LABELS = {
  basic: "Basic",
  lateCreateAfterDelete: "Late create after delete",
  duplicateEvents: "Duplicate events",
  outOfOrder: "Out of order",
  deleteBeforeCreate: "Delete before create",
};

export default function EventProcessorDemo() {
  const [processor] = useState(() => createEventProcessor());
  const [events, setEvents] = useState([]);
  const [activeItems, setActiveItems] = useState([]);
  const [streaming, setStreaming] = useState(false);

  function handleEvent(event) {
    processor.addEvent(event);
    setEvents((prev) => [...prev, event]);
    setActiveItems(processor.getActiveItems());
  }

  function handleReset() {
    processor.reset();
    setEvents([]);
    setActiveItems([]);
  }

  function handleScenario(key) {
    const scenario = SCENARIOS[key];
    if (!scenario) return;
    handleReset();
    scenario.forEach(handleEvent);
  }

  async function handleRandomStream() {
    setStreaming(true);
    const baseEvents = [
      { id: "item-1", timestamp: 100, type: "created" },
      { id: "item-2", timestamp: 200, type: "created" },
      { id: "item-1", timestamp: 150, type: "updated" },
      { id: "item-1", timestamp: 250, type: "deleted" },
      { id: "item-1", timestamp: 50, type: "created" },
      { id: "item-3", timestamp: 300, type: "created" },
    ];
    const shuffled = shuffle(baseEvents);
    handleReset();
    for (let i = 0; i < shuffled.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      handleEvent(shuffled[i]);
    }
    setStreaming(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-400 mb-2">Out of Order Events</h1>
      <p className="text-slate-400 mb-8">
        Process events in arrival order. Active list updates as events stream in.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Event Stream (arrival order)</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-sm">
            {events.length === 0 && (
              <p className="text-slate-500 italic">No events yet</p>
            )}
            {events.map((e, i) => (
              <div
                key={i}
                className={`flex gap-2 py-1 px-2 rounded ${
                  e.type === "created" ? "bg-emerald-900/40 text-emerald-300" :
                  e.type === "updated" ? "bg-amber-900/40 text-amber-300" :
                  "bg-red-900/40 text-red-300"
                }`}
              >
                <span className="opacity-60">#{i + 1}</span>
                <span>{e.type}</span>
                <span className="text-slate-400">id={e.id}</span>
                <span className="text-slate-500">ts={e.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Active Items</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-sm">
            {activeItems.length === 0 && (
              <p className="text-slate-500 italic">Empty</p>
            )}
            {activeItems.map((item) => (
              <div
                key={item.id}
                className="py-2 px-3 rounded bg-slate-700/50 text-slate-200"
              >
                <span className="text-amber-400">{item.id}</span>{" "}
                <span className="text-slate-500">ts={item.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-slate-300 font-medium">Preset scenarios (edge cases)</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SCENARIOS).map((key) => (
            <button
              key={key}
              onClick={() => handleScenario(key)}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm"
            >
              {LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleRandomStream}
          disabled={streaming}
          className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium"
        >
          {streaming ? "Streaming..." : "Run random stream"}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-200"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
