import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme, useThemeName, useThemeStore } from "../../stores/themeStore";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const themeName = useThemeName();
  const theme = useCurrentTheme();
  const { setTheme } = useThemeStore();

  const themeOptions = [
    {
      name: "steelBlue",
      label: "Steel Blue",
      description: "Classic steel-gray with professional blue accents",
      icon: "business-outline",
      primaryColor: "#1E3A8A",
      secondaryColor: "#3F4C6E",
      accentColor: "#64748B",
    },
    {
      name: "modernBlue",
      label: "Modern Blue",
      description: "Vibrant modern blue with clean design",
      icon: "color-palette-outline",
      primaryColor: "#1D4ED8",
      secondaryColor: "#3B82F6",
      accentColor: "#60A5FA",
    },
    {
      name: "darkSlate",
      label: "Dark Slate",
      description: "Deep navy with cyan accents for a bold look",
      icon: "moon-outline",
      primaryColor: "#0F172A",
      secondaryColor: "#334155",
      accentColor: "#0EA5E9",
    },
    // Add more themes here in the future
  ];

  const handleThemeSelect = async (newThemeName) => {
    if (newThemeName === themeName) return; // Already selected
    await setTheme(newThemeName);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.appBg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.headingText }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.colors.bodyText }]}>Customize your app experience</Text>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.subHeadingText }]}>Theme Selection</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.colors.bodyText }]}>Choose your preferred color theme</Text>

          {/* Theme Options */}
          <View style={styles.themeGrid}>
            {themeOptions.map((option) => {
              const isSelected = themeName === option.name;

              return (
                <TouchableOpacity
                  key={option.name}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: theme.colors.cardBg,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleThemeSelect(option.name)}
                  activeOpacity={0.7}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: theme.colors.success }]}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}

                  {/* Theme Icon */}
                  <View style={styles.themeIconContainer}>
                    <Ionicons name={option.icon} size={32} color={isSelected ? theme.colors.primary : theme.colors.accent} />
                  </View>

                  {/* Color Preview */}
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorDot, { backgroundColor: option.primaryColor }]} />
                    <View style={[styles.colorDot, { backgroundColor: option.secondaryColor }]} />
                    <View style={[styles.colorDot, { backgroundColor: option.accentColor }]} />
                  </View>

                  {/* Theme Info */}
                  <Text style={[styles.themeName, { color: theme.colors.cardHeading }]}>{option.label}</Text>
                  <Text style={[styles.themeDescription, { color: theme.colors.bodyText }]} numberOfLines={2}>
                    {option.description}
                  </Text>

                  {/* Active Indicator */}
                  {isSelected && (
                    <View style={styles.activeIndicator}>
                      <Text style={[styles.activeText, { color: theme.colors.primary }]}>Active</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.subHeadingText }]}>App Information</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.bodyText }]}>Version</Text>
              <Text style={[styles.infoValue, { color: theme.colors.cardHeading }]}>1.0.0</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.cardBorder }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.bodyText }]}>Build</Text>
              <Text style={[styles.infoValue, { color: theme.colors.cardHeading }]}>2025.01.01</Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={[styles.noteContainer, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder }]}>
          <Ionicons name="bulb-outline" size={20} color={theme.colors.accent} />
          <Text style={[styles.noteText, { color: theme.colors.bodyText }]}>Theme changes apply instantly throughout the app</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 36,
  },
  themeGrid: {
    gap: 16,
  },
  themeCard: {
    borderRadius: 16,
    padding: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  themeIconContainer: {
    marginBottom: 12,
  },
  colorPreview: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  themeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  activeIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  activeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
