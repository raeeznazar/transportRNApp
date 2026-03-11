import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetCollectionList, useOutwadesDirectAlsFinalSubmit } from "../../../hooks/useCollectionApiQueries";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentTheme } from "../../../stores/themeStore";
import { Button } from "../../components/Button";
import ErrorScreen from "../../components/ErrorScreen";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";
import Input from "../../components/Input";
import InputSearch from "../../components/InputSearch";
import { ScanToast } from "../../components/ScanToast";
import SlideModal from "../../components/SlideModal";
import TextArea from "../../components/TextArea";

const PageSize = 20;

export default function CollectionEntry() {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [open, setOpen] = useState(false);
  const [collectedCharge, setcollectedCharge] = useState("");
  const [paymentMode, setPaymentMode] = useState(null);
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [ChequeNumber, setChequeNumber] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [itemAccCode, setItemAccCode] = useState("");
  const [balanceCharge, setBalanceCharge] = useState("");
  const [errors, setErrors] = useState({});
  const { sessionData } = useAuthStore();
  const isFocused = useIsFocused();
  const branchCode = sessionData?.branchCode;
  const finCode = sessionData?.finCode;
  const entryUser = sessionData?.userName;
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // Debounce the search input by 500ms
  const debouncedSearch = useDebounce(search, 600);

  ///-------------------------------- API CALLS -----------------------------///
  const { data, isLoading, isFetching, refetch, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetCollectionList(branchCode, PageSize, {
    enabled: isFocused && !!branchCode && !!PageSize,
    LedgerFilter: "",
    CustomerFilter: debouncedSearch, // pass debounced search value
  });
  const collectionList = data?.pages?.flatMap((page) => page) || [];

  const { mutate: submitPayment, isLoading: isSubmittingPayment } = useOutwadesDirectAlsFinalSubmit();

  ///-------------------------------- API CALLS END -----------------------------///

  ///-----------------ERROR HANDLING-----------------------------///
  if (error) {
    return <ErrorScreen error={error} onRetry={refetch} />;
  }
  ///-----------------ERROR HANDLING END-----------------------------///

  ////-------------------------------- SEARCH FILTER DATA PROCESSING -----------------------------///

  const rows = collectionList.map((item, index) => ({
    id: index,
    customer: item.head,
    balance: item.balance,
    accCode: item.accCode,
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  ////-------------------------------- SEARCH FILTER DATA PROCESSING END ---------------------------------///

  ////-------------------------------- RENDER ROW & HEADER -----------------------------///
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
            // setOpen(true);
            onhandleModalOpen(item);
          }}
        >
          <Text className="text-[10px] font-semibold" style={{ color: theme.colors.buttonPrimaryText }}>
            Pay
          </Text>
        </Pressable>
      </View>
    </View>
  );
  ////-------------------------------- RENDER ROW & HEADER END -----------------------------///

  ////-------------------------------- RENDER FOOTER -----------------------------///

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <Text style={{ color: theme.colors.bodyText, fontSize: 12, marginTop: 6 }}>Loading more...</Text>
        </View>
      );
    }
    if (!hasNextPage && rows.length > 0) {
      return <Text style={{ textAlign: "center", paddingVertical: 12, color: theme.colors.bodyText, fontSize: 12 }}>No more data</Text>;
    }
    return null;
  };

  //-------------------------------- RENDER FOOTER END -----------------------------///

  ///-------------------------------- MODAL HANDLERS -----------------------------///

  function onhandleModalOpen(item) {
    console.log("Selected Item for Payment:", item);
    setItemAccCode(item.accCode);
    setBalanceCharge(item.balance);

    setSelectedCustomer(String(item.customer ?? ""));
    setcollectedCharge(String(item.balance ?? ""));
    setOpen(true);
  }

  function onhandleModalClose() {
    setSelectedCustomer("");
    setcollectedCharge("");
    setPaymentMode(null);
    setDescription("");
    setChequeNumber("");
    setAccountDetails("");
    setErrors({});
    setOpen(false);
  }

  function onSubmitPayment() {
    const validationErrors = {};

    if (!paymentMode) {
      validationErrors.paymentMode = "Payment mode is mandatory";
    }

    if (!collectedCharge || collectedCharge.trim() === "" || Number(collectedCharge) <= 0) {
      validationErrors.collectedCharge = "Balance charge is mandatory";
    }

    if (paymentMode === "2" && (!ChequeNumber || ChequeNumber.trim() === "")) {
      validationErrors.ChequeNumber = "Check number is mandatory";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const currentDate = new Date().toISOString();
    const params = {
      collectionType: "TOPAY",
      accCode: itemAccCode,
      balance: parseFloat(balanceCharge) || 0,
      remarks: description,
      collectionAmount: parseFloat(collectedCharge) || 0,
      paymentMode: paymentMode === "1" ? "cash" : "cheque",
      isCheque: paymentMode === "2" ? true : false,
      chequeNo: ChequeNumber,
      chequePassed: paymentMode === "2" ? true : false,
      passDate: currentDate,
      branchCode: branchCode,
      finCode: Number(finCode),
      entryUser: entryUser,
      sessionCode: branchCode,
      collectionDate: currentDate,
    };

    submitPayment(params, {
      onSuccess: (data) => {
        console.log("Payment submission successful:", data);
        onhandleModalClose();
        refetch();
        setToastConfig({
          visible: true,
          type: "success",
          title: "Payment Successful",
          message: data?.message || "The payment has been submitted successfully.",
        });
      },
      onError: (error) => {
        onhandleModalClose();
        console.error("Payment submission error:", error);
        setToastConfig({
          visible: true,
          type: "error",
          title: "Payment Error",
          message: error.message || "Failed to submit payment",
        });
      },
    });
  }

  ///-------------------------------- MODAL HANDLERS END -----------------------------///

  return (
    <>
      <View className="flex-1 px-4 pt-4" style={{ backgroundColor: theme.colors.appBg }}>
        <ScanToast
          visible={toastConfig.visible}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          onHide={() => setToastConfig({ ...toastConfig, visible: false })}
        />
        <InputSearch
          value={search}
          onChangeText={setSearch}
          style={{ marginTop: 6, marginBottom: 12 }}
          placeholder="Type to search..."
          onSearchPress={(text) => console.log("Search:", text)}
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
            ListEmptyComponent={
              isLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 32, gap: 10 }}>
                  <ActivityIndicator size="large" color={theme.colors.accent} />
                  <Text style={{ color: theme.colors.bodyText, fontSize: 13 }}>Loading data...</Text>
                </View>
              ) : (
                <Text className="text-center justify-center py-2">No Data Found</Text>
              )
            }
            ListFooterComponent={renderFooter}
            scrollEnabled={true}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onEndReached={handleLoadMore}
            contentContainerStyle={{
              padding: 10,
              paddingBottom: 24,
              marginBottom: insets.bottom,
            }}
          />
        </View>

        <SlideModal visible={open} onClose={onhandleModalClose} maxHeight="86%">
          <View className="flex-1 px-4 pt-4">
            <Text className="text-lg font-bold mb-4" style={{ color: theme.colors.headingText }}>
              Pay Balance
            </Text>
            <Input disabled={true} label="Customer Name" value={selectedCustomer} onChangeText={setSelectedCustomer} containerStyle={[styles.mt0]} />

            <Input
              label="Balance Charge"
              value={collectedCharge}
              onChangeText={(text) => {
                setcollectedCharge(text);
                if (errors.collectedCharge) setErrors((prev) => ({ ...prev, collectedCharge: "" }));
              }}
              keyboardType="numeric"
              containerStyle={[styles.mt2]}
            />
            {errors.collectedCharge ? <Text style={{ color: "red", fontSize: 12, marginTop: 2 }}>{errors.collectedCharge}</Text> : null}

            <FullWidthSelectInput
              label="Payment Mode"
              placeholderText="Select Payment Mode..."
              items={[
                { label: "Cash", value: "1" },
                { label: "Cheque", value: "2" },
              ]}
              value={paymentMode}
              onChange={(value) => {
                setPaymentMode(value);
                setErrors((prev) => ({ ...prev, paymentMode: "" }));
              }}
              className="pb-1 pt-2"
            />
            {errors.paymentMode ? <Text style={{ color: "red", fontSize: 12, marginTop: 2 }}>{errors.paymentMode}</Text> : null}

            {paymentMode === "2" && (
              <>
                <Input
                  label="Cheque Number"
                  value={ChequeNumber}
                  onChangeText={(text) => {
                    setChequeNumber(text);
                    if (errors.ChequeNumber) setErrors((prev) => ({ ...prev, ChequeNumber: "" }));
                  }}
                />
                {errors.ChequeNumber ? <Text style={{ color: "red", fontSize: 12, marginTop: 2 }}>{errors.ChequeNumber}</Text> : null}
                <Input label="Account Details" value={accountDetails} onChangeText={setAccountDetails} />
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

            <Button variant="primary" size="sm" fullWidth className="mt-4" onPress={onSubmitPayment} loading={isSubmittingPayment}>
              Submit
            </Button>
          </View>
        </SlideModal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mt0: {
    marginTop: 0,
  },

  mt2: {
    marginTop: 8,
  },

  mt3: {
    marginTop: 12,
  },

  mt4: {
    marginTop: 16,
  },
});
