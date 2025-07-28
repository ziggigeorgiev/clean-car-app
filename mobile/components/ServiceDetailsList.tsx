import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";
import Price from './Price';

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
          <Price
              price={service.price}
              dollarStyle={service.type === 'primary' ? { fontSize: 14, fontFamily: 'ComicNeue-Bold' } : {fontSize: 13, fontFamily: 'ComicNeue-Regular'}}
              centStyle={service.type === 'primary' ? { fontSize: 9, fontFamily: 'ComicNeue-Bold' } : {fontSize: 8, fontFamily: 'ComicNeue-Regular'}}
            />
          {/* <Text style={[styles.servicePrice, service.type === 'primary' ? styles.primary : styles.secondary]}>{service.price} {service.currency}</Text> */}
        </View>
      ))}

      {/* If there's an "Obligation to pay" or "Total" line like in your other screenshot,
          you'd add it here. For this specific image, it only shows individual services.
          However, to match the full order detail screen, I'll include a placeholder for it.
      */}
      <View style={styles.totalLine} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        {/* This would be a calculated sum in a real app */}
        {/* <Text style={styles.totalPrice}>{total} {services[0]?.currency}</Text> */}
        <Price
            price={total}
            dollarStyle={{}}
            centStyle={{}}
          />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    // shadowColor: COLORS.shadow,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 5,
    // elevation: 3, // For Android shadow
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10  , // Space below the section title
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  serviceItemPrimary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7, // Space between service lines
  },
  primary: {
    fontWeight: 'bold', // Matches the screenshot's primary service weight
    fontSize: 14,
    color: COLORS.text, // Darker color for primary services
  },
  serviceItemSecondary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7, // Space between service lines
  },
  secondary: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 15,
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
    flex: 1, // Allows name to take up space and wrap if needed
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600', // Matches the screenshot's price weight
    color: '#333',
    marginLeft: 10, // Space between name and price
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border, // Light grey line
    marginVertical: 10, // Space above and below the line
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text, // Red color for "Obligation to pay"
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ServiceDetailsList;