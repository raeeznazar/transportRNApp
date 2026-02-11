import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

export const ScanToast = ({ visible, type = "success", title, message, onHide }) => {
  const { colors } = useCurrentTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 1.5 seconds
      const timer = setTimeout(() => {
        hideToast();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const config = {
    success: {
      icon: "checkmark-circle",
      iconColor: "#059669",
      bgColor: "#059669",
    },
    error: {
      icon: "close-circle",
      iconColor: "#DC2626",
      bgColor: "#DC2626",
    },
    warning: {
      icon: "warning-circle",
      iconColor: "#D97706",
      bgColor: "#D97706",
    },
  };

  const currentConfig = config[type] || config.success;

  return (
    <Animated.View
      className="absolute inset-0 z-50 flex items-center justify-center px-10"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        opacity: fadeAnim,
      }}
    >
      <Animated.View
        className="w-full max-w-[280px] rounded-2xl shadow-xl p-8 flex flex-col items-center"
        style={{
          backgroundColor: colors.cardBg + "F2", // 95% opacity
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Icon Container */}
        <View
          className="mb-5 flex items-center justify-center h-16 w-16 rounded-full"
          style={{
            backgroundColor: currentConfig.bgColor + "1A", // 10% opacity
          }}
        >
          <Ionicons name={currentConfig.icon} size={40} color={currentConfig.iconColor} />
        </View>

        {/* Content */}
        <View className="text-center items-center">
          <Text className="text-xl font-bold leading-tight mb-2 text-center" style={{ color: colors.text }}>
            {title}
          </Text>
          <Text className="text-sm font-normal text-center" style={{ color: colors.secondaryText }}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};
