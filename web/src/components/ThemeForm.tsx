import React, { useEffect, useState } from "react";
import type { CreateThemeInput, Theme } from "../features/types";

export default function ThemeForm({
  onCreate,
  onUpdate,
  editing,
  onCancel,
}: {
  onCreate: (payload: CreateThemeInput) => Promise<void>;
  onUpdate: (id: string, payload: CreateThemeInput) => Promise<void>;
  editing?: Theme | null;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      // use date-only (YYYY-MM-DD) for inputs; strip time
      setStartAt(editing.startAt.slice(0, 10));
      setEndAt(editing.endAt.slice(0, 10));
    } else {
      setName("");
      setStartAt("");
      setEndAt("");
    }
  }, [editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // combine selected date with current time so time is automatic
    const now = new Date();
    const s = new Date(startAt);
    s.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    const en = new Date(endAt);
    en.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    const payload: CreateThemeInput = { name, startAt: s.toISOString(), endAt: en.toISOString() };
    setLoading(true);
    try {
      if (editing) {
        await onUpdate(editing.id, payload);
        onCancel?.();
      } else {
        await onCreate(payload);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Nimi</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
      </div>

      <div style={styles.rowContainer}>
        <div style={styles.formGroupInline}>
          <label style={styles.label}>Alkaa</label>
          <input type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} required style={styles.input} />
        </div>
        <div style={styles.formGroupInline}>
          <label style={styles.label}>Päättyy</label>
          <input type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} required style={styles.input} />
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button type="submit" disabled={loading}>{loading ? "Tallennetaan…" : "Luo teema"}</button>
        {editing && onCancel && (
          <button type="button" onClick={onCancel} style={styles.closeButton}>
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
