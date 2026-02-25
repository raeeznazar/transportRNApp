import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Calendar } from "react-native-calendars";

import { useCurrentTheme } from "../../stores/themeStore";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toLocalYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addDaysYMD = (ymd, days) => {
  const d = new Date(`${ymd}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toLocalYMD(d);
};

const DateRange = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onChange,
  onRangeComplete,
  label = "Select date range",
  minDate,
  maxDate,
  displayFormat = "DD MMM YY",
  autoCloseOnComplete = true,
}) => {
  const [visible, setVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [viewDate, setViewDate] = useState(null); // tracks which month calendar is showing
  const [pickerYear, setPickerYear] = useState(null);
  const theme = useCurrentTheme();
  const s = useMemo(() => styles(theme), [theme]);
  const yearScrollRef = useRef(null);

  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const today = useMemo(() => toLocalYMD(new Date()), []);
  const todayYear = useMemo(() => new Date().getFullYear(), []);
  const todayMonth = useMemo(() => new Date().getMonth(), []); // 0-indexed

  // years list: 10 years back up to today's year (for from), +5 future (for to)
  const yearList = useMemo(() => {
    const start = todayYear - 25;
    const end = todayYear + 5;
    const list = [];
    for (let y = start; y <= end; y++) list.push(y);
    return list;
  }, [todayYear]);

  const isPickingTo = useMemo(() => Boolean(fromDate && !toDate), [fromDate, toDate]);

  // FROM: max = today (never allow future), min = optional minDate prop (allow all past by default)
  const fromMinDate = minDate ?? undefined;
  const fromMaxDate = today;

  // TO: min = day AFTER fromDate (strictly later), max = optional maxDate prop (no upper limit by default)
  const toMinDate = useMemo(() => {
    if (!fromDate) return undefined;
    return addDaysYMD(fromDate, 1);
  }, [fromDate]);

  const calendarMinDate = isPickingTo ? toMinDate : fromMinDate;
  const calendarMaxDate = isPickingTo ? (maxDate ?? undefined) : fromMaxDate;

  // 3. format helper
  const formatDisplayDate = useCallback((dateString, format) => {
    if (!dateString) return "";
    const d = new Date(`${dateString}T00:00:00`);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    switch (format) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "DD MMM YY":
        return `${day} ${monthNamesShort[d.getMonth()]} ${String(year).slice(2)}`;
      case "DD MMM YYYY":
        return `${day} ${monthNamesShort[d.getMonth()]} ${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  }, []);

  // 4. open / close animations
  const openCalendar = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [opacityAnim, scaleAnim]);

  const closeCalendar = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 150, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [opacityAnim, scaleAnim]);

  // 5. emit helper
  const emitChange = useCallback(
    (nextFrom, nextTo) => {
      onFromDateChange?.(nextFrom);
      onToDateChange?.(nextTo);
      onChange?.({ fromDate: nextFrom, toDate: nextTo });
      if (nextFrom && nextTo) {
        onRangeComplete?.({ fromDate: nextFrom, toDate: nextTo });
      }
    },
    [onFromDateChange, onToDateChange, onChange, onRangeComplete]
  );

  // 6. clear
  const clearRange = useCallback(() => {
    emitChange(null, null);
  }, [emitChange]);

  // -- year/month picker helpers --
  const openPicker = useCallback(
    (currentYMD) => {
      const y = currentYMD ? parseInt(currentYMD.slice(0, 4)) : todayYear;
      setPickerYear(y);
      setShowPicker(true);
      // scroll to selected year after layout
      setTimeout(() => {
        const idx = yearList.indexOf(y);
        if (idx !== -1 && yearScrollRef.current) {
          yearScrollRef.current.scrollTo({ x: idx * 56, animated: false });
        }
      }, 50);
    },
    [todayYear, yearList]
  );

  const handlePickerMonthSelect = useCallback(
    (monthIndex) => {
      if (pickerYear == null) return;
      const mm = String(monthIndex + 1).padStart(2, "0");
      const newViewDate = `${pickerYear}-${mm}-01`;
      setViewDate(newViewDate);
      setShowPicker(false);
    },
    [pickerYear]
  );

  // month chip disabled logic: for from-picking, block future months
  const isMonthDisabled = useCallback(
    (monthIndex) => {
      if (!pickerYear) return false;
      if (isPickingTo) return false; // to-date: no upper month limit
      if (pickerYear > todayYear) return true;
      if (pickerYear === todayYear && monthIndex > todayMonth) return true;
      return false;
    },
    [pickerYear, isPickingTo, todayYear, todayMonth]
  );

  const renderHeader = useCallback(
    (date) => {
      const d = date instanceof Date ? date : new Date(date);
      const year = d.getFullYear();
      const monthName = MONTH_NAMES_FULL[d.getMonth()];
      const headerDate = toLocalYMD(d);
      return (
        <TouchableOpacity style={s.calendarHeaderBtn} onPress={() => openPicker(headerDate)} activeOpacity={0.7}>
          <Text style={s.calendarHeaderText}>
            {monthName} {year}
          </Text>
          <Ionicons name="chevron-down" size={14} color={theme.colors.buttonPrimaryBg} />
        </TouchableOpacity>
      );
    },
    [s, openPicker, theme.colors.buttonPrimaryBg]
  );

  // 7. handleDayPress — AFTER emitChange, closeCalendar, isPickingTo
  const handleDayPress = useCallback(
    (day) => {
      const selectedDate = day.dateString;

      if (!isPickingTo) {
        if (selectedDate > fromMaxDate) return;
        emitChange(selectedDate, null);
        return;
      }

      if (selectedDate <= fromDate) return;
      emitChange(fromDate, selectedDate);

      if (autoCloseOnComplete) closeCalendar();
    },
    [isPickingTo, fromMaxDate, fromDate, emitChange, autoCloseOnComplete, closeCalendar]
  );

  // 8. markedDates
  const markedDates = useMemo(() => {
    if (!fromDate) return {};
    const marks = {};
    marks[fromDate] = {
      startingDay: true,
      color: theme.colors.buttonPrimaryBg,
      textColor: theme.colors.buttonPrimaryText,
    };
    if (toDate) {
      let current = addDaysYMD(fromDate, 1);
      while (current < toDate) {
        marks[current] = {
          color: theme.colors.buttonSecondaryBg,
          textColor: theme.colors.inputText,
        };
        current = addDaysYMD(current, 1);
      }
      marks[toDate] = {
        endingDay: true,
        color: theme.colors.buttonPrimaryBg,
        textColor: theme.colors.buttonPrimaryText,
      };
    }
    return marks;
  }, [fromDate, toDate, theme.colors]);

  // 9. display label
  const dateValueLabel = useMemo(() => {
    if (!fromDate) return null;
    const from = formatDisplayDate(fromDate, displayFormat);
    const to = toDate ? formatDisplayDate(toDate, displayFormat) : "?";
    return `${from}  →  ${to}`;
  }, [fromDate, toDate, formatDisplayDate, displayFormat]);

  // 10. calendar current month — prefer explicit viewDate when user picks from picker
  const calendarCurrent = useMemo(() => {
    if (viewDate) return viewDate;
    if (isPickingTo && fromDate) return fromDate;
    if (fromDate) return fromDate;
    return today;
  }, [viewDate, isPickingTo, fromDate, today]);

  // 11. cleanup on unmount
  useEffect(() => {
    return () => {
      opacityAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, []);

  return (
    <>
      <TouchableOpacity style={s.inputContainer} onPress={openCalendar}>
        <View style={s.leftContent}>
          <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
          <Text style={dateValueLabel ? s.valueText : s.placeholder}>{dateValueLabel ?? label}</Text>
        </View>
        {(fromDate || toDate) && (
          <TouchableOpacity onPress={clearRange} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal transparent visible={visible} onRequestClose={closeCalendar}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeCalendar}>
          <Animated.View
            onStartShouldSetResponder={() => true}
            style={[s.calendarWrapper, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
          >
            <View style={s.headerRow}>
              <Text style={s.headerText}>{isPickingTo ? "Select end date" : "Select start date"}</Text>
              {(fromDate || toDate) && (
                <TouchableOpacity onPress={clearRange}>
                  <Text style={s.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <Calendar
              key={calendarCurrent}
              current={calendarCurrent}
              minDate={calendarMinDate}
              maxDate={calendarMaxDate}
              onDayPress={handleDayPress}
              onMonthChange={(monthData) => {
                setViewDate(`${monthData.year}-${String(monthData.month).padStart(2, "0")}-01`);
              }}
              theme={s.calendarStyle}
              markedDates={markedDates}
              markingType="period"
              enableSwipeMonths
              renderHeader={renderHeader}
            />

            {/* Year / Month picker panel */}
            {showPicker && (
              <View style={s.pickerPanel}>
                {/* Year row */}
                <ScrollView ref={yearScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.yearRow}>
                  {yearList.map((y) => {
                    const isYearDisabled = !isPickingTo && y > todayYear;
                    const selected = y === pickerYear;
                    return (
                      <TouchableOpacity
                        key={y}
                        onPress={() => !isYearDisabled && setPickerYear(y)}
                        style={[s.yearChip, selected && s.yearChipSelected, isYearDisabled && s.chipDisabled]}
                        activeOpacity={isYearDisabled ? 1 : 0.7}
                      >
                        <Text style={[s.yearChipText, selected && s.yearChipTextSelected, isYearDisabled && s.chipTextDisabled]}>{y}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Month grid */}
                <View style={s.monthGrid}>
                  {MONTHS.map((m, i) => {
                    const disabled = isMonthDisabled(i);
                    const currentViewMonth = viewDate ? parseInt(viewDate.slice(5, 7)) - 1 : new Date(calendarCurrent).getMonth();
                    const currentViewYear = viewDate ? parseInt(viewDate.slice(0, 4)) : new Date(calendarCurrent).getFullYear();
                    const selected = i === currentViewMonth && pickerYear === currentViewYear;
                    return (
                      <TouchableOpacity
                        key={m}
                        onPress={() => !disabled && handlePickerMonthSelect(i)}
                        style={[s.monthChip, selected && s.monthChipSelected, disabled && s.chipDisabled]}
                        activeOpacity={disabled ? 1 : 0.7}
                      >
                        <Text style={[s.monthChipText, selected && s.monthChipTextSelected, disabled && s.chipTextDisabled]}>{m}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity onPress={() => setShowPicker(false)} style={s.pickerCancelBtn}>
                  <Text style={s.pickerCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {toDate && !showPicker && (
              <View style={s.footerRow}>
                <TouchableOpacity style={s.footerButton} onPress={closeCalendar}>
                  <Text style={s.footerButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    inputContainer: {
      width: "100%",
      height: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      paddingHorizontal: 14,
      backgroundColor: theme.colors.inputBg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leftContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    placeholder: {
      color: theme.colors.inputPlaceholder,
      fontSize: 16,
      flex: 1,
    },
    valueText: {
      color: theme.colors.inputText,
      fontSize: 16,
      flex: 1,
      fontFamily: "Figtree-Regular",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center",
      padding: 20,
    },
    calendarWrapper: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: 16,
      paddingVertical: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },
    headerRow: {
      paddingHorizontal: 14,
      paddingBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerText: {
      fontSize: 14,
      color: theme.colors.headingText,
      fontFamily: "Figtree-SemiBold",
    },
    clearText: {
      fontSize: 13,
      color: theme.colors.buttonPrimaryBg,
      fontFamily: "Figtree-SemiBold",
    },
    footerRow: {
      paddingTop: 8,
      paddingHorizontal: 14,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    footerButton: {
      backgroundColor: theme.colors.buttonPrimaryBg,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    footerButtonText: {
      color: theme.colors.buttonPrimaryText,
      fontSize: 13,
      fontFamily: "Figtree-SemiBold",
    },
    calendarStyle: {
      calendarBackground: theme.colors.cardBg,
      selectedDayBackgroundColor: theme.colors.buttonPrimaryBg,
      selectedDayTextColor: theme.colors.buttonPrimaryText,
      todayTextColor: theme.colors.primary,
      dayTextColor: theme.colors.inputText,
      textDisabledColor: theme.colors.inputPlaceholder,
      monthTextColor: theme.colors.headingText,
      textMonthFontWeight: "700",
      arrowColor: theme.colors.buttonPrimaryBg,
      textSectionTitleColor: theme.colors.accent,
      textDayFontSize: 14,
      textMonthFontSize: 20,
      textDayHeaderFontSize: 12,
    },
    calendarHeaderBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    calendarHeaderText: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.headingText,
    },
    pickerPanel: {
      marginHorizontal: 10,
      marginTop: 4,
      marginBottom: 6,
      backgroundColor: theme.colors.appBg,
      borderRadius: 12,
      paddingTop: 10,
      paddingBottom: 6,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
    },
    yearRow: {
      paddingHorizontal: 10,
      gap: 6,
      alignItems: "center",
    },
    yearChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
    },
    yearChipSelected: {
      backgroundColor: theme.colors.buttonPrimaryBg,
      borderColor: theme.colors.buttonPrimaryBg,
    },
    yearChipText: {
      fontSize: 13,
      color: theme.colors.inputText,
      fontWeight: "600",
    },
    yearChipTextSelected: {
      color: theme.colors.buttonPrimaryText,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 10,
      paddingTop: 10,
      gap: 6,
    },
    monthChip: {
      width: "22%",
      alignItems: "center",
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      marginBottom: 2,
    },
    monthChipSelected: {
      backgroundColor: theme.colors.buttonPrimaryBg,
      borderColor: theme.colors.buttonPrimaryBg,
    },
    monthChipText: {
      fontSize: 13,
      color: theme.colors.inputText,
      fontWeight: "500",
    },
    monthChipTextSelected: {
      color: theme.colors.buttonPrimaryText,
      fontWeight: "700",
    },
    chipDisabled: {
      opacity: 0.3,
    },
    chipTextDisabled: {
      color: theme.colors.inputPlaceholder,
    },
    pickerCancelBtn: {
      alignSelf: "flex-end",
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginTop: 4,
    },
    pickerCancelText: {
      fontSize: 13,
      color: theme.colors.inputPlaceholder,
    },
  });

export default memo(DateRange);

{
  /* <View style={{ padding: 16 }}>
      <DateRange
        // ─── Required ───────────────────────────────────────────────
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={(date) => {
          // date → "YYYY-MM-DD" or null (when cleared)
          setFromDate(date);
        }}
        onToDateChange={(date) => {
          // date → "YYYY-MM-DD" or null (when cleared)
          setToDate(date);
        }}

        // ─── Optional ───────────────────────────────────────────────
        label="Select date range"        // placeholder shown when no date selected
                                         // default: "Select date range"

        onChange={({ fromDate, toDate }) => {
          // combined callback fired on every change
          // useful when you don't want two separate handlers
          console.log("From:", fromDate); // "YYYY-MM-DD" or null
          console.log("To  :", toDate);   // "YYYY-MM-DD" or null
        }}

        minDate="2020-01-01"             // from-date lower bound (YYYY-MM-DD)
                                         // default: no restriction

        maxDate="2026-12-31"             // to-date upper bound (YYYY-MM-DD)
                                         // default: no restriction
                                         // note: from-date is always capped to today

        displayFormat="DD MMM YY"        // how dates are shown in the input field
                                         // "DD/MM/YYYY" → 27/02/26
                                         // "DD MMM YY"  → 27 Feb 26  (default)
                                         // "DD MMM YYYY"→ 27 Feb 2026

        autoCloseOnComplete={true}       // close modal after toDate is selected
                                         // default: true
                                         // set false to keep modal open after selection
      />
    </View> */
}
