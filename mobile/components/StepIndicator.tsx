// components/DotIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  activeColor?: string;
  inactiveColor?: string;
  dotSize?: number;
  spacing?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  totalSteps,
  currentStep,
  activeColor = '#007AFF', // Blue
  inactiveColor = '#E0F2F7', // Light Grey
  dotSize = 8,
  spacing = 5,
}) => {
  const dots = Array.from({ length: totalSteps }).map((_, index) => (
    <View
      key={index}
      style={[
        styles.dot,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          marginHorizontal: spacing / 2,
          backgroundColor: index + 1 <= currentStep ? activeColor : inactiveColor,
           // Optional: Add some padding to the right for better spacing
        },
      ]}
    />
  ));

  return <View style={styles.container}>
    {dots}
    <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  dot: {
    // Dynamic styles applied inline
    paddingRight: 20
  },
});

export default StepIndicator;