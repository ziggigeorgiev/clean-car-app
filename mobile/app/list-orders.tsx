import { useEffect, useState } from "react";
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import OrderItemCard from '../components/OrderCard';
import LoadingSpinner from "../components/LoadingSpinner";
import NoResultsFound from "../components/NoResultsFound";
import { CleanCarAPI } from "../services/CleanCarApi";
import { Device } from '../services/Device';
import { COLORS } from '../constants/colors';


// You might consider react-native-vector-icons for the back arrow icon if you add one.
// import Icon from 'react-native-vector-icons/Ionicons';

const OrderListScreen: React.FC = () => {

  // Using useRouter from expo-router to handle navigation
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

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
        
        setOrders(orders);
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
    <View style={styles.container}>
      <View style={styles.header}>
        {/* If you want to add a back button, uncomment the TouchableOpacity */}
        {/* <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Orders</Text>
        <Text style={styles.orderCount}>({orders.length})</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={( item ) => item.id}
        renderItem={({ item }) => <OrderItemCard item={item} />}
        contentContainerStyle={styles.listContentContainer}
        // Add performance optimizations for larger lists
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListEmptyComponent={<NoResultsFound message="We are unable to find any orders at this time." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white, // Light background color
  },
  backIcon: {
    marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white, // Header background color
    marginBottom: 10, // Space below header
  },
  // If you use a back icon:
  // backIcon: {
  //   marginRight: 10,
  // },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1, // Takes up available space
  },
  orderCount: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  listContentContainer: {
    paddingVertical: 10, // Padding around the list items
  },
});

export default OrderListScreen;