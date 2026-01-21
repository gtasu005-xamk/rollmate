import type { Note } from "../features/types";

export default function NoteList({ notes, onDelete }: { notes: Note[]; onDelete: (id: string) => void }) {
  if (!notes || notes.length === 0) return <div>Ei muistiinpanoja.</div>;

  return (
    <div>
      {notes.map((n) => (
        <div key={n.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
          <div style={{ color: "#666", fontSize: 12 }}>{new Date(n.createdAt).toLocaleString()}</div>
          <div style={{ marginTop: 6 }}>{n.text}</div>
          <div style={{ marginTop: 6 }}>
            <button onClick={() => onDelete(n.id)}>Poista</button>
          </div>
        </div>
      ))}
    </div>
  );
}
