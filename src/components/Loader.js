import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

export default function Loader({ visible = true, text = "Loading details…" }) {
  const theme = useCurrentTheme();
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="text-sm font-semibold mt-2" style={{ color: theme.colors.text }}>
            {text}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" },
  box: { padding: 18, borderRadius: 8, backgroundColor: "#fff" },
});
