import { ActivityIndicator, Platform, Pressable, Text } from "react-native";
import { useThemeName } from "../../stores/themeStore";

export const Button = ({ variant = "primary", size = "md", disabled = false, loading = false, onPress, children, className = "" }) => {
  const themeName = useThemeName(); // Returns 'steelBlue', 'modernBlue', etc.
  const isDisabled = disabled || loading;

  // Base Tailwind classes
  const baseStyles = "flex-row items-center justify-center rounded-xl";

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

  return (
    <Pressable
      className={`${baseStyles} ${getVariantStyles()} ${sizeStyles[size]} ${className}`}
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={
        !isDisabled
          ? {
              color: variant === "secondary" ? "#94A3B8" : "rgba(255, 255, 255, 0.3)",
              borderless: false,
            }
          : undefined
      }
      style={({ pressed }) => [
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
        // iOS press feedback
        Platform.OS === "ios" &&
          pressed &&
          !isDisabled && {
            opacity: 0.8,
            transform: [{ scale: 0.98 }],
          },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getIndicatorColor()} size="small" />
      ) : (
        <Text className={`${getTextVariantStyles()} ${textSizeStyles[size]} font-semibold`}>{children}</Text>
      )}
    </Pressable>
  );
};
