import Toast from "react-native-toast-message";

/**
 * Toast Helper Functions
 * Provides consistent toast notifications throughout the app
 */

export const showSuccessToast = (message, title = "Success") => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 40,
  });
};

export const showErrorToast = (message, title = "Error") => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 4000,
    autoHide: true,
    bottomOffset: 40,
  });
};

export const showInfoToast = (message, title = "Info") => {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 40,
  });
};

export const showWarningToast = (message, title = "Warning") => {
  Toast.show({
    type: "warning",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 40,
  });
};
