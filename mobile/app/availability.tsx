import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format, parseISO } from "date-fns";

import { CleanCarAPI } from "../services/CleanCarApi";
import { COLORS } from '../constants/colors';
import StepIndocator from '../components/StepIndicator';
import LoadingSpinner from "../components/LoadingSpinner";

const AvailabilityScreen = () => {
  const [loading, setLoading] = useState(false);
  const [availabilities, setAvailabilities] = useState<{ [date: string]: any[] }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<any | null>(null);

  // Fetch availabilities from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await CleanCarAPI.getAvailabilities();
        setAvailabilities(data);

        // Pre-select the first date with availabilities
        const datesWithAvail = Object.keys(data).filter(date => data[date]?.length > 0);
        if (datesWithAvail.length > 0) {
          setSelectedDate(datesWithAvail[0]);
          setSelectedAvailability(data[datesWithAvail[0]][0]);
        } else {
          setSelectedDate(null);
          setSelectedAvailability(null);
        }
      } catch (error) {
        console.error(`Error fetching availabilities:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // When selectedDate changes, pre-select first available time
  useEffect(() => {
    if (selectedDate && availabilities[selectedDate]?.length > 0) {
      setSelectedAvailability(availabilities[selectedDate][0]);
    } else {
      setSelectedAvailability(null);
    }
  }, [selectedDate, availabilities]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // The effect above will pre-select the first availability for this date
  };

  const handleTimeSelect = (availability: any) => {
    setSelectedAvailability(availability);
  };

  const handleConfirmAvailability = () => {
    if (!selectedAvailability) {
      alert('Please select an available time.');
      return;
    }
    // Persist the entire availability object (with id)
    console.log('Confirmed Availability:', selectedAvailability);
    alert(
      `Appointment confirmed for ${format(parseISO(selectedAvailability.time), "EEEE, MMM d, yyyy 'at' h:mm a")}`
    );
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  // Prepare date pills from API keys
  const dateKeys = Object.keys(availabilities).sort();

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
          {dateKeys.map((dateKey, index) => {
            const dateObj = parseISO(dateKey);
            const isSelected = selectedDate === dateKey;
            return (
              <TouchableOpacity
                key={dateKey}
                style={[
                  styles.datePill,
                  isSelected && styles.selectedDatePill,
                  availabilities[dateKey]?.length === 0 && { opacity: 0.5 }
                ]}
                onPress={() => handleDateSelect(dateKey)}
                disabled={availabilities[dateKey]?.length === 0}
              >
                <Text
                  style={[
                    styles.datePillDayOfWeek,
                    isSelected && styles.selectedDatePillText,
                  ]}
                >
                  {format(dateObj, 'EEE')}
                </Text>
                <Text
                  style={[
                    styles.datePillDayOfMonth,
                    isSelected && styles.selectedDatePillText,
                  ]}
                >
                  {format(dateObj, 'd')}
                </Text>
                <Text
                  style={[
                    styles.datePillMonth,
                    isSelected && styles.selectedDatePillText,
                  ]}
                >
                  {format(dateObj, 'MMM')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Available Times Section */}
        <Text style={styles.sectionTitle}>Available Times</Text>
        <View style={styles.timeSlotsContainer}>
          {selectedDate && availabilities[selectedDate]?.length > 0 ? (
            availabilities[selectedDate].map((availability: any) => {
              const timeLabel = format(parseISO(availability.time), 'h:mm a');
              const isSelected = selectedAvailability?.id === availability.id;
              return (
                <TouchableOpacity
                  key={availability.id}
                  style={[
                    styles.timeSlotPill,
                    isSelected && styles.selectedTimeSlotPill,
                  ]}
                  onPress={() => handleTimeSelect(availability)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      isSelected && styles.selectedTimeSlotText,
                    ]}
                  >
                    {timeLabel}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ color: '#888', fontStyle: 'italic' }}>
              No available times for this date.
            </Text>
          )}
        </View>

        {/* Recent Availability Section */}
        <Text style={styles.sectionTitle}>Recent Availability</Text>
        <View style={styles.recentAvailabilityItem}>
          <MaterialCommunityIcons name="map-marker-outline" size={20} color="#666" style={styles.recentAvailabilityIcon} />
          <Text style={styles.recentAvailabilityText}>
            {selectedAvailability
              ? `${format(parseISO(selectedAvailability.time), "EEEE, MMM d, yyyy - h:mm a")}`
              : 'No recent availability selected.'}
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Availability Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmAvailability}
          disabled={!selectedAvailability}
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