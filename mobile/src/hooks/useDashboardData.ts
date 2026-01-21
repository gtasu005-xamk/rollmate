import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { api } from "../services/api";
import type { Theme } from "../domain/theme/model";
import type { TrainingSession } from "../domain/session/model";


export function useDashboardData() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshThemes = useCallback(async () => {
    try {
      const t = await api.getThemes();
      setThemes(t);
    } catch (e: any) {
      Alert.alert("Themes failed", e?.message ?? "Unknown error");
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      const s = await api.getSessions();
      setSessions(s);
    } catch (e: any) {
      Alert.alert("Sessions failed", e?.message ?? "Unknown error");
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([api.getThemes(), api.getSessions()]);
      setThemes(t);
      setSessions(s);
    } catch (e: any) {
      Alert.alert("Load failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    themes,
    sessions,
    loading,
    refreshThemes,
    refreshSessions,
    loadAll,
  };
}
