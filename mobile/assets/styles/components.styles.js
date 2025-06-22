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
    marginBottom: 15,
  },
  iconAndLine: {
    alignItems: 'center',
    marginRight: 10,
  },
  line: {
    width: 2,
    height: 30, // Adjust height of line
    marginTop: 5,
  },
  stepLabel: {
    fontSize: 16,
    flex: 1, // Allow text to wrap
    paddingTop: 3, // Align text with icon visually
  },
});