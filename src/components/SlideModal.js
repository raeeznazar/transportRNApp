import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

const SlideModal = ({ visible, onClose, children, maxHeight = "90%", contentContainerStyle }) => {
  const theme = useCurrentTheme();

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: `${theme.colors.headingText}59` }]} onPress={onClose}>
        <Pressable
          style={[
            styles.container,
            {
              maxHeight,
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.cardBorder,
            },
            contentContainerStyle,
          ]}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === "android" ? 10 : 20 }}
            >
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/**
 * AppModal (SlideModal)
 * ------------------------------------------------------------
 * Bottom slide modal that is theme-aware via `useCurrentTheme()`.
 *
 * ✅ Features
 * - Slide-up modal with dimmed overlay
 * - Theme-based card background + border
 * - Scrollable content area
 * - Tap outside to close
 *
 * ✅ Props
 * - visible: boolean
 *   Controls modal open/close state.
 *
 * - onClose: () => void
 *   Called when overlay tap or Android back press occurs.
 *
 * - children: ReactNode
 *   Modal content.
 *
 * - maxHeight?: string | number (default: "90%")
 *   Max height of the bottom sheet container.
 *
 * - contentContainerStyle?: ViewStyle
 *   Optional style override for modal container.
 *
 * ✅ Example
 * const [open, setOpen] = useState(false);
 *
 * <SlideModal visible={open} onClose={() => setOpen(false)} maxHeight="80%">
 *   <Text>Modal content here</Text>
 * </SlideModal>
 */

export default SlideModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
});
