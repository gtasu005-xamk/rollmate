import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { Theme } from "../../domain/theme/model";

import { fmtDate } from "../../utils/date";
import { styles } from "./ThemePane.styles";

export default function ThemePane({ themes, onAdd }: { themes: Theme[]; onAdd: () => void }) {
  return (
    <View style={styles.topPane}>
      <View style={styles.paneHeaderRow}>
        <Text style={styles.h1Big}>Harjoitus teema</Text>

        <Pressable onPress={onAdd} style={({ pressed }) => [styles.smallBtn, pressed && styles.smallBtnPressed]}>
          <Text style={styles.smallBtnText}>+ Lisää</Text>
        </Pressable>

      </View>

      {themes.length === 0 ? (
        <Text style={styles.mutedBig}>Ei teemoja vielä.</Text>
      ) : (
        <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent}>
          {themes.map((t) => (
            <View key={t.id} style={styles.themeRow}>
              <Text style={styles.themeTitle}>{t.name}</Text>
              <Text style={styles.themeSub}>
                {fmtDate(t.startAt)} – {fmtDate(t.endAt)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
