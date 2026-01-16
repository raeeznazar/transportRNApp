import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

const ScanLoader = ({ message = "Syncing with warehouse server" }) => {
  const { colors } = useCurrentTheme();
  const spinValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation for the circle
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    // Progress bar animation
    Animated.timing(progressValue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "70%"],
  });

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.appBg }}>
      {/* Animated Circle Loader */}
      <View className="mb-8">
        <Animated.View
          className="w-24 h-24 rounded-full border-4"
          style={{
            borderColor: colors.cardBorder,
            borderTopColor: colors.primary,
            transform: [{ rotate: spin }],
          }}
        />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold mb-6 text-center" style={{ color: colors.headingText }}>
        Processing Scan...
      </Text>

      {/* Progress Bar Container */}
      <View className="w-full max-w-sm mb-4">
        <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
          <Animated.View
            className="h-full rounded-full"
            style={{
              backgroundColor: colors.primary,
              width: progressWidth,
            }}
          />
        </View>
      </View>

      {/* Message */}
      <Text className="text-base text-center mb-12" style={{ color: colors.bodyText }}>
        {message}
      </Text>
    </View>
  );
};

export default ScanLoader;
