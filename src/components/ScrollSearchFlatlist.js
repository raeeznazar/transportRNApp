import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../stores/themeStore";
import InputSearch from "./InputSearch";

const ScrollSearchFlatlist = ({
  visible,
  onClose,
  data = [],
  onSelect,
  searchValue = "",
  onSearchChange,
  labelKey = "label",
  valueKey = "value",
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onRefresh,
  refreshing = false,
  title = "Select Item",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found",
  maxHeight = "86%",
  showSearch = true,
  renderCustomItem = null,
  keyExtractor = null,
  error = null, // Error object or message
  onRetry = null, // Retry handler
}) => {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const [selectedItem, setSelectedItem] = useState(null);

  // Enhanced keyExtractor to handle duplicates
  const defaultKeyExtractor = useCallback(
    (item, index) => {
      // Use the uniqueKey if provided, otherwise create one
      if (item.uniqueKey) return item.uniqueKey;

      const primaryKey = item[valueKey] || "";
      const secondaryKey = item.docketNo || item.docketID || item.id || "";
      const dateKey = item.docketDate ? new Date(item.docketDate).getTime() : "";

      return `${primaryKey}-${secondaryKey}-${dateKey}-${index}`;
    },
    [valueKey]
  );

  const handleItemPress = useCallback(
    (item) => {
      setSelectedItem(item);
      if (onSelect) {
        onSelect({
          label: item[labelKey],
          value: item[valueKey],
          ...item,
        });
      }
      onClose();
    },
    [onSelect, onClose, labelKey, valueKey]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      if (renderCustomItem) {
        return renderCustomItem({ item, index, onPress: () => handleItemPress(item) });
      }

      const isSelected = selectedItem?.[valueKey] === item[valueKey];

      return (
        <Pressable
          className="px-4 py-4 flex-row items-center justify-between"
          style={[
            {
              borderBottomWidth: index === data.length - 1 ? 0 : 1,
              borderBottomColor: theme.colors.cardBorder,
            },
            isSelected && { backgroundColor: theme.colors.primary + "10" },
          ]}
          onPress={() => handleItemPress(item)}
        >
          <View className="flex-1 px-5">
            <Text className="text-sm font-semibold" style={{ color: theme.colors.headingText }}>
              {item[labelKey]}
            </Text>
          </View>
          {isSelected && (
            <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
              <Text style={{ color: theme.colors.buttonPrimaryText, fontSize: 12 }}>✓</Text>
            </View>
          )}
        </Pressable>
      );
    },
    [renderCustomItem, handleItemPress, selectedItem, valueKey, data.length, theme, labelKey]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <Text style={{ color: theme.colors.bodyText, fontSize: 12, marginTop: 6 }}>Loading more...</Text>
        </View>
      );
    }
    if (!hasNextPage && data.length > 0) {
      return <Text style={{ textAlign: "center", paddingVertical: 12, color: theme.colors.bodyText, fontSize: 12 }}>No more items</Text>;
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, data.length, theme]);

  const renderEmpty = useCallback(() => {
    // Show error state
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to load data';
      
      return (
        <View style={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: theme.colors.error || '#EF4444', fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
            Error Loading Data
          </Text>
          <Text style={{ color: theme.colors.bodyText, fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
            {errorMessage}
          </Text>
          {onRetry && (
            <Pressable
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                backgroundColor: theme.colors.primary,
                borderRadius: 8,
              }}
              onPress={onRetry}
            >
              <Text style={{ color: theme.colors.buttonPrimaryText, fontSize: 14, fontWeight: '600' }}>
                Try Again
              </Text>
            </Pressable>
          )}
        </View>
      );
    }

    // Show loading state
    if (isLoading) {
      return (
        <View style={{ alignItems: "center", paddingVertical: 32, gap: 10 }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={{ color: theme.colors.bodyText, fontSize: 13 }}>Loading data...</Text>
        </View>
      );
    }

    // Show empty state
    return (
      <View style={{ alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
        <Text style={{ color: theme.colors.bodyText, fontSize: 14, textAlign: 'center' }}>{emptyMessage}</Text>
      </View>
    );
  }, [error, isLoading, theme, emptyMessage, onRetry]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.cardBg,
              maxHeight: maxHeight,
              paddingBottom: insets.bottom || 20,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.cardBorder }]}>
            <Text style={[styles.title, { color: theme.colors.headingText }]}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: theme.colors.bodyText }]}>✕</Text>
            </Pressable>
          </View>

          {/* Search */}
          {showSearch && (
            <View style={styles.searchContainer}>
              <InputSearch value={searchValue} onChangeText={onSearchChange} placeholder={searchPlaceholder} style={{ marginBottom: 0 }} />
            </View>
          )}

          {/* FlatList - NO ScrollView wrapper */}
          <FlatList
            data={data}
            keyExtractor={keyExtractor || defaultKeyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            onRefresh={onRefresh}
            refreshing={refreshing}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            initialNumToRender={15}
            contentContainerStyle={{
              flexGrow: 1,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    lineHeight: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export default React.memo(ScrollSearchFlatlist);
