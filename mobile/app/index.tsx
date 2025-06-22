import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

export default function App() {
  const [orders, setOrders] = useState([]);

  const addOrder = () => {
    const newOrder = {
      id: Date.now().toString(),
      description: `Order #${orders.length + 1}`,
    };
    setOrders([...orders, newOrder]);
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderItem}>
      <Text>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to ShineClean!</Text>
      <Text style={styles.subtext}>Your go-to app for professional car interior cleaning.</Text>
      
      <Button title="Add New Order" onPress={addOrder} />

      {orders.length === 0 ? (
        <Text style={styles.noOrders}>No cleaning orders yet. Tap "Add New Order" to get started.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          style={styles.orderList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9f9f9',
  },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  noOrders: {
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  orderList: {
    marginTop: 20,
  },
  orderItem: {
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 6,
    marginBottom: 10,
  },
});