// components/DotIndicator.tsx
import { COLORS } from '@/constants/colors';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import BackIcon from '../assets/images/icons/bc-arrow-left.svg';
import { router } from 'expo-router';

interface StepIndicatorProps {
  title: string;
  backRoute: string;
  backParams: object;
  totalSteps: number;
  currentStep: number;
  activeColor?: string;
  inactiveColor?: string;
  dotSize?: number;
  spacing?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  title, 
  backRoute,
  backParams, 
  totalSteps,
  currentStep,
  activeColor = COLORS.primary, 
  inactiveColor = COLORS.textLight,
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

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}> */}
        {backRoute && (<TouchableOpacity onPress={() => router.push({ pathname: backRoute, params: backParams})} style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* <BackIcon width={20} height={20} fill={COLORS.text} /> */}
          <Feather name="arrow-left" size={16} color={COLORS.textLight} />
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>)}
        {!backRoute && (<View style={{ flex: 1 }} />)}
        {/* </View> */}
        {totalSteps && (<View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {dots}
          <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
        </View>)}
      </View>
      
      <View style={[styles.row, {justifyContent: 'center', marginTop: 10}]}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    // borderBottomColor: COLORS.border,
    // borderBottomWidth: 2,
    // alignItems: 'flex-start', // Align content to left
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 10,
  },
  back: {
    color: COLORS.textLight,
    paddingLeft: 5,
    fontSize: 14
  },
  stepText: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.textLight,
  },
  dot: {
    // Dynamic styles applied inline
    paddingRight: 5
  },
});

export default StepIndicator;