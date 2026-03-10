import { useEffect, useRef } from "react";
import { Animated, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

const DISMISS_THRESHOLD = 100;

const SlideModal = ({ visible, onClose, children, maxHeight = "90%", contentContainerStyle }) => {
  const theme = useCurrentTheme();
  const translateY = useRef(new Animated.Value(0)).current;

  // Reset position every time the modal opens
  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.8) {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
          onClose();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
        }
      },
    })
  ).current;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose} onDismiss={() => translateY.setValue(0)}>
      <View style={styles.root}>
        {/* Dimmed backdrop — tap to close */}
        <Pressable style={[StyleSheet.absoluteFillObject, { backgroundColor: `${theme.colors.headingText}59` }]} onPress={onClose} />

        <Animated.View
          style={[
            styles.container,
            {
              maxHeight,
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.cardBorder,
            },
            contentContainerStyle,
            { transform: [{ translateY }] },
          ]}
        >
          {/* ── Handle — PanResponder attached here ── */}
          <View style={styles.handleWrapper} {...panResponder.panHandlers}>
            <View style={[styles.handle, { backgroundColor: "#00000030" }]} />
          </View>

          {/* ── Content ── */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === "android" ? 10 : 20 }}
            >
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
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
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },

  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 0,
    // Shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    // Elevation (Android)
    elevation: 16,
  },

  handleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
    marginHorizontal: -16,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});
