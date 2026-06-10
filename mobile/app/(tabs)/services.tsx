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
import { getServiceIcon } from '../../services/serviceIcons';
import { WebUrls } from '../../services/webUrls';
import { Image } from 'react-native';
import { BRAND } from '../../constants/brand';
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
  const { t, tService } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [plateNumber, setPlateNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [services, setServices] = useState<Service[]>([]);
  // Quantity per service id (0 = not selected). In 'toggle' mode this is just
  // 0/1; in 'quantity' mode (home app) it can be any positive integer.
  const [selectedQty, setSelectedQty] = useState<{ [id: number]: number }>({});
  const [showErrors, setShowErrors] = useState(false);

  const isQuantityMode = BRAND.serviceMode === 'quantity';

  // Validation
  const plateNumberTrimmed = plateNumber.trim();
  const phoneNumberTrimmed = phoneNumber.trim();
  // Plate is only required for brands that have a vehicle (car app).
  const plateError =
    BRAND.hasVehiclePlate && plateNumberTrimmed.length < 2 ? t('services.error_plate') : '';
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
        // In quantity mode every service is individually selectable (qty 0..n);
        // in toggle mode only the "Extra" services are user-selectable.
        const selectable = isQuantityMode
          ? activeServices
          : activeServices.filter((s: { category: string; }) => s.category === 'Extra');
        setSelectedQty(
          Object.fromEntries(selectable.map((e: { id: any; }) => [e.id, 0]))
        );
      }

      // Prefill only from saved settings; otherwise leave empty.
      const storedPhone = await Device.getPhoneNumber();
      setPhoneNumber(storedPhone ?? '');
      if (BRAND.hasVehiclePlate) {
        const storedPlate = await Device.getPlateNumber();
        setPlateNumber(storedPlate ?? '');
      }
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

  // In quantity mode all services get a stepper; in toggle mode only extras.
  const selectableServices = isQuantityMode ? services : extraServices;

  const qtyOf = (id: number) => selectedQty[id] ?? 0;

  const handleExtraToggle = (id: number) => {
    setSelectedQty(prev => ({
      ...prev,
      [id]: (prev[id] ?? 0) > 0 ? 0 : 1,
    }));
  };

  const incrementQty = (id: number) => {
    setSelectedQty(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const decrementQty = (id: number) => {
    setSelectedQty(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - 1) }));
  };

  // Selected services with their quantity attached (for preview + order).
  const totalSelectedServices = () => {
    const selectedSelectable = selectableServices
      .filter(service => qtyOf(service.id) > 0)
      .map(service => ({ ...service, quantity: qtyOf(service.id) }));
    // Toggle mode always includes the Basic package; quantity mode does not
    // (everything is explicitly chosen by the customer).
    return isQuantityMode
      ? selectedSelectable
      : [...basicServices.map(s => ({ ...s, quantity: 1 })), ...selectedSelectable];
  };

  const handlePlaceOrder = () => {
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }
    const selected = totalSelectedServices();
    const serviceIds = selected.map(s => s.id);
    const serviceQuantities: Record<number, number> = {};
    selected.forEach(s => { serviceQuantities[s.id] = s.quantity; });
    console.log("location", location)
    router.push({ pathname: '/confirm', params: {
        location: location,
        availability: availability,
        services: JSON.stringify(serviceIds),
        serviceQuantities: JSON.stringify(serviceQuantities),
        plateNumber: BRAND.hasVehiclePlate ? plateNumberTrimmed : '',
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

          {/* Contact / Vehicle Details Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>
              {BRAND.hasVehiclePlate ? t('services.vehicle_details') : t('section.contact_info')}
            </Text>
            {BRAND.hasVehiclePlate && (
              <>
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
              </>
            )}
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

          {/* Services Section: quantity steppers (home) or on/off extras (car) */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {isQuantityMode ? t('home.our_services') : t('services.additional')}
            </Text>
            {selectableServices.map(service => (
              <View key={service.id} style={styles.serviceItem}>
                {isQuantityMode ? (
                  <>
                    <View style={styles.serviceLeft}>
                      <View>
                        <Text style={styles.serviceName}>{tService(service, 'name')}</Text>
                        <Text style={styles.serviceDescription}>{tService(service, 'description')}</Text>
                      </View>
                    </View>
                    <View style={styles.qtyControls}>
                      <Price price={service.price} currency={service.currency} />
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={[styles.stepperBtn, qtyOf(service.id) === 0 && styles.stepperBtnDisabled]}
                          onPress={() => decrementQty(service.id)}
                          disabled={qtyOf(service.id) === 0}
                        >
                          <Text style={styles.stepperBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{qtyOf(service.id)}</Text>
                        <TouchableOpacity style={styles.stepperBtn} onPress={() => incrementQty(service.id)}>
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => handleExtraToggle(service.id)}
                  >
                    <View style={styles.serviceLeft}>
                      <View style={[styles.outerCheckboxContainer, { backgroundColor: qtyOf(service.id) > 0 ? '#D1EAD0' : '#E0E0E0' } ]}>
                        <View style={[styles.innerCheckboxContainer, { backgroundColor: qtyOf(service.id) > 0 ? '#28A745': '#90949C' }]}>
                          <Text style={styles.checkmarkIcon}>{qtyOf(service.id) > 0 ? '✓' : '+'}</Text>
                        </View>
                      </View>
                      <View>
                        <Text style={styles.serviceName}>{tService(service, 'name')}</Text>
                        <Text style={styles.serviceDescription}>{tService(service, 'description')}</Text>
                      </View>
                    </View>
                    <Price price={service.price} currency={service.currency} />
                  </TouchableOpacity>
                )}
              </View>
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
            {t('services.terms_prefix')}<Text style={styles.linkText} onPress={() => Linking.openURL(WebUrls.terms)}>{t('services.terms_link')}</Text>
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
  extraServiceIcon: {
    width: 32,
    height: 32,
    marginHorizontal: 10,
    borderRadius: 16,
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
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  qtyControls: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: '#C7C7C7',
  },
  stepperBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  stepperValue: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default ServicesScreen;