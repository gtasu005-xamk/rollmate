import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  bottomPane: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 14,
    position: "relative", // 🔑 mahdollistaa absolute-napin
  },

  h1: { fontSize: 20, fontWeight: "700" },

  paneScroll: { marginTop: 10 },

  paneContent: {
    paddingBottom: 90, // 🔑 tilaa sticky-napille
    gap: 12,
  },

  muted: { color: "#666", marginTop: 6 },

  sessionRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },

  bold: { fontWeight: "700" },
  text: { marginTop: 6 },

  primaryBtnSticky: {
    position: "absolute",
    bottom: 14,
    left: 32,
    right: 32,
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
  },

  primaryBtnText: { color: "#fff", fontWeight: "700" },

  primaryBtnPressed: {opacity: 0.8, transform: [{ scale: 0.99 }],},
});
