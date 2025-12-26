// EightColumnTable.js
import { useMemo } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

/**
 * props:
 *  - columns: [{ label: "Head1", key: "field1", width: 120 }, ... exactly 8 items]
 *  - data:    [{ field1: "...", field2: "...", ... }, ...]
 */
export default function ReactNativeTable({ columns, data }) {
  const tableHead = useMemo(() => columns.map((c) => c.label), [columns]);
  const widthArr = useMemo(() => columns.map((c) => c.width || 120), [columns]);

  const toRowArray = (row) =>
    columns.map((c) => {
      const v = row?.[c.key];
      if (c.render && v !== null && v !== undefined) {
        return c.render(v);
      }
      return v === null || v === undefined ? "N/A" : String(v);
    });

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {tableHead.map((header, index) => (
        <View key={index} style={[styles.headerCell, { width: widthArr[index] }]}>
          <Text style={styles.headerText}>{header}</Text>
        </View>
      ))}
    </View>
  );

  const renderRow = ({ item, index }) => {
    const rowData = toRowArray(item);
    return (
      <View style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
        {rowData.map((cell, cellIndex) => (
          <View key={cellIndex} style={[styles.cell, { width: widthArr[cellIndex] }]}>
            {typeof cell === "string" || typeof cell === "number" ? (
              <Text style={styles.text}>{cell}</Text>
            ) : (
              // If a render callback returned a React node (element), render it directly
              // This avoids wrapping non-text nodes inside <Text> which causes runtime errors
              cell
            )}
          </View>
        ))}
      </View>
    );
  };

  const ListHeaderComponent = useMemo(() => renderHeader(), [tableHead, widthArr]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <FlatList
          data={data}
          renderItem={renderRow}
          keyExtractor={(item, index) => `row-${index}`}
          showsVerticalScrollIndicator={true}
          ListHeaderComponent={ListHeaderComponent}
          stickyHeaderIndices={[0]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={5}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    height: 50,
    backgroundColor: theme.colors.primary,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  headerText: {
    textAlign: "center",
    fontWeight: "700",
    color: theme.colors.cardBg,
  },
  row: {
    flexDirection: "row",
    height: 44,
    backgroundColor: theme.colors.cardBg,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  rowAlt: {
    backgroundColor: theme.colors.cardBg,
  },
  cell: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: theme.colors.inputBorder,
    paddingHorizontal: 4,
  },
  text: {
    textAlign: "center",
    fontWeight: "400",
    color: theme.colors.bodyText,
    fontSize: 13,
  },
});
