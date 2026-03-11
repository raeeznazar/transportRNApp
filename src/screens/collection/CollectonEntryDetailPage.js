import { StyleSheet, Text, View } from "react-native";

export default function CollectonEntryDetailPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello from Collection Entry Detail Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // This makes the container take up all available space
    justifyContent: "center", // Centers children vertically
    alignItems: "center", // Centers children horizontally
    backgroundColor: "#f5f5f5", // Adds a light background color
  },
  text: {
    fontSize: 20, // Sets the font size of the text
    fontWeight: "bold", // Makes the text bold
    color: "#333333", // Sets the text color
  },
});
