import React from "react";
import type { Theme } from "../features/types";

export default function ThemeList({
  themes,
  onEdit,
  onDelete,
}: {
  themes: Theme[];
  onEdit: (t: Theme) => void;
  onDelete: (id: string) => void;
}) {
  if (!themes || themes.length === 0) return <div style={styles.empty}>Ei teemoja.</div>;

  return (
    <div style={styles.container}>
      {themes.map((t) => (
        <div key={t.id} style={styles.item}>
          <div style={styles.themeName}>{t.name}</div>
          <div style={styles.themeDates}>
            {new Date(t.startAt).toLocaleDateString()} – {new Date(t.endAt).toLocaleDateString()}
          </div>
          <div style={styles.buttonContainer}>
            <button onClick={() => onEdit(t)} style={styles.editButton}>
              Muokkaa
            </button>
            <button onClick={() => onDelete(t.id)} style={styles.deleteButton}>Poista</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  item: {
    padding: 12,
    background: "#151516",
    borderRadius: 8,
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  themeName: {
    fontWeight: 700,
    color: "#fff",
    marginBottom: 4,
  },
  themeDates: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: "0.9rem",
    marginBottom: 8,
  },
  buttonContainer: {
    display: "flex",
    gap: 8,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    background: "transparent",
    color: "#ff6b6b",
    border: "1px solid rgba(255, 107, 107, 0.3)",
  },
  empty: {
    color: "rgba(255, 255, 255, 0.65)",
    padding: 12,
    textAlign: "center",
  },
};
