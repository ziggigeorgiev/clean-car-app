import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';

import { useRouter } from 'expo-router';

import { homeStyles } from '../assets/styles/home.styles';
import LoadingSpinner from "../components/LoadingSpinner";
import { Device } from '../services/Device';
import { CleanCarAPI } from "../services/CleanCarApi";

const HomeScreen = () => {

  // Using useRouter from expo-router to handle navigation
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const phoneIdentifier = await Device.getPhoneIdentifier();
      if (!phoneIdentifier) {
        console.error("Phone identifier is not available.");
        return;
      }

      try {
        const orders = await CleanCarAPI.getOrdersByPhoneIdentifier(phoneIdentifier);

        setPending(orders.filter((order: { status: string; }) => order.status === 'open').length);
        setCompleted(orders.filter((order: { status: string; }) => order.status !== 'open').length);
      } catch (error) {
        console.error(`Error fetching orders for phone identifier ${phoneIdentifier}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <View>
      <ScrollView>
        <View style={homeStyles.container}>

          {/* Header Section */}
          <View>
            <Text style={homeStyles.welcomeText}>Welcome</Text>
            <Text style={homeStyles.text}>
              Get your car interior cleaned while you take care of your day.
            </Text>
          </View>

          {/* Image Section */}
          <View style={homeStyles.imageContainer}>
            <Image
              source={require('../assets/images/react-logo.png')}
              style={homeStyles.logoImage}
              resizeMode="cover"
            />
          </View>

          {/* Order Summary */}
          <View style={homeStyles.orderSummaryContainer}>
            <View style={homeStyles.orderCard}>
              <Text style={homeStyles.orderNumber}>{pending}</Text>
              <Text style={homeStyles.orderLabel}>Active Orders</Text>
            </View>
            <View style={homeStyles.separator} />
            <View style={homeStyles.orderCard}>
              <Text style={homeStyles.orderNumber}>{completed}</Text>
              <Text style={homeStyles.text}>Completed Orders</Text>
            </View>
          </View>

          {/* "Keep track of all your cleaning orders" text */}
          <View style={homeStyles.trackingTextContainer}>
            <Text style={homeStyles.text}>
              Keep track of all your{' '}
              <Text
                style={homeStyles.cleaningOrdersLink}
                onPress={() => router.push("/list-orders")}
              >
                cleaning orders
              </Text>
            </Text>
          </View>

          {/* "Add New Order" Button */}
          <TouchableOpacity
            style={homeStyles.addButton}
            onPress={() => router.push("/location")}
          >
            <Text style={homeStyles.addButtonIcon}>+</Text>
            <Text style={homeStyles.addButtonText}>Add New Order</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;