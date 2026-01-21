import { useMemo, useState } from "react";
import { Alert } from "react-native";

import { api } from "../services/api";
import { clampInt0to10 } from "../utils/number";

import type { CreateTrainingSessionInput } from "../domain/session/model";
import { validateCreateSessionScores } from "../domain/session/validators";

export function useSessionForm(onSuccess: () => Promise<void> | void) {
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [showSessionDatePicker, setShowSessionDatePicker] = useState(false);

  const [date, setDate] = useState<Date>(() => new Date());
  const [feeling, setFeeling] = useState("");
  const [performance, setPerformance] = useState("");
  const [rating, setRating] = useState("");
  const [feedback, setFeedback] = useState("");

  const canSubmitSession = useMemo(() => {
    const f = clampInt0to10(feeling);
    const p = clampInt0to10(performance);
    const r = clampInt0to10(rating);
    if (f === null || p === null || r === null) return false;
    return validateCreateSessionScores({ feeling: f, performance: p, rating: r });
  }, [feeling, performance, rating]);

  function resetSessionForm() {
    setDate(new Date());
    setFeeling("");
    setPerformance("");
    setRating("");
    setFeedback("");
  }

  async function onCreateSession() {
    const f = clampInt0to10(feeling);
    const p = clampInt0to10(performance);
    const r = clampInt0to10(rating);

    if (
      f === null ||
      p === null ||
      r === null ||
      !validateCreateSessionScores({ feeling: f, performance: p, rating: r })
    ) {
      Alert.alert("Invalid input", "Scores must be integers 0–10.");
      return;
    }

    const payload: CreateTrainingSessionInput = {
      date: date.toISOString(),
      feeling: f,
      performance: p,
      rating: r,
      feedback: feedback.trim() ? feedback.trim() : null,
    };

    try {
      await api.createSession(payload);

      setSessionModalOpen(false);
      setShowSessionDatePicker(false);

      resetSessionForm();
      await onSuccess();
    } catch (e: any) {
      Alert.alert("Create session failed", e?.message ?? "Unknown error");
    }
  }

  return {
    // modal
    sessionModalOpen,
    setSessionModalOpen,

    // picker
    showSessionDatePicker,
    setShowSessionDatePicker,

    // form
    date,
    setDate,
    feeling,
    setFeeling,
    performance,
    setPerformance,
    rating,
    setRating,
    feedback,
    setFeedback,

    canSubmitSession,
    onCreateSession,
  };
}
