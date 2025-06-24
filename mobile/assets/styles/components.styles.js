import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");

export const orderCardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 15,
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 15,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // For Android shadow
        alignItems: 'center',
    },
    imageContainer: {
        width: 50, // Fixed width for image container
        height: 50, // Fixed height for image container
        borderRadius: 35, // Half of width/height for circular image
        overflow: 'hidden',
        marginRight: 15,
        backgroundColor: COLORS.background, // Placeholder background
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    icon: {
        fontSize: 16, // Adjust font size for emoji/text icons
        color: COLORS.primary,
        marginRight: 8,
    },
    addressText: {
        fontSize: 14,
        color: COLORS.text,
        flexShrink: 1, // Allows text to wrap
    },
    dateText: {
        fontSize: 14,
        color: COLORS.text,
        flexShrink: 1, // Allows text to wrap
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    openBadge: {
        backgroundColor: '#E0F2F7', // Light blue
    },
    completedBadge: {
        backgroundColor: '#E6FFE6', // Light green
    },
    statusText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    openText: {
        color: '#007AFF', // Blue
    },
    completedText: {
        color: '#28A745', // Green
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});

export const CleaningProcessStepStyles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align text to start
    marginBottom: 14, // Space between steps
  },
  iconAndLine: {
    alignItems: 'center',
    marginRight: 10,
  },
  stepLabel: {
    fontSize: 16,
    flex: 1, // Allow text to wrap
    color: COLORS.primary, // Use a consistent text color
  },
  outerCheckboxContainer: {
      width: 23,
      height: 23,
      borderRadius: 12, // Makes it perfectly round
      backgroundColor: '#D1EAD0', // A lighter shade of green for the outer circle
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.75, // Slightly transparent for a modern look
    },
  innerCheckboxContainer: {
    width: 14,
    height: 14, // Adjusted size for a more compact checkbox
    borderRadius: 20, // Makes it perfectly round
    backgroundColor: '#28A745', // Darker green background for the checkmark itself
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    fontSize: 10, // Adjust icon size relative to container size
    color: COLORS.white, // White checkmark
    fontWeight: '800', // Make the checkmark bold for better visibility
  },
});


export const ServiceDetailsListSyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 10, // Add horizontal margin to match screen layout
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // Space below the section title
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceItemPrimary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Space between service lines
  },
  primary: {
    fontWeight: '700', // Matches the screenshot's primary service weight
    fontSize: 16,
  },
  serviceItemSecondary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Space between service lines
    marginLeft: 15, // Indent secondary services
  },
  secondary: {
    fontWeight: '400', // Matches the screenshot's primary service weight
    fontSize: 15,
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
    flex: 1, // Allows name to take up space and wrap if needed
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600', // Matches the screenshot's price weight
    color: '#333',
    marginLeft: 10, // Space between name and price
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: '#EEE', // Light grey line
    marginVertical: 10, // Space above and below the line
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C', // Red color for "Obligation to pay"
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});