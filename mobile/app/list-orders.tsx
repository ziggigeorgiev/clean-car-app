import { useEffect, useState } from "react";
import { Text, View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

import OrderItemCard from '../components/OrderCard';
import LoadingSpinner from "../components/LoadingSpinner";
import NoResultsFound from "../components/NoResultsFound";
import { CleanCarAPI } from "../services/CleanCarApi";
import { Device } from '../services/Device';
import { orderListStyles } from '../assets/styles/order-list.styles';


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
    <View>
      <FlatList
        data={orders}
        keyExtractor={( item ) => item.id}
        renderItem={({ item }) => <OrderItemCard item={item} />}
        contentContainerStyle={orderListStyles.listContentContainer}
        // Add performance optimizations for larger lists
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListEmptyComponent={<NoResultsFound message="We are unable to find any orders at this time." />}
      />
    </View>
  );
};

export default OrderListScreen;