import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");



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
    fontSize: 14,
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


