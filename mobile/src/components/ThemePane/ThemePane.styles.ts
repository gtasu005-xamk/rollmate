import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  topPane: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 14,
  },

  paneHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },

  paneScroll: { marginTop: 10 },
  paneContent: { paddingBottom: 12, gap: 12 },

  h1Big: { fontSize: 26, fontWeight: "800" },

  mutedBig: { color: "#666", marginTop: 8, fontSize: 16 },

  themeRow: { borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 10 },
  themeTitle: { fontSize: 18, fontWeight: "800" },
  themeSub: { color: "#666", marginTop: 4, fontSize: 14 },

  smallBtn: {
    backgroundColor: "#111",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  
  smallBtnText: { color: "#fff", fontWeight: "800" },

  smallBtnPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },

});
