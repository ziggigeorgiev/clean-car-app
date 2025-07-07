import { Key, useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants/colors";
import { orderStyles } from '../../assets/styles/order.styles';
import CleaningProcessStep from '../../components/CleaningProcessStep';
import ServiceDetailsList from '../../components/ServiceDetailsList';
import LoadingSpinner from "../../components/LoadingSpinner";
import { Device } from '../../services/Device';
import { CleanCarAPI } from "../../services/CleanCarApi";
import { Transformations } from "../../services/Transformations";
import { format } from "date-fns";

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
  };
  phone_number: string;
  services: any[];
  availability?: {
    time: string;
  };
  // Add other fields as needed
}

const OrderDetailScreen: React.FC = () => {

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
  
  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // await sleep(1000);
    await fetchData();
    setRefreshing(false);
  };

  const expectations: string[] = [
    'Cleaner arrives at scheduled time',
    'Average cleaning duration: 25 minutes',
    'Quality inspection after cleaning',
    'Payment processed after service completion',
  ];

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


  if (loading && !refreshing) return <LoadingSpinner message="Loading order details..." />;
  
  return (
    <SafeAreaView style={orderStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={orderStyles.scrollViewContent}>

        {/* Header Section */}
        <View>
          <View style={orderStyles.statusContainer}>
            <View style={orderStyles.statusRow}>
              <Text style={orderStyles.statusText}>{order?.status}</Text>
              <Text style={orderStyles.dateTimeText}>
                {order?.availability?.time
                  ? format(order.availability.time, "MMMM do, yyyy H:mm")
                  : '-'}
              </Text>
            </View>

            <View style={orderStyles.carDetails}>
              {/* Using emojis as fallback for icons */}
              <Ionicons name='car-sport-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="car" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.carPlate}>{order?.plate_number}</Text>
            </View>
          </View>

          <View style={orderStyles.contactDetails}>
            <View style={orderStyles.detailRow}>
              <Ionicons name='pin-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="map-marker" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.detailText}>
                {order?.location.address}
              </Text>
            </View>
            <View style={orderStyles.detailRow}>
              <Ionicons name='call-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="phone" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.detailText}>{order?.phone_number}</Text>
            </View>
          </View>
        </View>

        {/* Service Details Section */}
        <ServiceDetailsList
          services={services}
          sectionTitle="Services Provided" // Optional: customize the title
        />

        {/* Cleaning Process Section */}
        <View style={orderStyles.sectionContainer}>
          <Text style={orderStyles.sectionTitle}>Cleaning Process</Text>
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
        </View>

        {/* What to Expect Section */}
        <View style={orderStyles.sectionContainer}>
          <Text style={orderStyles.sectionTitle}>What to Expect</Text>
          {expectations.map(renderExpectationItem)}
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

function sleep(arg0: number) {
  throw new Error("Function not implemented.");
}
