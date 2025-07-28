import React from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import Price from './Price';

import { format } from "date-fns";


interface Service {
  price: number;
  currency: string;
}

interface OrderItem {
  id: string | number;
  status: string;
  location: {
    address: string;
  };
  availability: {
    time: Date | string;
  };
  services: Service[];
}

interface OrderItemCardProps {
  item: OrderItem;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item }) => {
  // Using useRouter from expo-router to handle navigation
  const router = useRouter();

  const isCompleted = item.status === 'Completed';

  const totalPrice = item.services.reduce((sum, service) => {
    return sum + service.price;
  }, 0);

  return (
    <TouchableOpacity
        onPress={() => router.push(`/order/${item.id}`)}
    >
        <View style={styles.card}>
        <View style={styles.imageContainer}>
            <Image
            source={require('../assets/images/cleen-logo.png')} 
            style={styles.itemImage}
            />
        </View>

        <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
            {/* Use Icon component if installed, otherwise use emoji/text */}
            {/* <Icon name="map-marker" size={16} color="#666" style={styles.icon} /> */}
            <Ionicons name='pin-outline' size={16} color={COLORS.textLight} style={styles.icon} />
            <Text style={styles.addressText}>{item.location.address}</Text>
            </View>
            <View style={styles.detailRow}>
            {/* <Icon name="clock-o" size={16} color="#666" style={styles.icon} /> */}
            <Ionicons name='time-outline' size={16} color={COLORS.textLight} style={styles.icon} />
            <Text style={styles.dateText}>
                {format(item.availability.time, "MMMM do, yyyy H:mma")}
            </Text>
            </View>
            <View style={styles.bottomRow}>
            <View style={[styles.statusBadge, isCompleted ? styles.completedBadge : styles.openBadge]}>
                <Text style={[styles.statusText, isCompleted ? styles.completedText : styles.openText]}>
                {item.status}
                </Text>
            </View>
            {/* <Text style={styles.priceText}>{totalPrice} {item.services[0].currency}</Text> */}
            <Price
              price={totalPrice}
              dollarStyle={{ color: '#00000' }}
              centStyle={{ color: '#000000' }}
            />
            </View>
        </View>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 10,
        borderColor: COLORS.border,
        borderWidth: 1,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.11,
        shadowRadius: 1.00,
        elevation: 3, // For Android shadow
    },
    imageContainer: {
        width: 50, // Fixed width for image container
        height: 35, // Fixed height for image container
        borderRadius: 0, // Half of width/height for circular image
        overflow: 'hidden',
        marginRight: 15,
        backgroundColor: COLORS.background, // Placeholder background
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    icon: {
        fontSize: 16, // Adjust font size for emoji/text icons
        color: COLORS.text,
        marginRight: 8,
    },
    addressText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
        flexShrink: 1, // Allows text to wrap
    },
    dateText: {
        fontSize: 13,
        color: COLORS.textLight,
        flexShrink: 1, // Allows text to wrap
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    openBadge: {
        backgroundColor: '#C8DEFC', // '#E0F2F7', // Light blue
    },
    completedBadge: {
        backgroundColor: '#E6FFE6', // Light green
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    openText: {
        color: COLORS.primary// '#007AFF', // Blue
    },
    completedText: {
        color: '#28A745', // Green
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});

export default OrderItemCard;