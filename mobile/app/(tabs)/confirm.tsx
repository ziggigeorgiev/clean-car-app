import { Key, useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
  Linking
} from 'react-native';
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

import { COLORS } from "../../constants/colors";
import ServiceDetailsList from '../../components/ServiceDetailsList';
import LoadingSpinner from "../../components/LoadingSpinner";
import { Device } from '../../services/Device';
import { CleanCarAPI } from "../../services/CleanCarApi";
import { Transformations } from "../../services/Transformations";
import ContactDetails from "@/components/ContactDetails";
import AddressDetails from "@/components/AddressDetails";
import AvailabilityDetails from "@/components/AvailabilityDetails";
import StepIndocator from '../../components/StepIndicator';

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
  const dataObject = JSON.parse(location);
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
        location: JSON.parse(location as string),
        availability_id: selectedAvailability?.id,
        service_ids: JSON.parse(services as string)
      }
    );
    console.log("order", order)
    router.push(`/order/${order?.id}`);
  };

  if (loading) return <LoadingSpinner message="Loading order details..." />;
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StepIndocator title={"Confirm booking"} backRoute={"/services"} backParams={{ 
        location: location, 
        availability: availability
      }} totalSteps={0} currentStep={0} />
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>

        <AvailabilityDetails
          time={selectedAvailability?.time}
          sectionTitle="Availability"
        />

        <ContactDetails
          phoneNumber={phoneNumber}
          plateNumber={plateNumber}
          sectionTitle="Contact info"
        />

        <AddressDetails
          address={JSON.parse(location as string)?.address ?? ""}
          latitude={JSON.parse(location as string)?.latitude ?? 0}
          longitude={JSON.parse(location as string)?.longitude ?? 0}
          sectionTitle="Location"
        />

        {/* Service Details Section */}
        {/* <View style={styles.delimiter} /> */}
        <ServiceDetailsList
          services={selectedServices}
          sectionTitle="Selected services" // Optional: customize the title
        />

        {/* Policy Links Section */}
        <View style={styles.policyLinksContainer}>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            <Text style={styles.policyLinkText}>Terms & Conditions</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL('https://example.com/privacy')}
          >
            <Text style={styles.policyLinkText}>Privacy Policy</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL('https://example.com/cancellation')}
          >
            <Text style={styles.policyLinkText}>Cancellation Policy</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.placeOrderButtonContainer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={confirm}
        >
          <Text style={styles.placeOrderButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
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
  statusContainer: {
    padding: 10,
    backgroundColor: '#E0F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
    backgroundColor: COLORS.background,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmScreen;