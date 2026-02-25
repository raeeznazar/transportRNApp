import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomActionBar({
  children,
  absolute = false,
  floating = false,
  floatingOffset = 8,
  floatingHorizontal = 16,
  left = 0,
  right = 0,
  bottom = 0,
  backgroundColor = "#fff",
  borderTopWidth = 1,
  borderTopColor = "#e2e8f040",
  paddingHorizontal = 16,
  paddingTop = 12,
  minPaddingBottom = 12,
  includeBottomInset = true,
  style,
  contentStyle,
}) {
  const insets = useSafeAreaInsets();

  const isFloating = floating || absolute;

  const resolvedLeft = floating ? floatingHorizontal : left;
  const resolvedRight = floating ? floatingHorizontal : right;
  const resolvedBottom = floating ? floatingOffset + (includeBottomInset ? insets.bottom : 0) : bottom;

  const containerBackgroundColor = floating ? "transparent" : backgroundColor;
  const containerBorderTopWidth = floating ? 0 : borderTopWidth;

  const innerPaddingHorizontal = floating ? 0 : paddingHorizontal;
  const innerPaddingTop = floating ? 0 : paddingTop;
  const innerPaddingBottom = floating ? 0 : Math.max(includeBottomInset ? insets.bottom : 0, minPaddingBottom);

  return (
    <View
      pointerEvents="box-none"
      style={[
        isFloating && {
          position: "absolute",
          left: resolvedLeft,
          right: resolvedRight,
          bottom: resolvedBottom,
        },
        {
          backgroundColor: containerBackgroundColor,
          borderTopWidth: containerBorderTopWidth,
          borderTopColor,
        },
        style,
      ]}
    >
      <View
        style={[
          {
            paddingHorizontal: innerPaddingHorizontal,
            paddingTop: innerPaddingTop,
            paddingBottom: innerPaddingBottom,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
