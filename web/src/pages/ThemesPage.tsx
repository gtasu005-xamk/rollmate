import { useEffect, useState } from "react";
import { getThemes, createTheme, updateTheme, deleteTheme } from "../features/themes";
import type { Theme, CreateThemeInput } from "../features/types";
import ThemeList from "../components/ThemeList";
import ThemeForm from "../components/ThemeForm";

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Theme | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getThemes();
      setThemes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload: CreateThemeInput) {
    await createTheme(payload);
    await load();
  }

  async function handleUpdate(id: string, payload: CreateThemeInput) {
    await updateTheme(id, payload);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Poistetaanko teema?")) return;
    await deleteTheme(id);
    await load();
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Teemat</h2>

      <ThemeForm onCreate={handleCreate} onUpdate={handleUpdate} editing={editing} onCancel={() => setEditing(null)} />

      {loading ? <div>Ladataan…</div> : <ThemeList themes={themes} onEdit={(t) => setEditing(t)} onDelete={handleDelete} />}
    </div>
  );
}
