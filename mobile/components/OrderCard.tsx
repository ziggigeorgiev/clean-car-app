import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { COLORS } from "../constants/colors";
import Price from './Price';
import { formatDateTime } from "../services/DateFormat";
import { useTranslation } from "../services/i18n";

interface Service {
  price: number;
  currency: string;
  name?: string;
}

interface OrderItem {
  id: string | number;
  status: string;
  plate_number?: string;
  location?: { address: string };
  availability?: { time: Date | string };
  services: Service[];
}

interface OrderItemCardProps {
  item: OrderItem;
}

// Renders a single order row using the same card layout as the home
// screen's "Recent Booking" card: date+status on top, services list +
// price total below a divider.
const OrderItemCard: React.FC<OrderItemCardProps> = ({ item }) => {
  const router = useRouter();
  const { t, tService } = useTranslation();

  const statusKey = String(item.status || '').toLowerCase();
  const isCompleted = statusKey === 'completed';
  const isCancelled = statusKey === 'cancelled';

  const totalPrice = (item.services || []).reduce(
    (sum, s) => sum + (s.price || 0),
    0,
  );
  const currency = item.services?.[0]?.currency || 'EUR';
  const serviceLabel =
    (item.services || []).map((s) => tService(s as any, 'name')).join(', ') ||
    item.plate_number ||
    '';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/order/${item.id}`)}
      style={styles.card}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <View style={styles.topInfo}>
          <Text style={styles.dateText}>{formatDateTime(item.availability?.time)}</Text>
          {item.location?.address ? (
            <Text style={styles.addressText} numberOfLines={2}>
              {item.location.address}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.statusBadge,
            isCompleted
              ? styles.completedBadge
              : isCancelled
              ? styles.cancelledBadge
              : styles.openBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isCompleted
                ? styles.completedText
                : isCancelled
                ? styles.cancelledText
                : styles.openText,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>{serviceLabel}</Text>
        <Price
          price={totalPrice}
          currency={currency}
          dollarStyle={{ fontSize: 18, color: COLORS.text }}
          centStyle={{ fontSize: 11, color: COLORS.text }}
          currencyStyle={{ fontSize: 14, color: COLORS.text }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  topInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  addressText: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textLight,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
  },
  value: {
    color: COLORS.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  openBadge: {
    backgroundColor: '#C8DEFC',
  },
  completedBadge: {
    backgroundColor: '#E6FFE6',
  },
  cancelledBadge: {
    backgroundColor: '#FBE9EA',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  openText: {
    color: COLORS.primary,
  },
  completedText: {
    color: '#28A745',
  },
  cancelledText: {
    color: '#D9534F',
  },
});

export default OrderItemCard;
