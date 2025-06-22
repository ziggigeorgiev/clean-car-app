import React from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";
import { orderCardStyles } from '../assets/styles/order-card.styles';

const { width } = Dimensions.get('window');

interface OrderItemProps {
  item: {
    id: string;
    image: any;
    address: string;
    date: string;
    time: string;
    status: 'Open' | 'Completed';
    price: string;
  };
}

const OrderItemCard: React.FC<OrderItemProps> = ({ item }) => {
  const isCompleted = item.status === 'Completed';

  return (
    <TouchableOpacity
        onPress={() => console.log('View order details for:', item.id)}
    >
        <View style={orderCardStyles.card}>
        <View style={orderCardStyles.imageContainer}>
            <Image
            source={item.image}
            style={orderCardStyles.itemImage}
            onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            defaultSource={{uri: 'https://placehold.co/60x60/EEF4FF/4285F4?text=Car'}} // Fallback placeholder
            />
        </View>

        <View style={orderCardStyles.detailsContainer}>
            <View style={orderCardStyles.detailRow}>
            {/* Use Icon component if installed, otherwise use emoji/text */}
            {/* <Icon name="map-marker" size={16} color="#666" style={styles.icon} /> */}
            <Ionicons name='pin-outline' size={16} color={COLORS.textLight} style={orderCardStyles.icon} />
            <Text style={orderCardStyles.addressText}>{item.address}</Text>
            </View>
            <View style={orderCardStyles.detailRow}>
            {/* <Icon name="clock-o" size={16} color="#666" style={styles.icon} /> */}
            <Ionicons name='time-outline' size={16} color={COLORS.textLight} style={orderCardStyles.icon} />
            <Text style={orderCardStyles.dateText}>
                {item.date} - {item.time}
            </Text>
            </View>
            <View style={orderCardStyles.bottomRow}>
            <View style={[orderCardStyles.statusBadge, isCompleted ? orderCardStyles.completedBadge : orderCardStyles.openBadge]}>
                <Text style={[orderCardStyles.statusText, isCompleted ? orderCardStyles.completedText : orderCardStyles.openText]}>
                {item.status}
                </Text>
            </View>
            <Text style={orderCardStyles.priceText}>{item.price}</Text>
            </View>
        </View>
        </View>
    </TouchableOpacity>
  );
};

export default OrderItemCard;