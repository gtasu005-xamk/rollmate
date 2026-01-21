import React, { useState } from "react";
import type { CreateTrainingSessionInput } from "../features/types";

export default function SessionForm({
  onCreate,
  onClose,
}: {
  onCreate: (payload: CreateTrainingSessionInput) => Promise<void>;
  onClose?: () => void;
}) {
  // /YYYY-MM-DD/ format for date input
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [feeling, setFeeling] = useState(5);
  const [performance, setPerformance] = useState(5);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // combine selected date with current time
      const selected = new Date(date);
      const now = new Date();
      selected.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      await onCreate({ date: selected.toISOString(), feeling, performance, rating, feedback });
      setFeedback("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Päivämäärä</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={styles.input} />
      </div>

      <div style={styles.rowContainer}>
        <div style={styles.formGroupInline}>
          <label style={styles.label}>Fiilis</label>
          <input type="number" min={0} max={10} value={feeling} onChange={(e) => setFeeling(Number(e.target.value))} style={styles.input} />
        </div>
        <div style={styles.formGroupInline}>
          <label style={styles.label}>Suoritus</label>
          <input type="number" min={0} max={10} value={performance} onChange={(e) => setPerformance(Number(e.target.value))} style={styles.input} />
        </div>
        <div style={styles.formGroupInline}>
          <label style={styles.label}>Arvosana</label>
          <input type="number" min={0} max={10} value={rating} onChange={(e) => setRating(Number(e.target.value))} style={styles.input} />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Kommentti</label>
        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} style={styles.textarea} />
      </div>

      <div style={styles.buttonGroup}>
        {onClose && (
          <button type="button" onClick={onClose} style={styles.closeButton}>
            Sulje
          </button>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Tallennetaan…" : "Lisää harjoitus"}
        </button>
        
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
  formGroupInline: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  rowContainer: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
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
  textarea: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "#2a2a2b",
    color: "#fff",
    fontSize: "1rem",
    fontFamily: "inherit",
    minHeight: 80,
    resize: "vertical",
  },
  buttonGroup: {
    display: "flex",
    gap: 8,
    marginTop: 12,
    justifyContent: "space-between",
  },
  closeButton: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
};
