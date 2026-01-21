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

type SessionForm = {
  sessionModalOpen: boolean;
  setSessionModalOpen: (v: boolean) => void;

  showSessionDatePicker: boolean;
  setShowSessionDatePicker: (v: boolean) => void;

  date: Date;
  setDate: (d: Date) => void;

  feeling: string;
  setFeeling: (v: string) => void;
  performance: string;
  setPerformance: (v: string) => void;
  rating: string;
  setRating: (v: string) => void;

  feedback: string;
  setFeedback: (v: string) => void;

  canSubmitSession: boolean;
  onCreateSession: () => Promise<void>;
};

function normalizeDateOnly(selected: Date) {
  const d = new Date(selected);
  d.setHours(12, 0, 0, 0);
  return d;
}

export default function SessionModal({
  open,
  onClose,
  form,
}: {
  open: boolean;
  onClose: () => void;
  form: SessionForm;
}) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      {/* Backdrop: paina taustaa -> sulje */}
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <KeyboardAvoidingView
          style={{ width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Card: estää taustapainalluksen */}
          <Pressable style={[styles.modalCard, { maxHeight: "95%" }]} onPress={() => {}}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <Text style={styles.h2}>Lisää harjoitus</Text>

              <Text style={styles.label}>Päivämäärä</Text>

              <Pressable style={styles.pickerRow} onPress={() => form.setShowSessionDatePicker(true)}>
                <Text style={styles.pickerText}>{fmtDateOnly(form.date)}</Text>
                <Text style={styles.pickerHint}>Valitse päivä</Text>
              </Pressable>

              {form.showSessionDatePicker && (
                <DateTimePicker
                  value={form.date}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(_, selected) => {
                    form.setShowSessionDatePicker(false);
                    if (!selected) return;
                    form.setDate(normalizeDateOnly(selected));
                  }}
                />
              )}

              {/* NUMERICAL RATING */}
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Fiilis</Text>
                  <TextInput
                    style={styles.input}
                    value={form.feeling}
                    onChangeText={form.setFeeling}
                    placeholder="0–10"
                    keyboardType="number-pad"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Suoritus</Text>
                  <TextInput
                    style={styles.input}
                    value={form.performance}
                    onChangeText={form.setPerformance}
                    placeholder="0–10"
                    keyboardType="number-pad"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Arvosana</Text>
                  <TextInput
                    style={styles.input}
                    value={form.rating}
                    onChangeText={form.setRating}
                    placeholder="0–10"
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* FEEDBACK BOX */}
              <Text style={styles.label}>Feedback (valinnainen)</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: "top" }]}
                value={form.feedback}
                onChangeText={form.setFeedback}
                multiline
                blurOnSubmit={false}
                returnKeyType="default"
              />

              <View style={styles.modalActions}>
                {/* CANCEL BTN */}
                <Pressable style={styles.secondaryBtn} onPress={onClose}>
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </Pressable>

                {/* SAVE BTN */}
                <Pressable
                  style={[styles.primaryBtn, { flex: 1, opacity: form.canSubmitSession ? 1 : 0.5 }]}
                  onPress={form.onCreateSession}
                  disabled={!form.canSubmitSession}
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
