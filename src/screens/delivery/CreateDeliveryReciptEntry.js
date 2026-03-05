import { Ionicons } from "@expo/vector-icons";
import { Printer } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "../../../stores/themeStore";
import BottomActionBar from "../../components/BottomActionBar";
import { Button } from "../../components/Button";
import CalendarInput from "../../components/CalendarInput";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";
import Input from "../../components/Input";
import TimeInput from "../../components/TimeInput";

/* ------------------------------------------------------------------ */
/*  Static option lists                                                  */
/* ------------------------------------------------------------------ */
const DELIVERY_TYPE_OPTIONS = [
  { label: "Home Delivery", value: "home" },
  { label: "Branch Pickup", value: "branch" },
  { label: "Door Delivery", value: "door" },
];

const DOCKET_OPTIONS = [
  { label: "Customer A", value: "cust_a" },
  { label: "Customer B", value: "cust_b" },
  { label: "Customer C", value: "cust_c" },
];

const STATUS_OPTIONS = ["Pending", "Delivered", "Cancelled"];

const PAY_MODE_OPTIONS = [
  { label: "Cash", value: "cash" },
  { label: "Cheque", value: "cheque" },
  { label: "Bank", value: "bank" },
  { label: "UPI", value: "upi" },
  { label: "Credit", value: "credit" },
];

const TO_ACCOUNT_OPTIONS = [
  { label: "Main Branch A", value: "main_a" },
  { label: "Main Branch B", value: "main_b" },
];

const BANK_ACCOUNT_OPTIONS = [
  { label: "HDFC Bank - 501002...", value: "hdfc_501" },
  { label: "SBI Bank - 301001...", value: "sbi_301" },
];

const IDENTITY_TYPE_OPTIONS = [
  { label: "Aadhaar Card", value: "aadhaar" },
  { label: "PAN Card", value: "pan" },
  { label: "Passport", value: "passport" },
  { label: "Driving Licence", value: "driving" },
];

/* ------------------------------------------------------------------ */
/*  Section Header                                                       */
/* ------------------------------------------------------------------ */
const SectionHeader = ({ iconName, title, colors }) => (
  <View style={[sectionStyles.row, { borderBottomColor: colors.cardBorder }]}>
    <View style={[sectionStyles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
      <Ionicons name={iconName} size={16} color={colors.primary} />
    </View>
    <Text style={[sectionStyles.title, { color: colors.primary }]}>{title}</Text>
  </View>
);

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,

    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

/* ------------------------------------------------------------------ */
/*  Main Screen                                                          */
/* ------------------------------------------------------------------ */
export default function CreateDeliveryReceiptEntry({ navigation }) {
  const { theme } = useThemeStore();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  /* ---- form state ---- */
  const [deliveryType, setDeliveryType] = useState("home");
  const receiptNo = "DR-2023-8842"; // auto-generated
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date());
  const [docketNo, setDocketNo] = useState("");
  const [customer, setCustomer] = useState(null);
  const [status, setStatus] = useState("Pending");

  const [freightCharge, setFreightCharge] = useState("1250.00");
  const [deliveryCharge, setDeliveryCharge] = useState("150.00");
  const [hamaly, setHamaly] = useState("50.00");
  const [otherCharges, setOtherCharges] = useState("25.00");

  const [payMode, setPayMode] = useState("cash");
  const [toAccount, setToAccount] = useState("main_a");
  const [chequeNo, setChequeNo] = useState("");
  const [narration, setNarration] = useState("");

  const [deliveredTo, setDeliveredTo] = useState("");
  const [identityType, setIdentityType] = useState("aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [doorDelivery, setDoorDelivery] = useState("0.00");

  /* ---- computed ---- */
  const totalAmount = useMemo(() => {
    const nums = [freightCharge, deliveryCharge, hamaly, otherCharges, doorDelivery].map((v) => parseFloat(v) || 0);
    return nums.reduce((a, b) => a + b, 0).toFixed(2);
  }, [freightCharge, deliveryCharge, hamaly, otherCharges, doorDelivery]);

  /* ---- handlers ---- */
  const handleSave = () => {
    // TODO: submit form
  };

  const handleSaveAndPrint = () => {
    // TODO: submit + print
  };

  /* ---------------------------------------------------------------- */
  return (
    <View style={[styles.screen]}>
      {/* ---- Scrollable content ---- */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 20 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ======================== BASIC INFORMATION ======================== */}
        <View style={styles.card}>
          <SectionHeader iconName="information-circle-outline" title="Basic Information" colors={colors} />

          <FullWidthSelectInput
            label="Docket No"
            value={docketNo}
            onChange={setDocketNo}
            items={DOCKET_OPTIONS}
            placeholderText="Select docket"
            labelFontSize={12}
            labelFontWeight="400"
            labelLineHeight={18}
          />

          <Input label="Customer Name" value={customer} onChangeText={setCustomer} placeholder="Customer name" />
          <Input label="Receipt No" value={receiptNo} />

          {/* <FullWidthSelectInput
            label="Delivery Type"
            value={deliveryType}
            onChange={setDeliveryType}
            items={DELIVERY_TYPE_OPTIONS}
            labelFontSize={12}
            labelFontWeight="400"
            labelLineHeight={18}
          /> */}

          <Input label="Delivery Type" value={deliveryType} disabled containerStyle={styles.mt16} />

          {/* Date + Time row */}
          <View style={[styles.twoCol, styles.mt16]}>
            <View style={styles.flex1}>
              <Text style={[styles.colLabel, { color: colors.headingText }]}>Date</Text>
              <CalendarInput value={date} onChange={setDate} displayFormat="MM/DD/YYYY" />
            </View>
            <View style={styles.flex1}>
              <TimeInput label="Time" value={time} onChange={setTime} containerStyle={styles.mt0} />
            </View>
          </View>

          {/* Status chips */}
          {/* <View style={styles.mt16}>
            <Text style={styles.chipLabel}>Status</Text>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[
                    styles.chip,
                    {
                      borderColor: status === s ? colors.primary : colors.inputBorder,
                      backgroundColor: status === s ? colors.primary + "18" : "transparent",
                    },
                  ]}
                >
                  {status === s && <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: status === s ? colors.primary : colors.bodyText,
                        fontWeight: status === s ? "600" : "400",
                      },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}

          <View style={styles.mt16}>
            <Text style={styles.chipLabel}>Status</Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip, { borderColor: colors.primary, backgroundColor: colors.primary + "18" }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: colors.primary,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {"Pending"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ======================== CHARGES ======================== */}
        <View style={styles.card}>
          <SectionHeader iconName="card-outline" title="Charges" colors={colors} />

          <View style={styles.twoCol}>
            <Input
              label="GC Total Amount"
              value={freightCharge}
              onChangeText={setFreightCharge}
              readOnly={true}
              containerStyle={[styles.flex1, styles.mt0]}
            />
            <Input
              label="Delivery Charge"
              value={deliveryCharge}
              onChangeText={setDeliveryCharge}
              readOnly={true}
              containerStyle={[styles.flex1, styles.mt0]}
            />
          </View>

          <View style={[styles.twoCol, styles.mt16]}>
            <Input label="Hamaly" value={hamaly} onChangeText={setHamaly} keyboardType="decimal-pad" containerStyle={[styles.flex1, styles.mt0]} />
            <Input
              label="CR Charges"
              value={otherCharges}
              onChangeText={setOtherCharges}
              keyboardType="decimal-pad"
              containerStyle={[styles.flex1, styles.mt0]}
            />
          </View>

          {/* Balance + Total */}
          <View style={[styles.twoCol, styles.mt16, styles.balanceRow]}>
            <View style={styles.totalBox}>
              <Text style={[styles.totalLabel, { color: colors.bodyText }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>₹{totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* ======================== PAYMENT DETAILS ======================== */}
        <View style={styles.card}>
          <SectionHeader iconName="wallet-outline" title="Payment Details" colors={colors} />

          <View style={styles.twoCol}>
            <FullWidthSelectInput
              label="Pay Mode"
              value={payMode}
              onChange={setPayMode}
              items={PAY_MODE_OPTIONS}
              labelFontSize={12}
              labelFontWeight="400"
              labelLineHeight={14}
              style={styles.flex1}
            />

            {payMode === "cash" && (
              <Input label="Cash Ledger" value="Cash ledger" readOnly={true} keyboardType="decimal-pad" containerStyle={[styles.flex1, styles.mt0]} />
            )}

            {payMode === "cheque" && (
              <FullWidthSelectInput
                label="To Account"
                value={toAccount}
                onChange={setToAccount}
                items={TO_ACCOUNT_OPTIONS}
                labelFontSize={12}
                labelFontWeight="400"
                labelLineHeight={14}
                style={styles.flex1}
              />
            )}
            {payMode === "upi" && (
              <FullWidthSelectInput
                label="To Account"
                value={toAccount}
                onChange={setToAccount}
                items={TO_ACCOUNT_OPTIONS}
                labelFontSize={12}
                labelFontWeight="400"
                labelLineHeight={14}
                style={styles.flex1}
              />
            )}
            {payMode === "bank" && (
              <FullWidthSelectInput
                label="To Account"
                value={toAccount}
                onChange={setToAccount}
                items={TO_ACCOUNT_OPTIONS}
                labelFontSize={12}
                labelFontWeight="400"
                labelLineHeight={14}
                style={styles.flex1}
              />
            )}
          </View>

          {payMode === "cheque" && <Input label="Cheque No / Date" value={chequeNo} onChangeText={setChequeNo} placeholder="Optional" />}

          <Input
            label="Narration"
            value={narration}
            onChangeText={setNarration}
            placeholder="Add payment notes..."
            multiline
            numberOfLines={4}
            inputStyle={styles.textarea}
          />
        </View>

        {/* ======================== DELIVERY DETAILS ======================== */}
        <View style={styles.card}>
          <SectionHeader iconName="location-outline" title="Delivery Details" colors={colors} />

          <Input
            label="Delivered To"
            value={deliveredTo}
            onChangeText={setDeliveredTo}
            placeholder="Receiver's name"
            containerStyle={{ marginTop: 3 }}
          />

          <FullWidthSelectInput
            label="Identity Type"
            value={identityType}
            onChange={setIdentityType}
            items={IDENTITY_TYPE_OPTIONS}
            labelFontSize={12}
            labelFontWeight="400"
            labelLineHeight={18}
            style={{ marginTop: 12 }}
          />

          <Input label="ID Number" value={idNumber} onChangeText={setIdNumber} placeholder="Enter ID number" />

          <Input label="Contact No" value={contactNo} onChangeText={setContactNo} placeholder="+91 00000 00000" keyboardType="phone-pad" />

          <Input
            label="Remarks"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Any special instructions"
            multiline
            numberOfLines={3}
            inputStyle={styles.textarea}
          />
        </View>
      </ScrollView>

      {/* ======================== BOTTOM ACTION BAR ======================== */}

      <BottomActionBar includeBottomInset={false}>
        <View className="flex-row gap-3">
          <Button variant="secondary" size="lg" onPress={handleSave} className="flex-1">
            Save
          </Button>

          <Button variant="primary" size="lg" onPress={handleSaveAndPrint} className="flex-1">
            <View style={styles.printRow}>
              <Printer size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.printText}>Save &amp; Print</Text>
            </View>
          </Button>
        </View>
      </BottomActionBar>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                               */
/* ------------------------------------------------------------------ */
const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.appBg,
    },

    /* Header */
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.headerBg,
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    backBtn: {
      width: 36,
      alignItems: "flex-start",
    },
    backArrow: {
      fontSize: 22,
      color: colors.headerText,
    },
    headerTitle: {
      fontSize: 18,

      fontWeight: "600",
      color: colors.headerText,
    },

    /* Scroll */
    scroll: {
      padding: 16,
      gap: 16,
    },

    /* Card */
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 3,
    },

    /* Layout helpers */
    twoCol: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    flex1: { flex: 1, marginTop: 3 },
    mt0: { marginTop: 0 },
    mt5: { marginTop: 5 },
    mt16: { marginTop: 12 },
    balanceRow: {
      alignItems: "center",
    },
    totalBox: {
      flex: 1,
      alignItems: "flex-end",
      justifyContent: "center",
      paddingRight: 4,
    },

    /* Status chips */
    colLabel: {
      fontSize: 12,
      color: colors.inputText,

      fontWeight: "500",
      marginBottom: 6,
    },
    chipLabel: {
      fontSize: 12,
      color: colors.bodyText,

      fontWeight: "500",
      marginBottom: 8,
    },
    chipRow: {
      flexDirection: "row",
      gap: 10,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    chipText: {
      fontSize: 12,
    },

    /* Total amount */
    totalLabel: {
      fontSize: 12,

      marginBottom: 4,
      textAlign: "right",
      letterSpacing: 0.3,
    },
    totalValue: {
      fontSize: 24,

      fontWeight: "700",
      textAlign: "right",
    },

    /* Textarea */
    textarea: {
      height: undefined,
      minHeight: 90,
      paddingTop: 14,
      textAlignVertical: "top",
    },

    /* Bottom */
    bottomContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    printRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    printText: {
      color: "#fff",
      fontSize: 14,

      fontWeight: "600",
    },
  });
