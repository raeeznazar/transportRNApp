import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Calendar } from "react-native-calendars";

import { useCurrentTheme } from "../../stores/themeStore";

const CalendarInput = ({ label, value, onChange, minDate, maxDate, displayFormat = "DD/MM/YYYY" }) => {
  const [visible, setVisible] = useState(false);
  const theme = useCurrentTheme();
  const s = useMemo(() => styles(theme), [theme]);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split("T")[0];

  const formatDisplayDate = (dateString, format) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthNamesFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    switch (format) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "DD-MM-YYYY":
        return `${day}-${month}-${year}`;
      case "DD MMM YYYY":
        return `${day} ${monthNamesShort[date.getMonth()]} ${year}`;
      case "DD MMMM YYYY":
        return `${day} ${monthNamesFull[date.getMonth()]} ${year}`;
      case "MMM DD, YYYY":
        return `${monthNamesShort[date.getMonth()]} ${day}, ${year}`;
      case "MMMM DD, YYYY":
        return `${monthNamesFull[date.getMonth()]} ${day}, ${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  useEffect(() => {
    return () => {
      scaleAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, []);

  const openCalendar = useCallback(() => {
    setVisible(true);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeCalendar = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, []);

  const handleDayPress = useCallback(
    (day) => {
      onChange(day.dateString);
      closeCalendar();
    },
    [onChange, closeCalendar]
  );

  return (
    <>
      <View style={s.row}>
        <TouchableOpacity style={s.inputContainer} onPress={openCalendar}>
          <Text style={value ? s.valueText : s.placeholder}>{value ? formatDisplayDate(value, displayFormat) : label}</Text>
          <Ionicons name="calendar-outline" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={visible}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeCalendar}>
          <Animated.View
            onStartShouldSetResponder={() => true}
            style={[
              s.calendarWrapper,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Calendar
              current={value || today}
              minDate={minDate}
              maxDate={maxDate}
              onDayPress={handleDayPress}
              theme={s.calendarStyle}
              markedDates={value ? { [value]: { selected: true } } : {}}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },

    inputContainer: {
      width: "100%",
      height: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.inputBg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    inputBg: "#FFFFFF",

    placeholder: {
      color: "#9CA3AF",
      fontSize: 16,
    },

    valueText: {
      color: "#8C939D",
      fontSize: 16,
      fontFamily: "Figtree-Regular",
    },

    icon: {
      width: 22,
      height: 24,
      resizeMode: "contain",
    },

    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center",
      padding: 20,
    },

    calendarWrapper: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      paddingVertical: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },

    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "green",
    },

    halfDayContainer: {
      flex: 0.25,
      alignItems: "center",
      marginTop: 24,
    },

    halfDayText: {
      fontSize: 14,
      color: "#374151",
      marginBottom: 6,
    },

    descriptionContainer: {
      marginTop: 24,
    },

    label: {
      fontSize: 14,
      fontWeight: "500",
      color: "#374151",
      marginBottom: 8,
    },

    textArea: {
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
      color: "#111827",
      minHeight: 100,
      backgroundColor: "#FFFFFF",
    },

    calendarStyle: {
      // Background
      calendarBackground: theme.colors.cardBg,

      // Selected day
      selectedDayBackgroundColor: theme.colors.buttonPrimaryBg,
      selectedDayTextColor: theme.colors.buttonPrimaryText,

      // Today
      todayTextColor: theme.colors.primary,
      todayBackgroundColor: theme.colors.buttonSecondaryBg,

      // Day text
      dayTextColor: theme.colors.inputText,
      textDisabledColor: theme.colors.inputPlaceholder,

      // Month/year header
      monthTextColor: theme.colors.headingText,
      textMonthFontWeight: "700",

      // Navigation arrows
      arrowColor: theme.colors.buttonPrimaryBg,

      // Day-of-week header
      textSectionTitleColor: theme.colors.accent,

      // Dot markers
      dotColor: theme.colors.buttonPrimaryBg,
      selectedDotColor: theme.colors.buttonPrimaryText,

      // Font sizes
      textDayFontSize: 14,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 12,
    },
  });

export default memo(CalendarInput);
