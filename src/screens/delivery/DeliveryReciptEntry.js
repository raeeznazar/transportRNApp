import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useCurrentTheme } from "../../../stores/themeStore";
import DateRange from "../../components/DateRange";
import ModalList from "../../components/ModalList";
import SearchFilter from "../../components/SearchFilter";

const SHIPMENTS = [
  {
    id: "1",
    docketCode: "DR-7890",
    docketNo: "2520710",
    customer: "Global Textiles Ltd.",
    service: "Premium Delivery",
    itemsCount: 4,
    amount: 1250.0,
    date: "Oct 24, 2023",
  },
  {
    id: "2",
    docketCode: "DR-7891",
    docketNo: "2520715",
    customer: "Loom & Thread Co.",
    service: "Express Freight",
    itemsCount: 12,
    amount: 4820.5,
    date: "Oct 23, 2023",
  },
  {
    id: "3",
    docketCode: "DR-7885",
    docketNo: "2520698",
    customer: "Vertex Logistics",
    service: "Standard Delivery",
    itemsCount: 2,
    amount: 920.0,
    date: "Oct 22, 2023",
  },
  {
    id: "4",
    docketCode: "DR-7882",
    docketNo: "2520650",
    customer: "Swift Cargo Hub",
    service: "Bulk Shipment",
    itemsCount: 85,
    amount: 12400.0,
    date: "Oct 20, 2023",
  },
];

const FILTER_OPTIONS = [
  { value: "all", label: "ALL" },
  { value: "premium", label: "Premium Delivery" },
  { value: "express", label: "Express Freight" },
  { value: "standard", label: "Standard Delivery" },
  { value: "bulk", label: "Bulk Shipment" },
];

const money = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

function ShipmentCard({ item, theme, onPress }) {
  return (
    <TouchableOpacity
      className="mb-3.5 rounded-2xl border p-4"
      style={{
        backgroundColor: theme.colors.cardBg,
        borderColor: theme.colors.cardBorder,
        shadowColor: theme.colors.headingText,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="mb-0.5 text-[16px] font-bold" style={{ color: theme.colors.primary }}>
            {item.docketCode}
          </Text>
          <Text className="text-[10px] font-medium" style={{ color: theme.colors.inputPlaceholder }}>
            Docket: {item.docketNo}
          </Text>
        </View>

        <View className="items-end">
          <Text className="mb-0.5 text-[18px] font-bold" style={{ color: theme.colors.headingText }}>
            {money(item.amount)}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={12} color={theme.colors.inputPlaceholder} />
            <Text className="text-[10px] font-medium" style={{ color: theme.colors.inputPlaceholder }}>
              {item.date}
            </Text>
          </View>
        </View>
      </View>

      <View className="my-3 h-px" style={{ backgroundColor: theme.colors.cardBorder }} />

      <View className="flex-row items-center justify-between">
        <View className="mr-2 flex-1 flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: theme.colors.buttonSecondaryBg }}>
            <Ionicons name="business-outline" size={18} color={theme.colors.bodyText} />
          </View>
          <View>
            <Text className="mb-0.5 text-[12px] font-semibold" style={{ color: theme.colors.headingText }}>
              {item.customer}
            </Text>
            <Text className="text-[10px] font-medium" style={{ color: theme.colors.inputPlaceholder }}>
              {item.service} • {item.itemsCount} items
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={theme.colors.inputBorder} />
      </View>
    </TouchableOpacity>
  );
}

export default function DeliveryReciptEntry() {
  const theme = useCurrentTheme();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [fromDate, setFromDate] = useState(null); // "YYYY-MM-DD"
  const [toDate, setToDate] = useState(null);
  const now = new Date();

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const filteredShipments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return SHIPMENTS.filter((shipment) => {
      const matchesFilter = selectedFilter === "all" || shipment.service.toLowerCase().includes(selectedFilter);
      const matchesSearch =
        !normalizedQuery ||
        shipment.docketCode.toLowerCase().includes(normalizedQuery) ||
        shipment.docketNo.toLowerCase().includes(normalizedQuery) ||
        shipment.customer.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [query, selectedFilter]);

  const selectedFilterLabel = FILTER_OPTIONS.find((it) => it.value === selectedFilter)?.label || "ALL";

  return (
    <View className="flex-1 px-4 pt-3.5" style={{ backgroundColor: theme.colors.appBg }}>
      <SearchFilter value={query} onChangeText={setQuery} placeholder={`Search ${selectedFilterLabel}`} onFilterPress={() => setOpen(true)} />

      <ModalList
        visible={open}
        onClose={() => setOpen(false)}
        onSelect={(item) => setSelectedFilter(item.value)}
        items={FILTER_OPTIONS}
        selectedValue={selectedFilter}
        searchable={false}
        title="Select Search Filter"
      />

      <View style={{ marginTop: 12 }}>
        <DateRange
          label="Select date range"
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onChange={({ fromDate, toDate }) => {
            console.log("range:", fromDate, toDate);
          }}
          displayFormat="DD MMM YY"
          autoCloseOnComplete={true}
          onRangeComplete={({ fromDate, toDate }) => {
            console.log("Range complete:", fromDate, toDate);
          }}
        />
      </View>

      <FlatList
        data={filteredShipments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 16 }}
        renderItem={({ item }) => (
          <ShipmentCard
            item={item}
            theme={theme}
            onPress={() => {
              // place navigation or details action here
            }}
          />
        )}
      />
    </View>
  );
}
