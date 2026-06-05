import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";
import Price from './Price';
import { useTranslation } from "../services/i18n";

// Define the interface for a single service item
export interface ServiceItem {
  name: string;
  price: number;
  currency: string; // Assuming currency is a string like 'USD', 'EUR', etc.
  type: 'primary' | 'secondary'; // Added type for service item
  serviceId?: number; // for secondary rows: id of the underlying DB service
  categoryKey?: string; // for primary rows: 'basic' / 'extra' (used for i18n)
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
  const { t, tService } = useTranslation();

  const total = services
  .filter((service) => service.type === 'primary')
  .reduce((acc, service) => {
    return acc + service.price;
  }, 0);

  const renderLabel = (service: ServiceItem) => {
    if (service.type === 'secondary' && service.serviceId != null) {
      // Translate using the underlying DB service id with DB-name fallback
      return tService({ id: service.serviceId, name: service.name }, 'name');
    }
    if (service.type === 'primary' && service.categoryKey) {
      // Translate the category aggregate label
      const key = `category.${service.categoryKey}.name` as any;
      const value = t(key);
      // t() returns the key when no translation exists; fall back to original name
      return value === key ? service.name : value;
    }
    return service.name;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      </View>

      {/* Render each service item */}
      {services.map((service, index) => (
        <View key={index} style={service.type === 'primary' ? styles.serviceItemPrimary: styles.serviceItemSecondary}>
          <Text style={[styles.serviceName, service.type === 'primary' ? styles.primary : styles.secondary]}>{renderLabel(service)}</Text>
          <Price
              price={service.price}
              currency={service.currency}
              dollarStyle={service.type === 'primary' ? { fontSize: 14, fontWeight: '500', color: COLORS.text } : {fontSize: 13, fontWeight: '400', color: COLORS.textLight}}
              centStyle={service.type === 'primary' ? { fontSize: 9, fontWeight: '500', color: COLORS.text } : {fontSize: 8, fontWeight: '400', color: COLORS.textLight}}
              currencyStyle={service.type === 'primary' ? { fontSize: 12, fontWeight: '500', color: COLORS.text } : {fontSize: 11, fontWeight: '400', color: COLORS.textLight}}
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
        <Text style={styles.totalLabel}>{t('total')}</Text>
        {/* This would be a calculated sum in a real app */}
        {/* <Text style={styles.totalPrice}>{total} {services[0]?.currency}</Text> */}
        <Price
            price={total}
            currency={services[0]?.currency}
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
    fontWeight: '500', // Matches the screenshot's primary service weight
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