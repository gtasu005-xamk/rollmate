import React, { useState } from "react";
import type { CreateTaskInput } from "../features/types";

export default function TodoForm({
  onCreate,
  onClose,
}: {
  onCreate: (payload: CreateTaskInput) => Promise<void>;
  onClose?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await onCreate({ title: title.trim() });
      setTitle("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Tehtävä</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kirjoita tehtävä..."
          required
          style={styles.input}
          autoFocus
        />
      </div>

      <div style={styles.buttonGroup}>
        <button type="submit" disabled={loading || !title.trim()}>
          {loading ? "Lisätään…" : "Lisää tehtävä"}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} style={styles.closeButton}>
            Peruuta
          </button>
        )}
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    marginBottom: 12,
    background: "#0f0f10",
    padding: 16,
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
  formGroup: {
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: 4,
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.9)",
  },
  input: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "#2a2a2b",
    color: "#fff",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  buttonGroup: {
    display: "flex",
    gap: 8,
    marginTop: 12,
    justifyContent: "center",
  },
  closeButton: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
};
