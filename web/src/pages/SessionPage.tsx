import { useEffect, useState } from "react";
import { getSessions, createSession } from "../features/session";
import type { TrainingSession, CreateTrainingSessionInput } from "../features/types";
import SessionList from "../components/SessionList";
import SessionForm from "../components/SessionForm";

export default function SessionPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload: CreateTrainingSessionInput) {
    await createSession(payload);
    await load();
  }

  async function handleDelete() {
    await load();
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Harjoitukset</h2>

      <SessionForm onCreate={handleCreate} />

      {loading ? <div>Ladataan…</div> : <SessionList sessions={sessions} onDelete={handleDelete} showDelete={true} />}
    </div>
  );
}
