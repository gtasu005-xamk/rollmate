import type { Task } from "../features/types";
import { api } from "../lib/apiClient";

export default function TodoList({ tasks, onUpdate }: { tasks: Task[]; onUpdate: () => void }) {
  async function toggleTask(task: Task) {
    await api.updateTask(task.id, { completed: !task.completed });
    onUpdate();
  }

  async function deleteTask(id: string) {
    if (!confirm("Haluatko varmasti poistaa tämän tehtävän?")) return;
    await api.deleteTask(id);
    onUpdate();
  }

  if (tasks.length === 0) {
    return <div style={styles.empty}>Ei tehtäviä</div>;
  }

  return (
    <div style={styles.list}>
      {tasks.map((task) => (
        <div key={task.id} style={styles.item}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
              style={styles.checkbox}
            />
            <span style={task.completed ? styles.titleCompleted : styles.title}>{task.title}</span>
          </label>
          <button onClick={() => deleteTask(task.id)} style={styles.deleteButton} aria-label="Poista tehtävä">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    background: "rgba(0, 0, 0, 0.06)",
    borderRadius: 8,
    gap: 12,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    cursor: "pointer",
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
  },
  title: {
    fontSize: "1rem",
  },
  titleCompleted: {
    fontSize: "1rem",
    textDecoration: "line-through",
    color: "#999",
  },
  deleteButton: {
    background: "transparent",
    color: "#ff4444",
    border: "none",
    width: 28,
    height: 28,
    borderRadius: "50%",
    fontSize: "1.8rem",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  "deleteButton:hover": {
    background: "rgba(255, 0, 0, 0.1)",
  },
  empty: {
    padding: 12,
    color: "#666",
    textAlign: "center",
  },
};
