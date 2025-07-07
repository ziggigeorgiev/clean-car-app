import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// If using vector icons:
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CleaningProcessStepStyles as styles } from '../assets/styles/components.styles';
import { COLORS } from "../constants/colors";

interface CleaningProcessStepProps {
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
}

const CleaningProcessStep: React.FC<CleaningProcessStepProps> = ({ name, status }) => {
  
  const iconColor =
    status === 'pending'
      ? '#90949C' // Gray
      : '#28A745'; // Green 
  const shadowColor =
    status === 'pending'
      ? '#E0E0E0' // Light gray
      : '#D1EAD0'; // Light green 

  const textColor = status === 'in-progress' ? COLORS.primary : COLORS.text;
  const fontWeight = status === 'in-progress' ? '700' : 'normal';

  return (
    <View style={styles.stepContainer}>
      <View style={styles.iconAndLine}>

        <View style={[styles.outerCheckboxContainer, { backgroundColor: shadowColor }]}>
          <View style={[styles.innerCheckboxContainer, { backgroundColor: iconColor }]}>
            {/* Option 1: Using react-native-vector-icons (Recommended) */}
            {/* <Icon name="check" style={dynamicStyles.checkmarkIcon} /> */}

            {/* Option 2: Using a simple text character (Fallback if no icon library) */}
            <Text style={styles.checkmarkIcon}>✓</Text>
          </View>
        </View>

      </View>
      <Text style={[styles.stepLabel, { color: textColor, fontWeight: fontWeight }]}>
        {name}
      </Text>
    </View>
  );
};

export default CleaningProcessStep;