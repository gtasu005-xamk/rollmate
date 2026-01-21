import { StyleSheet } from "react-native";

export const modalStyles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    justifyContent: "flex-end"
    },

    
  modalCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    gap: 10,
    },

  h2: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  label: { fontSize: 12, color: "#555", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  pickerRow: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pickerText: { flex: 1, color: "#111", fontWeight: "600" },
  pickerHint: { color: "#666", fontWeight: "700" },

  grid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  gridItem: { flexBasis: "31%", flexGrow: 1 },

  modalActions: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 6 },

  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  secondaryBtn: {
    backgroundColor: "#eee",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryBtnText: { fontWeight: "700" },
});
