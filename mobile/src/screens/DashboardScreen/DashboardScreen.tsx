import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import type { Theme } from "../../domain/theme/model";
import type { TrainingSession } from "../../domain/session/model";

import { useDashboardData } from "../../hooks/useDashboardData";
import { useThemeForm } from "../../hooks/useThemeForm";
import { useSessionForm } from "../../hooks/useSessionForm";

import ThemePane from "../../components/ThemePane/ThemePane";
import SessionPane from "../../components/SessionPane/SessionPane";
import ThemeModal from "../../components/modals/ThemeModal";
import SessionModal from "../../components/modals/SessionModal";

import { styles } from "./DashboardScreen.styles";

export default function DashboardScreen() {
  const { themes, sessions, loading, refreshThemes, refreshSessions } = useDashboardData();

  const themeForm = useThemeForm(async () => {
    await refreshThemes();
  });

  const sessionForm = useSessionForm(async () => {
    await refreshSessions();
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <ThemePane themes={themes as Theme[]} onAdd={() => themeForm.setThemeModalOpen(true)} />
        <SessionPane sessions={sessions as TrainingSession[]} onAdd={() => sessionForm.setSessionModalOpen(true)} />

        <ThemeModal
          open={themeForm.themeModalOpen}
          onClose={() => {
            themeForm.setShowThemeStartPicker(false);
            themeForm.setShowThemeEndPicker(false);
            themeForm.setThemeModalOpen(false);
          }}
          form={themeForm}
        />

        <SessionModal
          open={sessionForm.sessionModalOpen}
          onClose={() => {
            sessionForm.setShowSessionDatePicker(false);
            sessionForm.setSessionModalOpen(false);
          }}
          form={sessionForm}
        />
      </View>
    </SafeAreaView>
  );
}
