import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, FlatList, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import OrderItemCard, OrderItemProps from '../components/OrderCard';
import { orderListStyles } from '../assets/styles/order-list.styles';


// You might consider react-native-vector-icons for the back arrow icon if you add one.
// import Icon from 'react-native-vector-icons/Ionicons';

const DUMMY_ORDERS = [
    {
        id: '1',
        image: require('../assets/images/react-logo.png'), // Replace with your actual image paths
        address: '123 Main Street, New York',
        date: 'Sept 15, 2023',
        time: '2:30 PM',
        status: 'Open',
        price: '$149.99',
    },
    {
        id: '2',
        image: require('../assets/images/react-logo.png'),
        address: '456 Elm Street, Los Angeles',
        date: 'Oct 1, 2023',
        time: '10:15 AM',
        status: 'Completed',
        price: '$199.99',
    },
    {
        id: '3',
        image: require('../assets/images/react-logo.png'),
        address: '789 Oak Street, Chicago',
        date: 'Aug 20, 2023',
        time: '9:45 AM',
        status: 'Completed',
        price: '$249.99',
    },
    {
        id: '4',
        image: require('../assets/images/react-logo.png'),
        address: '101 Pine Street, Miami',
        date: 'Jul 5, 2023',
        time: '3:20 PM',
        status: 'Completed',
        price: '$299.99',
    },
  ];

const OrderListScreen: React.FC = () => {

    // Using useRouter from expo-router to handle navigation
    const router = useRouter();

  return (
    <View>
      <View style={orderListStyles.header}>
        {/* You could add a back arrow icon here */}
        {/* <Icon name="arrow-back" size={24} color="#333" style={styles.backIcon} /> */}
        <Ionicons name="chevron-back-outline" size={24} style={orderListStyles.backIcon} onPress={() => router.push("/")} />
        <Text style={orderListStyles.headerTitle}>Cleaning Orders</Text>
        <Text style={orderListStyles.orderCount}>({DUMMY_ORDERS.length})</Text>
      </View>

      <FlatList
        data={DUMMY_ORDERS}
        keyExtractor={( item ) => item.id}
        renderItem={({ item }) => <OrderItemCard item={item} />}
        contentContainerStyle={orderListStyles.listContentContainer}
        // Add performance optimizations for larger lists
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

export default OrderListScreen;