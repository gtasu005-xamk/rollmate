import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { fmtDateOnly } from "../../utils/date";
import { modalStyles as styles } from "./Modal.styles";

type ThemeForm = {
  themeModalOpen: boolean;
  setThemeModalOpen: (v: boolean) => void;

  showThemeStartPicker: boolean;
  setShowThemeStartPicker: (v: boolean) => void;
  showThemeEndPicker: boolean;
  setShowThemeEndPicker: (v: boolean) => void;

  themeName: string;
  setThemeName: (v: string) => void;
  themeStartAt: Date;
  setThemeStartAt: (d: Date) => void;
  themeEndAt: Date;
  setThemeEndAt: (d: Date) => void;

  canSubmitTheme: boolean;
  onCreateTheme: () => Promise<void>;
};

function normalizeDateOnly(selected: Date) {
  const d = new Date(selected);
  d.setHours(12, 0, 0, 0);
  return d;
}

export default function ThemeModal({
  open,
  onClose,
  form,
}: {
  open: boolean;
  onClose: () => void;
  form: ThemeForm;
}) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      {/* Backdrop: paina taustaa -> sulje */}
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <KeyboardAvoidingView
          style={{ width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Card: estää backdrop-pressin */}
          <Pressable style={[styles.modalCard, { maxHeight: "95%" }]} onPress={() => {}}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <Text style={styles.h2}>Lisää teema</Text>

              <Text style={styles.label}>Nimi</Text>
              <TextInput
                style={styles.input}
                value={form.themeName}
                onChangeText={form.setThemeName}
                placeholder="esim. Guard passing"
                returnKeyType="done"
              />

              <Text style={styles.label}>Alkaa</Text>
              <Pressable
                style={styles.pickerRow}
                onPress={() => {
                  // varmista ettei molemmat pickerit aukea
                  form.setShowThemeEndPicker(false);
                  form.setShowThemeStartPicker(true);
                }}
              >
                <Text style={styles.pickerText}>{fmtDateOnly(form.themeStartAt)}</Text>
                <Text style={styles.pickerHint}>Valitse alkamispäivä</Text>
              </Pressable>

              {form.showThemeStartPicker && (
                <DateTimePicker
                  value={form.themeStartAt}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(_, selected) => {
                    form.setShowThemeStartPicker(false);
                    if (selected) form.setThemeStartAt(normalizeDateOnly(selected));
                  }}
                />
              )}

              <Text style={styles.label}>Päättyy</Text>
              <Pressable
                style={styles.pickerRow}
                onPress={() => {
                  form.setShowThemeStartPicker(false);
                  form.setShowThemeEndPicker(true);
                }}
              >
                <Text style={styles.pickerText}>{fmtDateOnly(form.themeEndAt)}</Text>
                <Text style={styles.pickerHint}>Valitse loppumispäivä</Text>
              </Pressable>

              {form.showThemeEndPicker && (
                <DateTimePicker
                  value={form.themeEndAt}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(_, selected) => {
                    form.setShowThemeEndPicker(false);
                    if (selected) form.setThemeEndAt(normalizeDateOnly(selected));
                  }}
                />
              )}

              <View style={styles.modalActions}>
                <Pressable style={styles.secondaryBtn} onPress={onClose}>
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.primaryBtn, { flex: 1, opacity: form.canSubmitTheme ? 1 : 0.5 }]}
                  onPress={form.onCreateTheme}
                  disabled={!form.canSubmitTheme}
                >
                  <Text style={styles.primaryBtnText}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
