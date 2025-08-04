import { Key, useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

import { COLORS } from "../../constants/colors";
import ServiceDetailsList from '../../components/ServiceDetailsList';
import LoadingSpinner from "../../components/LoadingSpinner";
import { Device } from '../../services/Device';
import { CleanCarAPI } from "../../services/CleanCarApi";
import { orderStyles } from '../../assets/styles/order.styles';
import { Transformations } from "../../services/Transformations";


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

const ConfirmScreen: React.FC = () => {

  const [loading, setLoading] = useState(false);
  
  const { location, availability, services, plateNumber, phoneNumber} = useLocalSearchParams();
  
  console.log("--------------------")
  console.log("location", location)
  const dataObject = JSON.parse(JSON.parse(location));
  console.log("dataObject", dataObject)
  const keys = Object.keys(dataObject);
  console.log(keys);
  // Step 2: Access the 'address' property from the parsed object
  const address = dataObject.address;
  const address1 = dataObject["address"];


  console.log("locationJsonString", JSON.parse(location as string))
  console.log("availabilityJsonString", availability)
  console.log("availabilityJsonString", address1)
  console.log("servicesJsonString", JSON.parse(services as string))
  console.log("plateNumber", plateNumber)
  console.log("phoneNumber", phoneNumber)

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState();
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dataServices = await CleanCarAPI.getServices();
        const selectedServices = dataServices.filter((s: { id: any; }) => JSON.parse(services as string).includes(s.id))
        const transformedSelectedServices = Transformations.transformServices(selectedServices || []);
        setSelectedServices(transformedSelectedServices);
        
        const dataAvailability = await CleanCarAPI.getAvailability(JSON.parse(availability as string));
        console.log("dataAvailability", dataAvailability)
        setSelectedAvailability(dataAvailability);
        // // Preselect all extras as false
        // const extras = data.filter((s: { category: string; }) => s.category === 'Extra');
        // setSelectedExtras(
        //   Object.fromEntries(extras.map((e: { id: any; }) => [e.id, false]))
        // );
      } catch (error) {
        console.error(`Error fetching services:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const confirm = async () => {  
    const order =  await CleanCarAPI.createOrder(
      {
        phone_identifier: await Device.getPhoneIdentifier(),
        status: "open",
        plate_number: plateNumber,
        phone_number: phoneNumber,
        location: JSON.parse(JSON.parse(location as string)),
        availability_id: selectedAvailability?.id,
        service_ids: JSON.parse(services as string)
      }
    );
    console.log("order", order)
    router.push(`/order/${order?.id}`);
  };

  if (loading) return <LoadingSpinner message="Loading order details..." />;
  
  return (
    <SafeAreaView style={orderStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={orderStyles.scrollViewContent}>
        
        {/* Header Section */}
        <View>  
          <View style={orderStyles.contactDetails}>
            <View style={orderStyles.detailRow}>
              <Ionicons name='car-sport-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="map-marker" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.carPlate}>{plateNumber}</Text>
            </View>
            <View style={orderStyles.detailRow}>
              <Ionicons name='time-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="map-marker" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.carPlate}>{selectedAvailability?.time
                  ? format(selectedAvailability.time, "MMMM do, yyyy H:mm")
                  : '-'}</Text>
            </View>
            <View style={orderStyles.detailRow}>
              <Ionicons name='pin-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="map-marker" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.detailText}>
                {JSON.parse(JSON.parse(location as string)).address}
              </Text>
            </View>
            <View style={orderStyles.detailRow}>
              <Ionicons name='call-outline' size={16} color={COLORS.textLight} style={orderStyles.iconStyle} />
              {/* <MaterialCommunityIcons name="phone" size={20} color="#333" style={styles.iconStyle} /> */}
              <Text style={orderStyles.detailText}>{phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* Service Details Section */}
        <ServiceDetailsList
          services={selectedServices}
          sectionTitle="Services Provided" // Optional: customize the title
        />
      </ScrollView>

      <View style={orderStyles.placeOrderButtonContainer}>
        <TouchableOpacity
          style={orderStyles.placeOrderButton}
          onPress={confirm}
        >
          <Text style={orderStyles.placeOrderButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ConfirmScreen;