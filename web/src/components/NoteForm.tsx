import React, { useState } from "react";
import type { CreateNoteInput } from "../features/types";

export default function NoteForm({ onCreate }: { onCreate: (payload: CreateNoteInput) => Promise<void> }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onCreate({ text });
      setText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
      <div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={loading}>{loading ? "Lisätään…" : "Lisää muistiinpano"}</button>
      </div>
    </form>
  );
}
