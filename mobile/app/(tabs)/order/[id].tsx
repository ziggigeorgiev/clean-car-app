import React, { Key, useCallback, useEffect, useState } from "react";
import { useFocusEffect } from 'expo-router';
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  RefreshControl,
  StyleSheet,
  Platform
} from 'react-native';
import { useLocalSearchParams } from "expo-router";

import { COLORS } from "../../../constants/colors";
import ServiceDetailsList from '../../../components/ServiceDetailsList';
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Device } from '../../../services/Device';
import { CleanCarAPI } from "../../../services/CleanCarApi";
import { Transformations } from "../../../services/Transformations";
import ContactDetails from "@/components/ContactDetails";
import AddressDetails from "@/components/AddressDetails";
import AvailabilityDetails from "@/components/AvailabilityDetails";
import ProgressDetails from "@/components/ProgressDetails";
import Details from "@/components/Details";
import StepIndocator from "@/components/StepIndicator";
import { useTranslation } from "@/services/i18n";
import { WebUrls } from "@/services/webUrls";

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

interface Order {
  id: number;
  status: string;
  plate_number: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  phone_number: string;
  services: any[];
  availability?: {
    time: string;
  };
  // Add other fields as needed
}

const OrderDetailScreen: React.FC = () => {
  const { t } = useTranslation();

  const { id: orderIdParam } = useLocalSearchParams();
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [services, setServices] = useState<any>([]);
  const [processSteps, setProcessSteps] = useState<any>([]);

  const fetchData = async () => {
    setLoading(true);

    const phoneIdentifier = await Device.getPhoneIdentifier();
    if (!phoneIdentifier) {
      console.error("Phone identifier is not available.");
      return;
    }

    try {
      const order = await CleanCarAPI.getOrderByByPhoneIdentifierAndId(phoneIdentifier, parseInt(orderId));
      setOrder(order);

      const transformedServices = Transformations.transformServices(order?.services || []);
      setServices(transformedServices);

      const transformedProcessSteps = Transformations.transformProcessSteps(order?.process_steps || [])
      setProcessSteps(transformedProcessSteps)
    } catch (error) {
      console.error(`Error fetching orders for phone identifier ${phoneIdentifier}:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  // Re-fetch every time the screen is focused so the user always sees fresh
  // process step / status data from the server.
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [orderId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // await sleep(1000);
    await fetchData();
    setRefreshing(false);
  };

  const expectations: string = t('section.expectations');

  const renderServiceItem = ({ name, price, type }: ServiceItem) => (
    <View key={name} style={styles.serviceItem}>
      <Text style={styles.serviceName}>{name}</Text>
      <Text style={styles.servicePrice}>{price}</Text>
    </View>
  );

  const renderExpectationItem = (text: string, index: number) => (
    <View key={index} style={styles.expectationItem}>
      <Text style={styles.bulletPoint}>•</Text>
      <Text style={styles.expectationText}>{text}</Text>
    </View>
  );


  if (loading && !refreshing) return <LoadingSpinner message={t('loading.order_details')} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StepIndocator title={t('screen.order_details')} backRoute={""} backParams={{}} totalSteps={0} currentStep={0} />
      <Text style={styles.swipeHint}>{t('swipe_to_refresh')}</Text>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.scrollViewContent}>
        
        <ProgressDetails process_steps={processSteps}/>

        <AvailabilityDetails
          time={order?.availability?.time ?? ""}
          sectionTitle={t('section.availability')}
        />
        <ContactDetails
          phoneNumber={order?.phone_number ?? ""}
          plateNumber={order?.plate_number ?? ""}
          sectionTitle={t('section.contact_info')}
        />

        <AddressDetails
          address={order?.location?.address ?? ""}
          latitude={order?.location?.latitude ?? 0}
          longitude={order?.location?.longitude ?? 0}
          sectionTitle={t('section.location')}
        />
        {/* Service Details Section */}
        {/* <View style={styles.delimiter} /> */}
        <ServiceDetailsList
          services={services}
          sectionTitle={t('services.selected')}
        />

        {/* Cleaning Process Section */}
        {/* <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cleaning Process</Text>
          {processSteps.map((step: { id: Key | null | undefined; name: string; status: string; }, index: any) => (
            <CleaningProcessStep
              key={step.id}
              name={step.name}
              status={
                (['completed', 'in-progress', 'pending'].includes(step.status)
                  ? step.status
                  : 'pending') as 'completed' | 'in-progress' | 'pending'
              }
            />
          ))}
        </View> */}
        <Details
          text={expectations}
          sectionTitle={t('section.what_to_expect')}
        />

        {/* Policy Links Section */}
        <View style={styles.policyLinksContainer}>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL(WebUrls.terms)}
          >
            <Text style={styles.policyLinkText}>{t('policy.terms')}</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL(WebUrls.privacy)}
          >
            <Text style={styles.policyLinkText}>{t('policy.privacy')}</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL(WebUrls.cancellation)}
          >
            <Text style={styles.policyLinkText}>{t('policy.cancellation')}</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Light background for the screen
  },
  scrollViewContent: {
    paddingBottom: 0, // Add some padding at the bottom of the scroll view
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: COLORS.background,
  },
  statusContainer: {
    backgroundColor: '#E0F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF', // Blue for "Open" status
  },
  dateTimeText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  carDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  carIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  carPlate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactDetails: {
    margin: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconStyle: {
    fontSize: 20, // Adjust for emoji size
    marginRight: 10,
    color: COLORS.text, 
  },
  detailText: {
    fontSize: 16,
    color: COLORS.text,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 16,
    color: COLORS.text,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C', // Red for "Obligation to pay"
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  expectationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 8,
  },
  expectationText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  policyLinksContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 10,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden', // Ensures borders look good with rounded corners
  },
  policyLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  policyLinkText: {
    fontSize: 14,
    color: COLORS.text,
  },
  policyArrow: {
    fontSize: 20,
    color: COLORS.text, // Light gray arrow
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginBottom: 10, // Space below header
  },
  // If you use a back icon:
  // backIcon: {
  //   marginRight: 10,
  // },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1, // Takes up available space
  },
  backIcon: {
    marginRight: 10,
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
  delimiter: {
    height: 8,
    backgroundColor: COLORS.border,
  },
});

export default OrderDetailScreen;