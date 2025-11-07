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
      return v === null || v === undefined ? "" : String(v);
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
      <View style={[styles.row, index % 2 === 1 && { backgroundColor: theme.colors.inputBackground }]}>
        {rowData.map((cell, cellIndex) => (
          <View key={cellIndex} style={[styles.cell, { width: widthArr[cellIndex] }]}>
            <Text style={styles.text}>{cell}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {renderHeader()}
          <FlatList data={data} renderItem={renderRow} keyExtractor={(item, index) => index.toString()} showsVerticalScrollIndicator={true} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
  },
  headerRow: {
    flexDirection: "row",
    height: 50,
    backgroundColor: theme.colors.buttonBackground,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  headerText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    height: 44,
    backgroundColor: theme.colors.inputBackground,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  cell: {
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  text: {
    textAlign: "center",
    fontWeight: "400",
  },
});
