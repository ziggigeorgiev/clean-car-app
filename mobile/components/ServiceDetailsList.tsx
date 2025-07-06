import React from 'react';
import { View, Text } from 'react-native';

import {ServiceDetailsListSyles as styles} from '../assets/styles/components.styles';

// Define the interface for a single service item
export interface ServiceItem {
  name: string;
  price: number;
  currency: string; // Assuming currency is a string like 'USD', 'EUR', etc.
  type: 'primary' | 'secondary'; // Added type for service item
}

interface ServiceDetailsListProps {
  services: ServiceItem[];
  // You might want to add a prop for the section title if it's dynamic
  sectionTitle?: string;
}

const ServiceDetailsList: React.FC<ServiceDetailsListProps> = ({
  services,
  sectionTitle = 'Basic cleaning', // Default title, can be overridden
}) => {
  const total = services
  .filter((service) => service.type === 'primary')
  .reduce((acc, service) => {
    // Assuming price is a string like '$70.97', we need to convert it to a number
    return acc + service.price;
  }, 0);
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        {/* You'd typically calculate and display the total here if 'Basic cleaning' implies a sum */}
        {/* For now, it's just the section title on the left. */}
        {/* Based on the image, "Basic cleaning" is itself a service with a price. */}
        {/* Let's adjust the rendering to reflect that. */}
      </View>

      {/* Render each service item */}
      {services.map((service, index) => (
        <View key={index} style={service.type === 'primary' ? styles.serviceItemPrimary: styles.serviceItemSecondary}>
          <Text style={[styles.serviceName, service.type === 'primary' ? styles.primary : styles.secondary]}>{service.name}</Text>
          <Text style={[styles.servicePrice, service.type === 'primary' ? styles.primary : styles.secondary]}>{service.price} {service.currency}</Text>
        </View>
      ))}

      {/* If there's an "Obligation to pay" or "Total" line like in your other screenshot,
          you'd add it here. For this specific image, it only shows individual services.
          However, to match the full order detail screen, I'll include a placeholder for it.
      */}
      <View style={styles.totalLine} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Obligation to pay</Text>
        {/* This would be a calculated sum in a real app */}
        <Text style={styles.totalPrice}>{total} {services[0]?.currency}</Text>
      </View>
    </View>
  );
};

export default ServiceDetailsList;