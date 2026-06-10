import React, {useState} from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Platform, Alert } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, AntDesign, Feather } from '@expo/vector-icons'; // Assuming Expo icons for simplicity
import { COLORS } from '@/constants/colors';
import { router, useLocalSearchParams } from "expo-router";
import LoadingSpinner from "@/components/LoadingSpinner";
import StepIndocator from '@/components/StepIndicator';
// NOTE: expo-calendar is a native module that isn't bundled in Expo Go. We load
// it lazily inside the handler (see loadCalendar) so the screen still renders in
// Expo Go; the "Add to Calendar" button just shows a friendly message there.
// It works fully in a dev/standalone build.
import { CleanCarAPI } from '@/services/CleanCarApi';
import { Device } from '@/services/Device';
import { useTranslation } from '@/services/i18n';

// Duration of a single booking slot (minutes). Keep in sync with backend bulk_create_for_day step_minutes.
const BOOKING_DURATION_MINUTES = 90;

// Lazily require expo-calendar. Returns the module, or null if the native
// module isn't available (e.g. running in Expo Go).
function loadCalendar(): typeof import('expo-calendar') | null {
  try {
    return require('expo-calendar');
  } catch {
    return null;
  }
}

const AcknowledgeScreen = () => {
  const { t } = useTranslation();

  const { id: orderIdParam } = useLocalSearchParams();
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  const [loading, setLoading] = useState(false);
  
  const createCalendarEvent = async () => {
    if (!orderId) {
      Alert.alert("No order ID available");
      return;
    }

    // Not available in Expo Go — show a friendly note instead of crashing.
    const Calendar = loadCalendar();
    if (!Calendar) {
      Alert.alert(
        t('btn.add_to_calendar'),
        'Adding to the calendar needs the full app build and is not available here.'
      );
      return;
    }

    try {
      setLoading(true);

      // Fetch the latest order to get the scheduled time, address, services, etc.
      const phoneIdentifier = await Device.getPhoneIdentifier();
      const order = await CleanCarAPI.getOrderByByPhoneIdentifierAndId(
        phoneIdentifier,
        parseInt(orderId)
      );

      if (!order?.availability?.time) {
        Alert.alert("Booking time unavailable", "Could not load the scheduled time for this booking.");
        return;
      }

      // Request calendar permission
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Calendar permission denied",
          "Enable Calendar access for the app in Settings to add bookings to your calendar."
        );
        return;
      }

      const start = new Date(order.availability.time);
      const end = new Date(start.getTime() + BOOKING_DURATION_MINUTES * 60 * 1000);

      const serviceNames = (order.services || []).map((s: any) => s.name).filter(Boolean).join(', ');
      const title = order.plate_number ? `Cleaning: ${order.plate_number}` : 'Cleaning';
      const notes = [
        `Order #${order.id}`,
        serviceNames ? `Services: ${serviceNames}` : null,
        order.phone_number ? `Phone: ${order.phone_number}` : null,
      ].filter(Boolean).join('\n');

      // Opens the native calendar UI pre-filled with our event so the user can confirm + pick a calendar
      await Calendar.createEventInCalendarAsync({
        title,
        startDate: start,
        endDate: end,
        location: order.location?.address ?? '',
        notes,
        timeZone: Calendar.DEFAULT,
      });
    } catch (e: any) {
      console.error("Failed to add to calendar:", e);
      Alert.alert("Could not add event", e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message={t('loading.booking_confirmation')} />;

  return (
    <View style={styles.container}>
        <StepIndocator title={t('screen.acknowledge')} backRoute={""} backParams={{}} totalSteps={0} currentStep={0} />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          <View style={[ styles.sectionContainer, styles.center ]}>
            <View style={[styles.outerCheckboxContainer, { backgroundColor: '#D1EAD0', marginBottom: 20 } ]}>
              <View style={[styles.innerCheckboxContainer, { backgroundColor: '#28A745' }]}>
                <Text style={styles.checkmarkIcon}>✓</Text>
              </View>
            </View>
            <View style={[ styles.center, {marginBottom: 10} ]}><Text style={styles.confirm}>{t('ack.confirmed')}</Text></View>
            <View style={[ styles.center, {marginBottom: 0} ]}><Text style={styles.info}>{t('ack.scheduled')}</Text></View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => { router.push(`/order/${orderId}`) }}
          >
            <Text style={styles.buttonText}>
              {t('btn.view_booking_details')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.buttonContainer, {backgroundColor: COLORS.white}]}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.primary}]}
            onPress={createCalendarEvent}
          >
            <Text style={[styles.buttonText, {color: COLORS.primary}]}>
              {t('btn.add_to_calendar')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[ styles.center, {marginBottom: 20, marginTop: 20, flexDirection: 'row' } ]}>
            <MaterialCommunityIcons name="phone" size={20} color={COLORS.textLight} style={{marginHorizontal: 5}} />
            <Text style={styles.info}>{t('ack.help')}</Text>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Light background color
  },
  scrollViewContent: {
    paddingTop: 10,
    paddingBottom: 20, // Ensure padding for content above the fixed button
  },
  sectionContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 50,
    paddingBottom: 10,
    // shadowColor: COLORS.shadow,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 5,
    // elevation: 3, // For Android shadow
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  outerCheckboxContainer: {
    width: 60,
    height: 60,
    borderRadius: 32, // Makes it perfectly round
    backgroundColor: '#D1EAD0', // A lighter shade of green for the outer circle
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.75, // Slightly transparent for a modern look
  },
  innerCheckboxContainer: {
    width: 40,
    height: 40, // Adjusted size for a more compact checkbox
    borderRadius: 20, // Makes it perfectly round
    backgroundColor: '#28A745', // Darker green background for the checkmark itself
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    fontSize: 16, // Adjust icon size relative to container size
    color: COLORS.white, // White checkmark
    fontWeight: '800', // Make the checkmark bold for better visibility
  },
  confirm: {
    fontSize: 24,
    color: COLORS.text
  },
  info: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 5 : 5, // Adjust for iOS home indicator
      backgroundColor: COLORS.background,
  },
  button: {
      backgroundColor: COLORS.primary,
      borderRadius: 15, // More rounded corners
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 5, // Space above the button
  },
  buttonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '600',
  }
});

export default AcknowledgeScreen;
