import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon
import { CleanCarAPI } from "../../services/CleanCarApi";

import { COLORS } from '../../constants/colors';
import StepIndocator from '../../components/StepIndicator';
import LoadingSpinner from "../../components/LoadingSpinner";
import ServiceDetailsList from '../../components/ServiceDetailsList';
import { Transformations } from "../../services/Transformations";
import { router, useLocalSearchParams } from 'expo-router';
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
  const [loading, setLoading] = useState(false);

  const [plateNumber, setPlateNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [services, setServices] = useState<Service[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<{ [id: number]: boolean }>({});

  const { location, availability} = useLocalSearchParams();
  
  // Fetch services from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await CleanCarAPI.getServices();
        setServices(data.filter((s: { is_active: any; }) => s.is_active));

        // Preselect all extras as false
        const extras = data.filter((s: { category: string; }) => s.category === 'Extra');
        setSelectedExtras(
          Object.fromEntries(extras.map((e: { id: any; }) => [e.id, false]))
        );
      } catch (error) {
        console.error(`Error fetching services:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    const services = totalSelectedServices().map(s => s.id)
    alert(
      `Services confirmed: ${services}`
    );
    console.log("location", location)
    router.push({ pathname: '/confirm', params: { 
        location: location, 
        availability: availability,
        services: JSON.stringify(services),
        plateNumber: plateNumber,
        phoneNumber: phoneNumber
      } 
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <StepIndocator totalSteps={3} currentStep={3} />
          </View>

          {/* Vehicle Details Section */}
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="car" size={20} color="#8e8e93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Registration Number"
              placeholderTextColor="#8e8e93"
              value={plateNumber}
              onChangeText={setPlateNumber}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="phone" size={20} color="#8e8e93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#8e8e93"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          {/* Additional Services Section */}
          <Text style={styles.sectionTitle}>Additional Services</Text>
          {extraServices.map(service => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceItem}
              onPress={() => handleExtraToggle(service.id)}
            >
              <View style={styles.serviceLeft}>
                {/* <View
                  style={[
                    styles.checkbox,
                    [service.id] && styles.checkboxSelected,
                  ]}
                >
                  {selectedServices[service.id] && (
                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                  )}
                </View> */}
                <View style={[styles.outerCheckboxContainer, { backgroundColor: selectedExtras[service.id] ? '#D1EAD0' : '#E0E0E0' } ]}>
                    <View style={[styles.innerCheckboxContainer, { backgroundColor: selectedExtras[service.id] ? '#28A745': '#90949C' }]}>
                    {/* Option 1: Using react-native-vector-icons (Recommended) */}
                    {/* <Icon name="check" style={dynamicStyles.checkmarkIcon} /> */}
        
                    {/* Option 2: Using a simple text character (Fallback if no icon library) */}
                    <Text style={styles.checkmarkIcon}>✓</Text>
                    </View>
                </View>
                <View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
              </View>
              <Text style={styles.servicePrice}>{service.price} {service.currency}</Text>
            </TouchableOpacity>
          ))}

          {/* Service Details Section */}
          <ServiceDetailsList
            services={Transformations.transformServices(totalSelectedServices())}
            sectionTitle="Services Provided" // Optional: customize the title
          />

          {/* Payment Method Icons */}
          <View style={styles.paymentIconsContainer}>
            <MaterialCommunityIcons name="credit-card-check-outline" size={25} color="#000" />
            <MaterialCommunityIcons name="credit-card-check-outline" size={25} color="#000" />
            <MaterialCommunityIcons name="credit-card-check-outline" size={25} color="#000" />
          </View>

          {/* Terms Text */}
          <Text style={styles.termsText}>
            By placing order you agree to our Terms
          </Text>
        </ScrollView>

        {/* Place Order Button (Fixed at Bottom) */}
        <View style={styles.placeOrderButtonContainer}>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.placeOrderButtonText}>
              {/* Place Order • ${totalAmount} */}
              Place Order
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
    backgroundColor: '#f8f8f8', // Light background color
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.primary,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    color: '#333',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow text to wrap
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    paddingLeft: 10,
    paddingRight: 10
  },
  serviceDescription: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    width: '90%', // Limit width to prevent overflow
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    backgroundColor: '#f8f8f8',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default ServicesScreen;