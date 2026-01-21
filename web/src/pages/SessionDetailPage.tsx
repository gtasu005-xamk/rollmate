import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, getSessionNotes, createSessionNote, deleteSessionNote } from "../features/session";
import type { TrainingSession, Note, CreateNoteInput } from "../features/types";
import NoteList from "../components/NoteList";
import NoteForm from "../components/NoteForm";

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const s = await getSession(id);
      setSession(s);
      const ns = await getSessionNotes(id);
      setNotes(ns);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleCreateNote(payload: CreateNoteInput) {
    if (!id) return;
    await createSessionNote(id, payload);
    const ns = await getSessionNotes(id);
    setNotes(ns);
  }

  async function handleDeleteNote(noteId: string) {
    if (!id) return;
    await deleteSessionNote(id, noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  if (!id) return <div>Session id puuttuu</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Harjoitus</h2>
        <button onClick={() => navigate(-1)} aria-label="Sulje">Sulje</button>
      </div>
      {loading && <div>Ladataan…</div>}
      {session && (
        <div style={{ marginBottom: 12 }}>
          <div>Date: {new Date(session.date).toLocaleString()}</div>
          <div>Feeling: {session.feeling}</div>
          <div>Performance: {session.performance}</div>
          <div>Rating: {session.rating}</div>
          {session.feedback && <div style={{ marginTop: 8 }}>{session.feedback}</div>}
        </div>
      )}

      <h3>Muistiinpanot</h3>
      <NoteForm onCreate={handleCreateNote} />
      <NoteList notes={notes} onDelete={handleDeleteNote} />
    </div>
  );
}
