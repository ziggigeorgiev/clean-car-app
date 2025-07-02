import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView, // For safe area on iOS
} from 'react-native';

import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon

import { COLORS } from '../constants/colors';
import StepIndocator from '../components/StepIndicator';

const AvailabilityScreen = () => {
  const [selectedDate, setSelectedDate] = useState('16 Oct'); // Initialize with default selected
  const [selectedTime, setSelectedTime] = useState('10:30 AM'); // Initialize with default selected

  // Dummy data for dates (you'd generate this dynamically in a real app)
  const dates = [
    { dayOfWeek: 'Mon', dayOfMonth: '16', month: 'Oct' },
    { dayOfWeek: 'Tue', dayOfMonth: '17', month: 'Oct' },
    { dayOfWeek: 'Wed', dayOfMonth: '18', month: 'Oct' },
    { dayOfWeek: 'Thu', dayOfMonth: '19', month: 'Oct' },
    { dayOfWeek: 'Fri', dayOfMonth: '20', month: 'Oct' },
    { dayOfWeek: 'Sat', dayOfMonth: '21', month: 'Oct' },
    { dayOfWeek: 'Sun', dayOfMonth: '22', month: 'Oct' },
    { dayOfWeek: 'Mon', dayOfMonth: '23', month: 'Oct' },
    { dayOfWeek: 'Tue', dayOfMonth: '24', month: 'Oct' },
    { dayOfWeek: 'Wed', dayOfMonth: '25', month: 'Oct' },
  ];

  // Dummy data for available times
  const availableTimes = [
    '9:00 AM',
    '9:45 AM',
    '10:30 AM',
    '11:15 AM',
    '12:00 PM',
    '12:45 PM',
    '1:30 PM',
    '2:15 PM',
    '3:00 PM',
    '3:45 PM',
    '4:30 PM',
    '5:15 PM',
  ];

  const handleConfirmAvailability = () => {
    // Logic to handle confirmation, e.g., navigate to next screen, make API call
    console.log('Confirmed Availability:', { selectedDate, selectedTime });
    alert(`Appointment confirmed for ${selectedDate} at ${selectedTime}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
            <StepIndocator totalSteps={3} currentStep={2} />
        </View>

        {/* Select Date Section */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView style={styles.datePickerContainer} horizontal={true} showsHorizontalScrollIndicator={false}>
          {dates.map((date, index) => (
            
            <TouchableOpacity
              key={index}
              style={[
                styles.datePill,
                selectedDate === `${date.dayOfMonth} ${date.month}` && styles.selectedDatePill,
              ]}
              onPress={() => setSelectedDate(`${date.dayOfMonth} ${date.month}`)}
            >
              <Text
                style={[
                  styles.datePillDayOfWeek,
                  selectedDate === `${date.dayOfMonth} ${date.month}` && styles.selectedDatePillText,
                ]}
              >
                {date.dayOfWeek}
              </Text>
              <Text
                style={[
                  styles.datePillDayOfMonth,
                  selectedDate === `${date.dayOfMonth} ${date.month}` && styles.selectedDatePillText,
                ]}
              >
                {date.dayOfMonth}
              </Text>
              <Text
                style={[
                  styles.datePillMonth,
                  selectedDate === `${date.dayOfMonth} ${date.month}` && styles.selectedDatePillText,
                ]}
              >
                {date.month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Available Times Section */}
        <Text style={styles.sectionTitle}>Available Times</Text>
        <View style={styles.timeSlotsContainer}>
          {availableTimes.map((time, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlotPill,
                selectedTime === time && styles.selectedTimeSlotPill,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.selectedTimeSlotText,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Availability Section */}
        <Text style={styles.sectionTitle}>Recent Availability</Text>
        <View style={styles.recentAvailabilityItem}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#666" style={styles.recentAvailabilityIcon} />
            <Text style={styles.recentAvailabilityText}>Monday, Oct 15, 2023 - 10:30 AM</Text>
        </View>
      </ScrollView>
    
    {/* Confirm Availability Button */}
    <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmAvailability}
        >
        <Text style={styles.confirmButtonText}>Confirm Availability</Text>
        </TouchableOpacity>
    </View>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light background color
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20, // Add padding for the scroll view content
  },
headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    alignItems: 'flex-start', // Align content to left
},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.primary,
    marginBottom: 5,
  },
  datePickerContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    gap: 10,
    paddingRight: 20,
    marginBottom: 30,
    flexWrap: 'wrap', // Allow dates to wrap if screen is too narrow
  },
  datePill: {
    backgroundColor: '#e9e9eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, // Spacing between pills
  },
  selectedDatePill: {
    backgroundColor: COLORS.primary,
  },
  datePillDayOfWeek: {
    fontSize: 13,
    color: '#8e8e93',
  },
  datePillDayOfMonth: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  datePillMonth: {
    fontSize: 13,
    color: '#8e8e93',
  },
  selectedDatePillText: {
    color: COLORS.white, // White text for selected date
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 30,
  },
  timeSlotPill: {
    backgroundColor: '#e9e9eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 100, // Ensure consistent width
    alignItems: 'center',
  },
  selectedTimeSlotPill: {
    backgroundColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  recentAvailabilityContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000', // Optional: for a subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // For Android shadow
  },
  confirmButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8f8f8', // Match background
    borderTopWidth: StyleSheet.hairlineWidth, // Subtle line
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15, // More rounded corners
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentAvailabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  recentAvailabilityIcon: {
    marginRight: 10,
    color: COLORS.textLight,
  },
  recentAvailabilityText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default AvailabilityScreen;