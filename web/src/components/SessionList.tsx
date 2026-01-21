// import React from "react";
import { Link } from "react-router-dom";
import type { TrainingSession } from "../features/types";
import { api } from "../lib/apiClient";

export function SessionList({
  sessions,
  onDelete,
  showDelete = false,
}: {
  sessions: TrainingSession[];
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}) {
  async function handleDelete(id: string) {
    if (!confirm("Haluatko varmasti poistaa tämän harjoituksen?")) return;
    await api.deleteSession(id);
    onDelete?.(id);
  }

  if (!sessions || sessions.length === 0) return <div>Ei harjoituksia.</div>;

  return (
    <div>
      {sessions.map((s) => (
        <div key={s.id} style={styles.item}>
          <div style={styles.content}>
            <div style={{ fontWeight: 700 }}>
              <Link to={`/sessions/${s.id}`}>{new Date(s.date).toLocaleString()}</Link>
            </div>
            <div style={{ color: "#666" }}>
              Fiilis {s.feeling} · Suoritus {s.performance} · Arvosana {s.rating}
            </div>
            {s.feedback && <div style={{ marginTop: 6 }}>{s.feedback}</div>}
          </div>
          {showDelete && (
            <button onClick={() => handleDelete(s.id)} style={styles.deleteButton} aria-label="Poista harjoitus">
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    padding: 8,
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  content: {
    flex: 1,
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
};

export default SessionList;
