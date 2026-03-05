import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../../stores/themeStore";
import { Button } from "../../components/Button";
import FullWidthSearchSelectInput from "../../components/FullWidthSearchSelectInput";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";
import Input from "../../components/Input";
import SlideModal from "../../components/SlideModal";
import TextArea from "../../components/TextArea";

export default function CollectionEntry() {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const [ledgerType, setLedgerType] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [open, setOpen] = useState(false);
  const [balanceCharge, setBalanceCharge] = useState("0.00");
  const [paymentMode, setPaymentMode] = useState(null);
  const [description, setDescription] = useState("");
  const ledgers = [
    { label: "John Doe", value: "1" },
    { label: "Jane Smith", value: "2" },
  ];
  const customers = [
    { label: "John Doe", value: "1" },
    { label: "Jane Smith", value: "2" },
    { label: "Robert Johnson", value: "3" },
    { label: "Emily Davis", value: "4" },
    { label: "Michael Brown", value: "5" },
  ];
  const rows = [
    { id: 1, customer: "John Doe", balance: "₹1,200.50" },
    { id: 2, customer: "Jane Smith", balance: "₹450.00" },
    { id: 3, customer: "Robert Johnson", balance: "₹2,890.75" },
    { id: 4, customer: "Emily Davis", balance: "₹980.40" },
    { id: 5, customer: "Michael Brown", balance: "₹3,450.10" },
    { id: 6, customer: "Sarah Wilson", balance: "₹620.00" },
    { id: 7, customer: "David Martinez", balance: "₹1,150.25" },
    { id: 8, customer: "Jessica Taylor", balance: "₹780.90" },
    { id: 9, customer: "Daniel Anderson", balance: "₹4,200.00" },
    { id: 10, customer: "Laura Thomas", balance: "₹310.75" },
    { id: 11, customer: "James Moore", balance: "₹2,050.60" },
    { id: 12, customer: "Olivia Jackson", balance: "₹890.00" },
    { id: 13, customer: "William White", balance: "₹1,760.30" },
    { id: 14, customer: "Sophia Harris", balance: "₹540.45" },
    { id: 15, customer: "Benjamin Clark", balance: "₹3,120.99" },
    { id: 16, customer: "Mia Lewis", balance: "₹670.10" },
    { id: 17, customer: "Lucas Walker", balance: "₹1,430.80" },
    { id: 18, customer: "Charlotte Hall", balance: "₹2,250.55" },
    { id: 19, customer: "Henry Allen", balance: "₹990.00" },
    { id: 20, customer: "Amelia Young", balance: "₹1,870.65" },
  ];
  const renderHeader = () => (
    <View className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.cardBorder }}>
      <Text className="text-sm font-semibold flex-1" style={{ color: theme.colors.accent }}>
        CUSTOMER
      </Text>
      <Text className="text-sm font-semibold w-28 text-right" style={{ color: theme.colors.accent }}>
        BALANCE
      </Text>
      <Text className="text-sm font-semibold w-20 text-right" style={{ color: theme.colors.accent }}>
        ACTION
      </Text>
    </View>
  );

  const renderRow = ({ item, index }) => (
    <View
      className="flex-row items-center px-4 py-3"
      style={{
        borderBottomWidth: index === rows.length - 1 ? 0 : 1,
        borderBottomColor: theme.colors.cardBorder,
      }}
    >
      <Text className="text-sm font-semibold flex-1" style={{ color: theme.colors.headingText }}>
        {item.customer}
      </Text>
      <Text className="text-sm font-semibold w-28 text-right" style={{ color: theme.colors.headingText }}>
        {item.balance}
      </Text>

      <View className="w-20 items-end">
        <Pressable
          className="px-3 py-2 rounded-full"
          style={{ backgroundColor: theme.colors.buttonPrimaryBg }}
          onPress={() => {
            setOpen(true);
          }}
        >
          <Text className="text-[10px] font-semibold" style={{ color: theme.colors.buttonPrimaryText }}>
            Pay
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className="flex-1 px-4 pt-4" style={{ backgroundColor: theme.colors.appBg }}>
      <FullWidthSearchSelectInput
        placeholderText="Search ledger..."
        items={ledgers}
        value={ledgerType}
        onChange={setLedgerType}
        className="pb-4 pt-1"
      />

      <View
        className="flex-1 rounded-xl overflow-hidden"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderWidth: 1,
          borderColor: theme.colors.cardBorder,
          marginBottom: 15,
        }}
      >
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRow}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="text-center justify-center py-2">No Data Found</Text>}
          ListFooterComponent={<Text className="text-center justify-center py-2">List End...</Text>}
          contentContainerStyle={{
            padding: 10,
            paddingBottom: 24,
            marginBottom: insets.bottom,
          }}
        />
      </View>

      <SlideModal visible={open} onClose={() => setOpen(false)} maxHeight="80%">
        <View className="flex-1 px-4 pt-4">
          <Text className="text-lg font-bold mb-4" style={{ color: theme.colors.headingText }}>
            Pay Balance
          </Text>
          <FullWidthSearchSelectInput
            placeholderText="Select Customer..."
            items={customers}
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            className="pb-4 pt-1"
          />
          {/* <Text className="text-sm mb-4" style={{ color: theme.colors.bodyText }}>
            Enter payment details below to proceed with the collection.
          </Text> */}

          <Input label="Balance Charge" value={balanceCharge} onChangeText={setBalanceCharge} containerStyle={[styles.mt0]} />

          <FullWidthSelectInput
            label="Payment Mode"
            placeholderText="Select Payment Mode..."
            items={[
              { label: "Cash", value: "1" },
              { label: "Cheque", value: "2" },
            ]}
            value={paymentMode}
            onChange={setPaymentMode}
            className="pb-1 pt-2"
          />
          {paymentMode === "2" && (
            <>
              <Input label="Check Number" />
              <Input label="Account Details" />
            </>
          )}
          <TextArea
            label="Description"
            value={description}
            onChangeText={setDescription}
            numberOfLines={6}
            containerStyle={{ marginTop: 8 }}
            inputStyle={{ minHeight: 70 }}
          />

          <Button variant="primary" size="sm" fullWidth className="mt-4">
            Submit
          </Button>
        </View>
      </SlideModal>
    </View>
  );
}

const styles = StyleSheet.create({
  mt0: {
    marginTop: 0,
  },
});
