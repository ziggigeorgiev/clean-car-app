import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function NoResultsFound({ message = "Loading..."}) {
  return (
    <View style={styles.emptyState}>
      <Image
        source={require('../assets/images/cleen-logo.png')} 
        style={styles.itemImage}
      />
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptyDescription}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  itemImage: {
    width: 160,
    height: 100,
    borderRadius: 0,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
