import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, AntDesign, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

const ServiceCard = ({ iconName, title, description, includeText, includeIcon, colors, cardStyle = {} }: {
    iconName: any;
    title: any;
    description: any;
    includeText: any;
    includeIcon: any;
    colors: any;
    cardStyle?: any;
}) => (
  <TouchableOpacity style={[styles.serviceCard, cardStyle]}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <MaterialCommunityIcons name={iconName} size={30} color={COLORS.white} />
      <Text style={styles.serviceCardTitle}>{title}</Text>
      <Text style={styles.serviceCardDescription}>{description}</Text>
      {includeText && (
        <View style={styles.includeContainer}>
          <AntDesign name={includeIcon} size={14} color={COLORS.white} />
          <Text style={styles.includeText}>{includeText}</Text>
        </View>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  serviceCard: {
    width: width * 0.8,
    height: 180,
    borderRadius: 15,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  serviceCardDescription: {
    fontSize: 14,
    color: COLORS.white,
  },
  includeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  includeText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
  },
});

export default ServiceCard;