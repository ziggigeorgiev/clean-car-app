import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView, // For handling keyboard pushing content
  Platform, // To check platform for KeyboardAvoidingView
  Linking
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon
import LoadingSpinner from "../../components/LoadingSpinner";
import { CleanCarAPI } from "../../services/CleanCarApi";
import { Device } from '../../services/Device';
import { COLORS } from '../../constants/colors';
import StepIndocator from '../../components/StepIndicator';
import ServiceDetailsList from '../../components/ServiceDetailsList';
import { Transformations } from "../../services/Transformations";
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Price from '../../components/Price';
import { useTranslation } from '../../services/i18n';
// You might need to install react-native-vector-icons:
// npm install react-native-vector-icons
// npx react-native link react-native-vector-icons
// For iOS, also run: cd ios && pod install

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  is_active: boolean;
  // Add other fields as needed
};

const ServicesScreen = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [plateNumber, setPlateNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [services, setServices] = useState<Service[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<{ [id: number]: boolean }>({});
  const [showErrors, setShowErrors] = useState(false);

  // Validation
  const plateNumberTrimmed = plateNumber.trim();
  const phoneNumberTrimmed = phoneNumber.trim();
  const plateError = plateNumberTrimmed.length < 2 ? t('services.error_plate') : '';
  const phoneError = !/^\+?[0-9 \-()]{7,}$/.test(phoneNumberTrimmed) ? t('services.error_phone') : '';
  const isFormValid = !plateError && !phoneError;

  const { location, availability} = useLocalSearchParams();
    
  console.log("--------------------")
  console.log("location", location)

  // Loads the service catalog + prefills plate/phone from stored settings only.
  // If nothing is stored in settings, the fields stay empty.
  const loadFromSettings = useCallback(async (opts?: { resetExtras?: boolean }) => {
    setLoading(true);
    try {
      const data = await CleanCarAPI.getServices();
      const activeServices = data.filter((s: { is_active: any; }) => s.is_active);
      setServices(activeServices);

      if (opts?.resetExtras !== false) {
        const extras = data.filter((s: { category: string; }) => s.category === 'Extra');
        setSelectedExtras(
          Object.fromEntries(extras.map((e: { id: any; }) => [e.id, false]))
        );
      }

      // Prefill only from saved settings; otherwise leave empty.
      const storedPhone = await Device.getPhoneNumber();
      const storedPlate = await Device.getPlateNumber();
      setPhoneNumber(storedPhone ?? '');
      setPlateNumber(storedPlate ?? '');
      setShowErrors(false);
    } catch (error) {
      console.error(`Error fetching services:`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch services catalog + reset inputs to settings on every focus.
  // This guarantees no stale data leaks between bookings: each visit to the
  // services step is a clean slate, only pre-filled from saved Settings.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        // Consume the post-booking flag if present (kept for symmetry, but the
        // reset happens on every focus now regardless).
        await Device.consumeOrderPlacedFlag();
        if (!cancelled) {
          await loadFromSettings({ resetExtras: true });
        }
      })();
      return () => { cancelled = true; };
    }, [loadFromSettings])
  );

  // Split services
  const basicServices = services.filter(s => s.category === 'Basic');
  const extraServices = services.filter(s => s.category === 'Extra');

  const handleExtraToggle = (id: number) => {  
    setSelectedExtras(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
    const selectedExtraServices = extraServices.filter(
      service => selectedExtras[service.id]
    );
  };

  const totalSelectedServices = () => {
    return [
      ...basicServices,
      ...extraServices.filter(
        service => selectedExtras[service.id]
      )
    ]
  }

  const handlePlaceOrder = () => {
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }
    const services = totalSelectedServices().map(s => s.id)
    console.log("location", location)
    router.push({ pathname: '/confirm', params: {
        location: location,
        availability: availability,
        services: JSON.stringify(services),
        plateNumber: plateNumberTrimmed,
        phoneNumber: phoneNumberTrimmed
      }
    });
  };

  if (loading) return <LoadingSpinner message={t('loading.device_info')} />;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <StepIndocator title={t('screen.services')} backRoute={"/availability"} backParams={{location: location}} totalSteps={3} currentStep={3} />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          {/* Vehicle Details Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>{t('services.vehicle_details')}</Text>
            <View style={[styles.inputContainer, showErrors && plateError ? styles.inputContainerError : null]}>
              <MaterialCommunityIcons name="car" size={20} color="#8e8e93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('services.registration_number')}
                placeholderTextColor="#8e8e93"
                value={plateNumber}
                onChangeText={setPlateNumber}
                autoCapitalize="characters"
              />
            </View>
            {showErrors && plateError ? <Text style={styles.errorText}>{plateError}</Text> : null}
            <View style={[styles.inputContainer, showErrors && phoneError ? styles.inputContainerError : null]}>
              <MaterialCommunityIcons name="phone" size={20} color="#8e8e93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('services.phone_number')}
                placeholderTextColor="#8e8e93"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
            {showErrors && phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>

          {/* Additional Services Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('services.additional')}</Text>
            {extraServices.map(service => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => handleExtraToggle(service.id)}
              >
                <View style={styles.serviceLeft}>
                  <View style={[styles.outerCheckboxContainer, { backgroundColor: selectedExtras[service.id] ? '#D1EAD0' : '#E0E0E0' } ]}>
                    <View style={[styles.innerCheckboxContainer, { backgroundColor: selectedExtras[service.id] ? '#28A745': '#90949C' }]}>
                      <Text style={styles.checkmarkIcon}>{selectedExtras[service.id] ? '✓' : '+'}</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                </View>
                <Price price={service.price} currency={service.currency} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Service Details Section */}
          <ServiceDetailsList
            services={Transformations.transformServices(totalSelectedServices())}
            sectionTitle={t('services.provided')}
          />

          {/* Payment Method Icons */}
          <View style={styles.paymentIconsContainer}>
            <MaterialCommunityIcons name="credit-card-check-outline" size={20} color={COLORS.textLight} />
            <MaterialCommunityIcons name="cash" size={24} color={COLORS.textLight} />
            <MaterialCommunityIcons name="bank-transfer" size={24} color={COLORS.textLight} />
          </View>

          {/* Terms Text */}
          <Text style={styles.termsText}>
            {t('services.terms_prefix')}<Text style={styles.linkText} onPress={() => Linking.openURL('https://clean-car-app.onrender.com/terms')}>{t('services.terms_link')}</Text>
          </Text>
        </ScrollView>

        {/* Place Order Button (Fixed at Bottom) */}
        <View style={styles.placeOrderButtonContainer}>
          <TouchableOpacity
            style={[styles.placeOrderButton, !isFormValid && styles.placeOrderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={!isFormValid}
            activeOpacity={isFormValid ? 0.7 : 1}
          >
            <Text style={styles.placeOrderButtonText}>
              {t('btn.place_order')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Light background color
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 10,
    paddingBottom: 20, // Ensure padding for content above the fixed button
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    alignItems: 'flex-start', // Align content to left
  },
  sectionContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.textLight
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    borderColor: COLORS.border,
    borderWidth: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 1.00,
    elevation: 3, // For Android shadow
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow text to wrap
    marginRight: 10,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    paddingLeft: 10,
    paddingRight: 10
  },
  serviceDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    width: 'auto', // Limit width to prevent overflow
  },
  paymentIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  termsText: {
    fontSize: 13,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 20,
  },
  placeOrderButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Adjust for iOS home indicator
    backgroundColor: COLORS.background,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15, // More rounded corners
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5, // Space above the button
  },
  placeOrderButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.6,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: '#D9534F',
  },
  errorText: {
    color: '#D9534F',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 4,
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
  linkText: {
    color: COLORS.primary,
    // textDecorationLine: 'underline',
  }
});

export default ServicesScreen;