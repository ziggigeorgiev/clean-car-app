import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView, // For handling keyboard pushing content
  Platform, // To check platform for KeyboardAvoidingView
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon
import LoadingSpinner from "../../components/LoadingSpinner";
import { Device } from '../../services/Device';
import { COLORS } from '../../constants/colors';
import StepIndocator from '../../components/StepIndicator';
import { useTranslation, Locale } from '../../services/i18n';
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

const SettingsScreen = () => {
  const { t, locale, setLocale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneIdentifier, setPhoneIdentifier] = useState('');

  // Snapshot of the values as last loaded/saved, used to detect changes.
  const [initial, setInitial] = useState({ name: '', plateNumber: '', phoneNumber: '', email: '' });

  // Fetch services from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const phoneIdentifier = await Device.getPhoneIdentifier()
        setPhoneIdentifier(phoneIdentifier ?? 'NA')

        const name = (await Device.getName()) ?? '';
        setName(name)

        const phoneNumber = (await Device.getPhoneNumber()) ?? '';
        setPhoneNumber(phoneNumber)

        const plateNumber = (await Device.getPlateNumber()) ?? '';
        setPlateNumber(plateNumber)

        const email = (await Device.getEmail()) ?? '';
        setEmail(email)

        setInitial({ name, plateNumber, phoneNumber, email });
      } catch (error) {
        console.error(`Error fetching settings:`, error);
      } finally {
        setLoading(false);
        setSaved(false)
      }
    };

    fetchData();
  }, []);

  const isDirty =
    name !== initial.name ||
    plateNumber !== initial.plateNumber ||
    phoneNumber !== initial.phoneNumber ||
    email !== initial.email;

  const saveSettings = async () => {
    if (!isDirty) return;
    await Device.setName(name);
    await Device.setPhoneNumber(phoneNumber);
    await Device.setPlateNumber(plateNumber);
    await Device.setEmail(email);
    setInitial({ name, plateNumber, phoneNumber, email });
    setSaved(true);
  };
  
  if (loading) return <LoadingSpinner message={t('loading.device_info')} />;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <StepIndocator title={t('screen.settings')} backRoute={""} backParams={{}} totalSteps={0} currentStep={0} />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          {saved && (<View style={styles.saved}><Text style={styles.savedText}>{t('settings.saved')}</Text></View>)}

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>{t('settings.language')}</Text>
            <View style={styles.langRow}>
              {(['de', 'en'] as Locale[]).map((code) => {
                const isActive = locale === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => setLocale(code)}
                    style={[styles.langPill, isActive && styles.langPillActive]}
                  >
                    <Text style={[styles.langPillText, isActive && styles.langPillTextActive]}>
                      {code === 'de' ? t('settings.lang_de') : t('settings.lang_en')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.info}>{t('settings.language_help')}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>{t('settings.device_info')}</Text>
            <View style={styles.deviceContainer}>
              <View><Text>{t('settings.device_id')}</Text></View>
              <View><Text>{phoneIdentifier}</Text></View>
            </View>
            <View><Text style={styles.info}>{t('settings.device_info_help')}</Text></View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>{t('settings.personal_info')}</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color="#8e8e93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('settings.name')}
                placeholderTextColor="#8e8e93"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            {BRAND.hasVehiclePlate && (
              <View style={styles.inputContainer}>
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
            )}
            <View style={styles.inputContainer}>
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
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="phone" size={20} color="#8e8e93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('settings.email')}
                placeholderTextColor="#8e8e93"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
            <View><Text style={styles.info}>{t('settings.personal_help')}</Text></View>
          </View>
        </ScrollView>

        {/* Place Order Button (Fixed at Bottom) */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, !isDirty && styles.saveButtonDisabled]}
            onPress={saveSettings}
            disabled={!isDirty}
            activeOpacity={isDirty ? 0.7 : 1}
          >
            <Text style={styles.saveButtonText}>
              {t('btn.save_settings')}
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
    paddingHorizontal: 10,
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
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Adjust for iOS home indicator
    backgroundColor: COLORS.background,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15, // More rounded corners
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5, // Space above the button
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.6,
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
  deviceContainer: {
    flex: 1,
    gap: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    fontSize: 14,
    color: COLORS.textLight
  },
  saved: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedText: {
    fontSize: 14,
    color: COLORS.textLight
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  langPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  langPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langPillText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  langPillTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default SettingsScreen;