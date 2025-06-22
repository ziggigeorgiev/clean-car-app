import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    gap: 20
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: COLORS.color,
    textAlign: 'center',
    lineHeight: 22,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: width * 0.3,
    height: width * 0.3,
  },
  orderSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 15,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderCard: {
    alignItems: 'center',
    flex: 1,
  },
  orderNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  orderLabel: {
    fontSize: 16,
    color: COLORS.color,
  },
  separator: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.primary,
  },
  trackingTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cleaningOrdersLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonIcon: {
    color: COLORS.white,
    fontSize: 24,
    marginRight: 10,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
