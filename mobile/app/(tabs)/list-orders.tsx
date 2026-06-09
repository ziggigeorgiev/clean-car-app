import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { Text, View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';

import OrderItemCard from '../../components/OrderCard';
import LoadingSpinner from "../../components/LoadingSpinner";
import NoResultsFound from "../../components/NoResultsFound";
import { CleanCarAPI } from "../../services/CleanCarApi";
import { Device } from '../../services/Device';
import { COLORS } from '../../constants/colors';
import StepIndocator from '../../components/StepIndicator'; // Adjust path
import { useTranslation } from '../../services/i18n';

// You might consider react-native-vector-icons for the back arrow icon if you add one.
// import Icon from 'react-native-vector-icons/Ionicons';

const OrderListScreen: React.FC = () => {
  const { t } = useTranslation();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const phoneIdentifier = await Device.getPhoneIdentifier();
    if (!phoneIdentifier) {
      console.error("Phone identifier is not available.");
      return;
    }
    try {
      const data = await CleanCarAPI.getOrdersByPhoneIdentifier(phoneIdentifier);
      setOrders(data);
    } catch (error) {
      console.error(`Error fetching orders for phone identifier ${phoneIdentifier}:`, error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setLoading(true);
        await fetchData();
        setLoading(false);
      })();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  if (loading && !refreshing) return <LoadingSpinner message={t('loading.generic')} />;

  return (
    <View style={styles.container}>
      <StepIndocator title={t('screen.orders')} backRoute={""} backParams={{}} totalSteps={0} currentStep={0} />
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <OrderItemCard item={item} />}
        contentContainerStyle={styles.listContentContainer}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListEmptyComponent={<NoResultsFound message={t('empty.no_orders')} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
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