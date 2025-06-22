import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

export const orderStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Light background for the screen
  },
  scrollViewContent: {
    paddingBottom: 20, // Add some padding at the bottom of the scroll view
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF', // Blue for "Open" status
  },
  dateTimeText: {
    fontSize: 16,
    color: '#666',
  },
  carDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  carIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  carPlate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  contactDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconStyle: {
    fontSize: 20, // Adjust for emoji size
    marginRight: 10,
    color: '#333',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C', // Red for "Obligation to pay"
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expectationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  expectationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  policyLinksContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden', // Ensures borders look good with rounded corners
  },
  policyLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  policyLinkText: {
    fontSize: 16,
    color: '#333',
  },
  policyArrow: {
    fontSize: 20,
    color: '#A0A0A0', // Light gray arrow
  },
});