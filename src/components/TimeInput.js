import DateTimePicker from "@react-native-community/datetimepicker";
import { Clock } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "../../stores/themeStore";

/* ---------------- HELPERS ---------------- */
const formatTime = (date) => {
  if (!date) return null;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinute = String(minutes).padStart(2, "0");
  return `${displayHour}:${displayMinute} ${ampm}`;
};

/**
 * Builds a Date object for today with the given hour:minute, used when
 * comparing minTime / maxTime so the day portion stays consistent.
 */
const todayAt = (source) => {
  if (!source) return null;
  const d = new Date();
  d.setHours(source.getHours(), source.getMinutes(), 0, 0);
  return d;
};

/* ------------------------------------------------------------------ */
/*  TimeInput                                                           */
/* ------------------------------------------------------------------ */
/**
 * Props:
 *  label          (string)   – optional field label
 *  value          (Date)     – currently selected time (Date object or null)
 *  onChange       (fn)       – called with a new Date when user confirms
 *  placeholder    (string)   – text shown when no time is selected
 *  disablePast    (bool)     – block times strictly before now
 *  disableFuture  (bool)     – block times strictly after now
 *  minTime        (Date)     – custom earliest allowed time (hour/minute used)
 *  maxTime        (Date)     – custom latest  allowed time (hour/minute used)
 *  disabled       (bool)     – makes field non-interactive
 *  containerStyle / labelStyle / inputStyle – style overrides
 */
const TimeInput = ({
  label,
  value,
  onChange,
  placeholder = "Select time",
  disablePast = false,
  disableFuture = false,
  minTime = null,
  maxTime = null,
  disabled = false,
  containerStyle,
  labelStyle,
  inputStyle,
}) => {
  const { theme } = useThemeStore();
  const { colors } = theme;
  const styles = makeStyles(colors);

  // Internal picker state
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(value ?? new Date());
  const [error, setError] = useState(null);

  /* ---------- derive effective min / max ---------- */
  const now = new Date();
  const effectiveMin = (() => {
    const candidates = [];
    if (disablePast) candidates.push(now);
    if (minTime) candidates.push(todayAt(minTime));
    if (!candidates.length) return null;
    return candidates.reduce((a, b) => (a > b ? a : b));
  })();

  const effectiveMax = (() => {
    const candidates = [];
    if (disableFuture) candidates.push(now);
    if (maxTime) candidates.push(todayAt(maxTime));
    if (!candidates.length) return null;
    return candidates.reduce((a, b) => (a < b ? a : b));
  })();

  /* ---------- base date used by picker ---------- */
  // We keep picker on "today" so minimumDate/maximumDate work correctly
  // since the picker uses full Date objects.
  const pickerBase = (() => {
    const base = new Date();
    if (value) {
      base.setHours(value.getHours(), value.getMinutes(), 0, 0);
    }
    return base;
  })();

  /* ---------- handlers ---------- */
  const openPicker = useCallback(() => {
    if (disabled) return;
    setDraft(pickerBase);
    setError(null);
    setVisible(true);
  }, [disabled, pickerBase]);

  const handleAndroidChange = useCallback(
    (event, selected) => {
      setVisible(false);
      if (event.type === "dismissed" || !selected) return;

      const validated = validate(selected, effectiveMin, effectiveMax);
      if (validated.ok) {
        onChange?.(selected);
      } else {
        setError(validated.message);
      }
    },
    [effectiveMin, effectiveMax, onChange]
  );

  const handleIOSChange = useCallback((_, selected) => {
    if (selected) setDraft(selected);
  }, []);

  const confirmIOS = useCallback(() => {
    const validated = validate(draft, effectiveMin, effectiveMax);
    if (validated.ok) {
      setError(null);
      onChange?.(draft);
      setVisible(false);
    } else {
      setError(validated.message);
    }
  }, [draft, effectiveMin, effectiveMax, onChange]);

  const cancelIOS = useCallback(() => {
    setError(null);
    setVisible(false);
  }, []);

  /* ---------- render ---------- */
  const displayValue = value ? formatTime(value) : null;
  const hasValue = !!displayValue;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

      {/* Pressable Field */}
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [styles.field, disabled && styles.fieldDisabled, pressed && !disabled && styles.fieldPressed, inputStyle]}
        accessibilityRole="button"
        accessibilityLabel={label ?? "Time input"}
        accessibilityValue={{ text: displayValue ?? placeholder }}
      >
        <View style={styles.fieldRow}>
          <Clock size={16} color={disabled ? colors.inputPlaceholder : colors.accent} strokeWidth={1.8} style={styles.clockIcon} />
          <Text style={[styles.fieldText, !hasValue && styles.placeholder, disabled && styles.disabledText]} numberOfLines={1}>
            {displayValue ?? placeholder}
          </Text>
        </View>
      </Pressable>

      {/* Inline error */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* ---- Android: native dialog ---- */}
      {Platform.OS === "android" && visible && (
        <DateTimePicker
          value={draft}
          mode="time"
          is24Hour={false}
          display="default"
          minimumDate={effectiveMin ?? undefined}
          maximumDate={effectiveMax ?? undefined}
          onChange={handleAndroidChange}
        />
      )}

      {/* ---- iOS: custom bottom-sheet modal ---- */}
      {Platform.OS === "ios" && (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={cancelIOS}>
          <Pressable style={styles.backdrop} onPress={cancelIOS} />
          <View style={styles.sheet}>
            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={cancelIOS} style={styles.sheetBtn}>
                <Text style={[styles.sheetBtnText, { color: colors.danger }]}>Cancel</Text>
              </TouchableOpacity>

              {label ? (
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  {label}
                </Text>
              ) : (
                <View />
              )}

              <TouchableOpacity onPress={confirmIOS} style={styles.sheetBtn}>
                <Text style={[styles.sheetBtnText, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Error inside sheet */}
            {error ? <Text style={[styles.error, { textAlign: "center", marginTop: 4 }]}>{error}</Text> : null}

            {/* Picker */}
            <DateTimePicker
              value={draft}
              mode="time"
              display="spinner"
              is24Hour={false}
              minimumDate={effectiveMin ?? undefined}
              maximumDate={effectiveMax ?? undefined}
              onChange={handleIOSChange}
              style={styles.picker}
              textColor={colors.inputText}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*  Validation helper                                                   */
/* ------------------------------------------------------------------ */
const toMinutes = (d) => d.getHours() * 60 + d.getMinutes();

const validate = (selected, min, max) => {
  const sel = toMinutes(selected);
  if (min && sel < toMinutes(min)) {
    return { ok: false, message: `Time cannot be before ${formatTime(min)}` };
  }
  if (max && sel > toMinutes(max)) {
    return { ok: false, message: `Time cannot be after ${formatTime(max)}` };
  }
  return { ok: true };
};

/* ------------------------------------------------------------------ */
/*  Dynamic styles                                                      */
/* ------------------------------------------------------------------ */
const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginTop: 12,
    },

    label: {
      fontSize: 12,
      color: colors.headingText,
      marginBottom: 6,
      fontFamily: "Figtree-Regular",
      fontWeight: "500",
    },

    field: {
      height: 44,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 14,
      backgroundColor: colors.inputBg,
      justifyContent: "center",
    },

    fieldRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    fieldDisabled: {
      backgroundColor: colors.buttonDisabledBg,
      borderColor: colors.inputBorder,
    },

    fieldPressed: {
      borderColor: colors.primary,
      backgroundColor: colors.inputBg,
    },

    fieldText: {
      flex: 1,
      fontSize: 14,
      color: colors.inputText,
      fontFamily: "Figtree-Regular",
      marginLeft: 8,
      marginTop: 12,
    },

    placeholder: {
      color: colors.inputPlaceholder,
    },

    disabledText: {
      color: colors.inputPlaceholder,
    },

    error: {
      fontSize: 12,
      color: colors.danger,
      marginTop: 4,
      fontFamily: "Figtree-Regular",
    },

    /* iOS modal */
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
    },

    sheet: {
      backgroundColor: colors.cardBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 34,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 12,
    },

    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },

    sheetTitle: {
      fontSize: 16,
      fontFamily: "Figtree-Regular",
      color: colors.headingText,
      flex: 1,
      textAlign: "center",
      marginHorizontal: 8,
    },

    sheetBtn: {
      minWidth: 60,
    },

    sheetBtnText: {
      fontSize: 16,
      fontFamily: "Figtree-Regular",
      fontWeight: "600",
    },

    picker: {
      width: "100%",
    },
    clockIcon: {
      marginLeft: 4,
      marginTop: 12,
    },
  });

export default React.memo(TimeInput);

// // Basic
// <TimeInput label="Pickup Time" value={time} onChange={setTime} />

// // No past times
// <TimeInput label="Departure" value={time} onChange={setTime} disablePast />

// // Window between 09:00 and 17:00
// const nine = new Date(); nine.setHours(9, 0);
// const five = new Date(); five.setHours(17, 0);
// <TimeInput label="Slot" value={time} onChange={setTime} minTime={nine} maxTime={five} />
