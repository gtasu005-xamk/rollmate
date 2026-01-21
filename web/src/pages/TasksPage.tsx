import { useEffect, useState } from "react";
import { api } from "../lib/apiClient";
import type { Task, CreateTaskInput } from "../features/types";
import TodoList from "../components/TodoList";
import TodoForm from "../components/TodoForm";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload: CreateTaskInput) {
    await api.createTask(payload);
    await load();
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Tehtävät</h2>

      <TodoForm onCreate={handleCreate} />

      {loading ? <div>Ladataan…</div> : <TodoList tasks={tasks} onUpdate={load} />}
    </div>
  );
}
