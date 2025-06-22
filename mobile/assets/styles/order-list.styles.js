import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

export const orderListStyles = StyleSheet.create({
  backIcon: {
    marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginBottom: 10, // Space below header
  },
  // If you use a back icon:
  // backIcon: {
  //   marginRight: 10,
  // },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1, // Takes up available space
  },
  orderCount: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContentContainer: {
    paddingVertical: 10, // Padding around the list items
  },
});