import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// If using vector icons:
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CleaningProcessStepStyles } from '../assets/styles/components.styles';

interface CleaningProcessStepProps {
  label: string;
  status: 'completed' | 'in-progress' | 'pending';
  isLast?: boolean;
}

const CleaningProcessStep: React.FC<CleaningProcessStepProps> = ({ label, status, isLast }) => {
  const iconName =
    status === 'completed'
      ? 'check-circle' // Example for completed (green check)
      : status === 'in-progress'
      ? 'checkbox-marked-circle-outline' // Example for in-progress (blue dot/outline)
      : 'circle-outline'; // Example for pending (gray circle)

  const iconColor =
    status === 'completed'
      ? '#28A745' // Green
      : status === 'in-progress'
      ? '#007AFF' // Blue
      : '#CCC'; // Light gray

  const textColor = status === 'in-progress' ? '#007AFF' : '#333';
  const fontWeight = status === 'in-progress' ? 'bold' : 'normal';

  return (
    <View style={CleaningProcessStepStyles.stepContainer}>
      <View style={CleaningProcessStepStyles.iconAndLine}>
        {/* Use Icon component if installed, otherwise use emoji/text */}
        {/* <Icon name={iconName} size={24} color={iconColor} /> */}
        <Text style={{ fontSize: 24, color: iconColor }}>
          {status === 'completed' ? '✅' : status === 'in-progress' ? '🔵' : '⚪'}
        </Text>
        {!isLast && <View style={[CleaningProcessStepStyles.line, { backgroundColor: iconColor }]} />}
      </View>
      <Text style={[CleaningProcessStepStyles.stepLabel, { color: textColor, fontWeight: fontWeight }]}>
        {label}
      </Text>
    </View>
  );
};

export default CleaningProcessStep;