import { useEffect, useState, type CSSProperties } from "react";
import { getThemes } from "../features/themes";
import { getSessions, createSession } from "../features/session";
import type { Theme, TrainingSession, CreateTrainingSessionInput, Task, CreateTaskInput } from "../features/types";
import SessionList from "../components/SessionList";
import SessionForm from "../components/SessionForm";
import SessionChart from "../components/SessionChart";
import TodoList from "../components/TodoList";
import TodoForm from "../components/TodoForm";
import { api } from "../lib/apiClient";

export default function HomePage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showTodoForm, setShowTodoForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [ts, ss, tks] = await Promise.all([getThemes(), getSessions(), api.getTasks()]);
      setThemes(ts);
      setSessions(ss);
      setTasks(tks);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function currentTheme(): Theme | null {
    const today = new Date().toISOString().split('T')[0];
    // pick first theme where today between startAt and endAt (date only, ignore time)
    return themes.find((t) => {
      const startDate = t.startAt.split('T')[0];
      const endDate = t.endAt.split('T')[0];
      return startDate <= today && today <= endDate;
    }) ?? null;
  }

  async function handleCreate(payload: CreateTrainingSessionInput) {
    await createSession(payload);
    setShowForm(false);
    await load();
  }

  async function handleCreateTask(payload: CreateTaskInput) {
    await api.createTask(payload);
    setShowTodoForm(false);
    await load();
  }

  const theme = currentTheme();

  return (
    <div style={styles.page}>


      <div style={{ padding: "0 12px" }}>
        <h2 style={styles.sectionTitle}>Harjoitusteema</h2>
      </div>

      {theme ? (
        <section style={styles.themeCard}>
          <div style={styles.themeName}>{theme.name}</div>
          <div style={styles.themeDates}>
            {new Date(theme.startAt).toLocaleDateString()} – {new Date(theme.endAt).toLocaleDateString()}
          </div>
        </section>
      ) : (
        <section style={styles.themeEmpty}>Ei aktiivista teemaa</section>
      )}

      {!loading && sessions.length > 0 && <SessionChart sessions={sessions} />}

      <section style={styles.todoSection}>
        <h2 style={styles.sectionTitle}>Tehtävät</h2>
        {loading ? <div>Ladataan…</div> : <TodoList tasks={tasks.slice(0, 5)} onUpdate={load} />}
        <button style={styles.addButton} onClick={() => setShowTodoForm(true)} aria-label="Lisää tehtävä">
          + Lisää tehtävä
        </button>
      </section>

      <section style={styles.sessionsSection}>
        <h2 style={styles.sectionTitle}>Menneet harjoitukset</h2>
        {loading ? <div>Ladataan…</div> : <SessionList sessions={sessions.slice(0, 5)} onDelete={() => load()} />}
      </section>

      {showForm && (
        <div style={styles.formPane}>
          <SessionForm onCreate={handleCreate} onClose={() => setShowForm(false)} />
        </div>
      )}

      {showTodoForm && (
        <div style={styles.formPane}>
          <TodoForm onCreate={handleCreateTask} onClose={() => setShowTodoForm(false)} />
        </div>
      )}

      <button style={styles.fab} onClick={() => setShowForm(true)} aria-label="Lisää harjoitus">
        Lisää harjoitus
      </button>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
  },
  h1: { margin: 0, fontSize: 20 },
  themeCard: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(0,0,0,0.06)",
    margin: "0 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  themeName: { fontSize: "1,5rem",fontWeight: 700 },
  themeDates: { color: "#666", fontSize: 12, textAlign: "right" },
  themeEmpty: { padding: 12, margin: "0 12px", color: "#666" },
  todoSection: { padding: "0 12px" },
  addButton: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: 500,
    marginTop: 8,
    width: "100%",
  },
  sessionsSection: { padding: "0 12px 80px 12px" },
  sectionTitle: { margin: "8px 0", fontSize: "1.5rem", fontWeight: 600 },

  fab: {
    position: "fixed",
    bottom: 18,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: 999,
    boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
  },

  formPane: {
    position: "fixed",
    left: 12,
    right: 12,
    bottom: 72,
    background: "transparent",
    borderRadius: 12,
    padding: 0,
    boxShadow: "none",
  },
};
