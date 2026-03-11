import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Calendar } from "react-native-calendars";

import { useCurrentTheme } from "../../stores/themeStore";

/**
 * CalendarInput Component
 *
 * @param {Object} props - Component props
 * @param {string} [props.label] - Placeholder text to show when no date is selected
 * @param {string} [props.value] - Current selected date in YYYY-MM-DD format
 * @param {Function} props.onChange - Callback function called when date is selected. Receives dateString as parameter
 * @param {string} [props.minDate] - Minimum selectable date in YYYY-MM-DD format
 * @param {string} [props.maxDate] - Maximum selectable date in YYYY-MM-DD format
 * @param {string} [props.displayFormat="DD/MM/YYYY"] - Format to display the selected date
 *   Available formats: "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY",
 *   "DD MMM YYYY", "DD MMMM YYYY", "MMM DD, YYYY", "MMMM DD, YYYY"
 * @param {boolean} [props.restrictToPast=false] - If true, restricts selection to dates within the past 7 days (including today)
 * @param {number} [props.pastDaysLimit=7] - Number of days in the past to allow selection when restrictToPast is true
 * @param {boolean} [props.disableFuture=false] - If true, disables selection of future dates
 * @param {boolean} [props.disabled=false] - If true, disables the entire input
 * @param {Object} [props.containerStyle] - Style object for the outer container
 * @param {Object} [props.inputStyle] - Style object for the input container
 * @param {string} [props.placeholderColor] - Color for placeholder text
 * @param {string} [props.iconColor] - Color for the calendar icon
 *
 * @example
 * // Basic usage
 * <CalendarInput
 *   label="Select Date"
 *   value={date}
 *   onChange={setDate}
 * />
 *
 * @example
 * // Restrict to past 7 days only
 * <CalendarInput
 *   label="Select Date"
 *   value={date}
 *   onChange={setDate}
 *   restrictToPast={true}
 *   pastDaysLimit={7}
 * />
 *
 * @example
 * // Block future dates
 * <CalendarInput
 *   label="Select Date"
 *   value={date}
 *   onChange={setDate}
 *   disableFuture={true}
 * />
 *
 * @example
 * // Custom date range
 * <CalendarInput
 *   label="Select Date"
 *   value={date}
 *   onChange={setDate}
 *   minDate="2023-01-01"
 *   maxDate="2023-12-31"
 *   displayFormat="MMM DD, YYYY"
 * />
 */
const CalendarInput = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  displayFormat = "DD/MM/YYYY",
  restrictToPast = false,
  pastDaysLimit = 7,
  disableFuture = false,
  disabled = false,
  containerStyle,
  inputStyle,
  placeholderColor,
  iconColor,
}) => {
  const [visible, setVisible] = useState(false);
  const theme = useCurrentTheme();
  const s = useMemo(() => styles(theme), [theme]);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split("T")[0];

  // Calculate date restrictions
  const calculatedMinDate = useMemo(() => {
    if (restrictToPast) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - pastDaysLimit);
      return pastDate.toISOString().split("T")[0];
    }
    return minDate;
  }, [restrictToPast, pastDaysLimit, minDate]);

  const calculatedMaxDate = useMemo(() => {
    if (disableFuture || restrictToPast) {
      return today;
    }
    return maxDate;
  }, [disableFuture, restrictToPast, today, maxDate]);

  /**
   * Formats a date string according to the specified format
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @param {string} format - Display format
   * @returns {string} Formatted date string
   */
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
    if (disabled) return;

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
  }, [disabled]);

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
      <View style={[s.row, containerStyle]}>
        <TouchableOpacity style={[s.inputContainer, disabled && s.disabledInput, inputStyle]} onPress={openCalendar} disabled={disabled}>
          <Text style={[value ? s.valueText : s.placeholder, { color: placeholderColor && !value ? placeholderColor : undefined }]}>
            {value ? formatDisplayDate(value, displayFormat) : label}
          </Text>
          <Ionicons name="calendar-outline" size={22} color={iconColor || (disabled ? theme.colors.inputPlaceholder : "#9CA3AF")} />
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
              minDate={calculatedMinDate}
              maxDate={calculatedMaxDate}
              onDayPress={handleDayPress}
              theme={s.calendarStyle}
              markedDates={value ? { [value]: { selected: true } } : {}}
              enableSwipeMonths={true}
              hideExtraDays={true}
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
      height: 44,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      paddingHorizontal: 14,
      backgroundColor: theme.colors.inputBg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    disabledInput: {
      backgroundColor: theme.colors.inputDisabledBg || theme.colors.inputBg,
      opacity: 0.6,
    },

    inputBg: "#FFFFFF",

    placeholder: {
      color: "#9CA3AF",
      fontSize: 14,
    },

    valueText: {
      color: theme.colors.inputText,
      fontSize: 14,
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
