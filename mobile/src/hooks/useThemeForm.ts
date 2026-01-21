import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { api } from "../services/api";

import type { CreateThemeInput } from "../domain/theme/model";
import { validateCreateTheme } from "../domain/theme/validators";

export function useThemeForm(onSuccess: () => Promise<void> | void) {
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const [showThemeStartPicker, setShowThemeStartPicker] = useState(false);
  const [showThemeEndPicker, setShowThemeEndPicker] = useState(false);

  const [themeName, setThemeName] = useState("");
  const [themeStartAt, setThemeStartAt] = useState<Date>(() => new Date());
  const [themeEndAt, setThemeEndAt] = useState<Date>(() => new Date(Date.now() + 60 * 60 * 1000));

  const canSubmitTheme = useMemo(() => {
    const payload: CreateThemeInput = {
      name: themeName.trim(),
      startAt: themeStartAt.toISOString(),
      endAt: themeEndAt.toISOString(),
    };
    return validateCreateTheme(payload);
  }, [themeName, themeStartAt, themeEndAt]);

  function resetThemeForm() {
    setThemeName("");
    setThemeStartAt(new Date());
    setThemeEndAt(new Date(Date.now() + 60 * 60 * 1000));
  }

  async function onCreateTheme() {
    const payload: CreateThemeInput = {
      name: themeName.trim(),
      startAt: themeStartAt.toISOString(),
      endAt: themeEndAt.toISOString(),
    };

    if (!validateCreateTheme(payload)) {
      Alert.alert("Invalid theme", "Check name and that end time is after start time.");
      return;
    }

    try {
      await api.createTheme(payload);

      setThemeModalOpen(false);
      setShowThemeStartPicker(false);
      setShowThemeEndPicker(false);

      resetThemeForm();
      await onSuccess();
    } catch (e: any) {
      Alert.alert("Create theme failed", e?.message ?? "Unknown error");
    }
  }

  return {
    // modal
    themeModalOpen,
    setThemeModalOpen,

    // pickers
    showThemeStartPicker,
    setShowThemeStartPicker,
    showThemeEndPicker,
    setShowThemeEndPicker,

    // form
    themeName,
    setThemeName,
    themeStartAt,
    setThemeStartAt,
    themeEndAt,
    setThemeEndAt,

    canSubmitTheme,
    onCreateTheme,
  };
}
