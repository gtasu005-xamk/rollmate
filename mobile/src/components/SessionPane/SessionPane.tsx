import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { TrainingSession } from "../../domain/session/model";

import { fmtDate } from "../../utils/date";
import { styles } from "./SessionPane.styles";

export default function SessionPane({
  sessions,
  onAdd,
}: {
  sessions: TrainingSession[];
  onAdd: () => void;
}) {
  return (
    <View style={styles.bottomPane}>
      <Text style={styles.h1}>Menneet harjoitukset</Text>

      {sessions.length === 0 ? (
        <Text style={styles.muted}>Ei harjoituksia vielä.</Text>
      ) : (
        <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent}>
          {sessions.map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <Text style={styles.bold}>{fmtDate(s.date)}</Text>
              <Text style={styles.muted}>
                Fiilis {s.feeling} · Suorituskyky {s.performance} · Arvosana {s.rating}
              </Text>
              {!!s.feedback && <Text style={styles.text}>{s.feedback}</Text>}
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable onPress={onAdd} style={({ pressed }) => [styles.primaryBtnSticky,pressed && styles.primaryBtnPressed,]}>
               <Text style={styles.primaryBtnText}>Lisää harjoitus</Text>
      </Pressable>
    </View>
  );
}
