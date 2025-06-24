import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import CleaningProcessStep from '../../components/CleaningProcessStep';
import ServiceDetailsList from '../../components/ServiceDetailsList';
import { COLORS } from "../../constants/colors";
import { orderStyles } from '../../assets/styles/order.styles';

interface ServiceItem {
  name: string;
  price: string;
  type: 'primary' | 'secondary'; // Added type for service item
}

interface CleaningStep {
  id: string;
  label: string;
  status: 'completed' | 'in-progress' | 'pending';
}

const DUMMY_SERVICES: ServiceItem[] = [
  { name: 'Basic cleaning', price: '$70.97', type: 'primary' },
  { name: '1 x Exterior Wash', price: '$29.99', type: 'secondary' },
  { name: '1 x Interior Vacuum', price: '$19.99', type: 'secondary' },
  { name: '1 x Dashboard Cleaning', price: '$14.99', type: 'secondary' },
  { name: 'Extras', price: '$30.00', type: 'primary' },
  { name: '1 x Baby Chair Cleaning', price: '$29.99', type: 'secondary' },
];

const DUMMY_CLEANING_PROCESS: CleaningStep[] = [
  { id: '1', label: 'Booking Confirmed', status: 'completed' },
  { id: '2', label: 'Cleaner Assigned', status: 'completed' },
  { id: '3', label: 'On the way', status: 'completed' },
  { id: '4', label: 'Cleaning in Progress', status: 'in-progress' },
  { id: '5', label: 'Quality Check', status: 'pending' },
  { id: '6', label: 'Completed', status: 'pending' },
];

const DUMMY_EXPECTATIONS: string[] = [
  'Cleaner arrives at scheduled time',
  'Average cleaning duration: 25 minutes',
  'Quality inspection after cleaning',
  'Payment processed after service completion',
];

const OrderDetailScreen: React.FC = () => {

  const { id: orderId } = useLocalSearchParams();
  const router = useRouter();

  const renderServiceItem = ({ name, price, type }: ServiceItem) => (
    <View key={name} style={orderStyles.serviceItem}>
      <Text style={orderStyles.serviceName}>{name}</Text>
      <Text style={orderStyles.servicePrice}>{price}</Text>
    </View>
  );

  const renderExpectationItem = (text: string, index: number) => (
    <View key={index} style={orderStyles.expectationItem}>
      <Text style={orderStyles.bulletPoint}>•</Text>
      <Text style={orderStyles.expectationText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={orderStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <ScrollView contentContainerStyle={orderStyles.scrollViewContent}>

        <View style={orderStyles.header}>
            {/* You could add a back arrow icon here */}
            {/* <Icon name="arrow-back" size={24} color="#333" style={styles.backIcon} /> */}
            <Ionicons name="chevron-back-outline" size={24} style={orderStyles.backIcon} onPress={() => router.push("/list-orders")} />
            <Text style={orderStyles.headerTitle}>Order Details</Text>
          </View>
        

        {/* Header Section */}
        <View>
          <View style={orderStyles.statusContainer}>
            <View style={orderStyles.statusRow}>
              <Text style={orderStyles.statusText}>Open</Text>
              <Text style={orderStyles.dateTimeText}>Today, 2:30 PM</Text>
            </View>

            <View style={orderStyles.carDetails}>
              {/* Using emojis as fallback for icons */}
              <Ionicons name='car-sport-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="car" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.carPlate}>M-ST 2026</Text>
            </View>
          </View>

          <View style={orderStyles.contactDetails}>
            <View style={orderStyles.detailRow}>
              <Ionicons name='pin-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="map-marker" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.detailText}>
                123 Park Avenue, New York, NY{'\n'}10002
              </Text>
            </View>
            <View style={orderStyles.detailRow}>
              <Ionicons name='call-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="phone" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.detailText}>+1 (555) 123-4567</Text>
            </View>
          </View>
        </View>

        {/* Service Details Section */}
        <ServiceDetailsList
          services={DUMMY_SERVICES}
          sectionTitle="Services Provided" // Optional: customize the title
        />

        {/* Cleaning Process Section */}
        <View style={orderStyles.sectionContainer}>
          <Text style={orderStyles.sectionTitle}>Cleaning Process</Text>
          {DUMMY_CLEANING_PROCESS.map((step, index) => (
            <CleaningProcessStep
              key={step.id}
              label={step.label}
              status={step.status}
            />
          ))}
        </View>

        {/* What to Expect Section */}
        <View style={orderStyles.sectionContainer}>
          <Text style={orderStyles.sectionTitle}>What to Expect</Text>
          {DUMMY_EXPECTATIONS.map(renderExpectationItem)}
        </View>

        {/* Policy Links Section */}
        <View style={orderStyles.policyLinksContainer}>
          <TouchableOpacity
            style={orderStyles.policyLink}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            <Text style={orderStyles.policyLinkText}>Terms & Conditions</Text>
            <Text style={orderStyles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={orderStyles.policyLink}
            onPress={() => Linking.openURL('https://example.com/privacy')}
          >
            <Text style={orderStyles.policyLinkText}>Privacy Policy</Text>
            <Text style={orderStyles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={orderStyles.policyLink}
            onPress={() => Linking.openURL('https://example.com/cancellation')}
          >
            <Text style={orderStyles.policyLinkText}>Cancellation Policy</Text>
            <Text style={orderStyles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;