import { useRef } from "react";
import { ActivityIndicator, Animated, Platform, Text, TouchableOpacity, Vibration } from "react-native";
import { useThemeName } from "../../stores/themeStore";
export const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onPress,
  children,
  className = "",
  fullWidth = false,
}) => {
  const themeName = useThemeName(); // Returns 'steelBlue', 'modernBlue', etc.
  const isDisabled = disabled || loading;

  // Animated values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Base Tailwind classes
  const baseStyles = `flex-row items-center justify-center rounded-xl ${fullWidth ? "w-full" : ""}`;

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  // Text size styles
  const textSizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Theme variant configurations - ADD NEW THEMES HERE
  const themeVariants = {
    steelBlue: {
      primary: "bg-steelBlue-buttonPrimaryBg",
      secondary: "bg-steelBlue-buttonSecondaryBg border border-steelBlue-buttonSecondaryBorder",
      danger: "bg-steelBlue-buttonDangerBg",
      disabled: "bg-steelBlue-buttonDisabledBg",
    },
    modernBlue: {
      primary: "bg-modernBlue-buttonPrimaryBg",
      secondary: "bg-modernBlue-buttonSecondaryBg border border-modernBlue-buttonSecondaryBorder",
      danger: "bg-modernBlue-buttonDangerBg",
      disabled: "bg-modernBlue-buttonDisabledBg",
    },
    darkSlate: {
      primary: "bg-darkSlate-buttonPrimaryBg",
      secondary: "bg-darkSlate-buttonSecondaryBg border border-darkSlate-buttonSecondaryBorder",
      danger: "bg-darkSlate-buttonDangerBg",
      disabled: "bg-darkSlate-buttonDisabledBg",
    },
  };

  // Theme text configurations - ADD NEW THEMES HERE
  const themeTextVariants = {
    steelBlue: {
      primary: "text-steelBlue-buttonPrimaryText",
      secondary: "text-steelBlue-buttonSecondaryText",
      danger: "text-steelBlue-buttonDangerText",
      disabled: "text-steelBlue-buttonDisabledText",
    },
    modernBlue: {
      primary: "text-modernBlue-buttonPrimaryText",
      secondary: "text-modernBlue-buttonSecondaryText",
      danger: "text-modernBlue-buttonDangerText",
      disabled: "text-modernBlue-buttonDisabledText",
    },
    darkSlate: {
      primary: "text-darkSlate-buttonPrimaryText",
      secondary: "text-darkSlate-buttonSecondaryText",
      danger: "text-darkSlate-buttonDangerText",
      disabled: "text-darkSlate-buttonDisabledText",
    },
  };

  // ActivityIndicator colors for secondary variant - ADD NEW THEMES HERE
  const secondaryIndicatorColors = {
    steelBlue: "#334155",
    modernBlue: "#1E3A8A",
    darkSlate: "#0F172A",
  };

  // Get variant styles based on current theme
  const getVariantStyles = () => {
    const currentTheme = themeVariants[themeName] || themeVariants.steelBlue; // Fallback to steelBlue

    if (isDisabled) {
      return currentTheme.disabled;
    }

    return currentTheme[variant] || currentTheme.primary;
  };

  // Get text variant styles based on current theme
  const getTextVariantStyles = () => {
    const currentTheme = themeTextVariants[themeName] || themeTextVariants.steelBlue; // Fallback to steelBlue

    if (isDisabled) {
      return currentTheme.disabled;
    }

    return currentTheme[variant] || currentTheme.primary;
  };

  // Get ActivityIndicator color
  const getIndicatorColor = () => {
    if (variant === "secondary") {
      return secondaryIndicatorColors[themeName] || secondaryIndicatorColors.steelBlue;
    }
    return "#FFFFFF";
  };

  const handlePressIn = () => {
    if (isDisabled) return;

    // Trigger light vibration
    Vibration.vibrate(Platform.OS === "ios" ? [10, 5] : 10);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.88,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.65,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };
  const handlePressOut = () => {
    if (isDisabled) return;

    // Trigger press complete vibration
    Vibration.vibrate(Platform.OS === "ios" ? [5] : 5);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 6,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      className={`${baseStyles} ${getVariantStyles()} ${sizeStyles[size]} ${className}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <Animated.View
        style={[
          // iOS shadow when not disabled
          Platform.OS === "ios" &&
            !isDisabled && {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
          // Android elevation when not disabled
          Platform.OS === "android" &&
            !isDisabled && {
              elevation: 2,
            },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getIndicatorColor()} size="small" />
        ) : (
          <Text className={`${getTextVariantStyles()} ${textSizeStyles[size]} font-semibold`}>{children}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};
