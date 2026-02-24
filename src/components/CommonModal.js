import { memo, useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import Orientation from "react-native-orientation-locker";
import { useCurrentTheme } from "../../stores/themeStore";

const CommonModal = ({
  visible,
  onClose,
  onSubmit,

  title,
  children,

  // ✅ button configs
  showClose = true,
  showSubmit = false,

  closeText = "Close",
  submitText = "Submit",
}) => {
  const theme = useCurrentTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleClose = useCallback(() => {
    onClose?.();

    setTimeout(() => {
      Orientation.unlockAllOrientations();
    }, 300);
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    onSubmit?.();
  }, [onSubmit]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      backdropOpacity={0.45}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={260}
      animationOutTiming={200}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.modalContent}>
        {/* TITLE */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* BODY */}
        <View style={styles.body}>{children}</View>

        {/* FOOTER BUTTONS */}
        {(showClose || showSubmit) && (
          <View style={styles.footer}>
            {showClose && (
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeText}>{closeText}</Text>
              </TouchableOpacity>
            )}

            {showSubmit && (
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>{submitText}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default memo(CommonModal);

const createStyles = (theme) =>
  StyleSheet.create({
    modalContent: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.headingText,
      marginBottom: theme.spacing.sm,
    },
    body: {
      marginBottom: theme.spacing.md,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: theme.spacing.sm,
    },
    closeBtn: {
      backgroundColor: theme.colors.buttonSecondaryBg,
      borderWidth: 1,
      borderColor: theme.colors.buttonSecondaryBorder,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.md,
    },
    closeText: {
      color: theme.colors.buttonSecondaryText,
      fontWeight: "600",
    },
    submitBtn: {
      backgroundColor: theme.colors.buttonPrimaryBg,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.md,
    },
    submitText: {
      color: theme.colors.buttonPrimaryText,
      fontWeight: "600",
    },
  });

// Usage Example:

//   return (
//   <View style={{ flex: 1, justifyContent: "center" }}>
//     <Button title="Open Modal" onPress={openModal} />

//     <CommonModal
//       visible={showModal}
//       title="Update Profile"

//       onClose={closeModal}
//       onSubmit={handleSubmit}

//       showClose
//       showSubmit

//       closeText="Cancel"
//       submitText="Save"
//     >
//       <Text>
//         Are you sure you want to update profile details?
//       </Text>
//     </CommonModal>
//   </View>
// );
