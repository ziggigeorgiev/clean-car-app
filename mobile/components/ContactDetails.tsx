import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon

type ContactDetailsProps = {
  phoneNumber?: string;
  plateNumber?: string;
  email?: string;
  sectionTitle?: string;
};

const ContactDetails = ({
  phoneNumber,
  plateNumber,
  email,
  sectionTitle = 'Contact info', // Default title, can be overridden
}: ContactDetailsProps) => {
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
      { phoneNumber && (<View style={styles.detailRow}>
        <MaterialCommunityIcons name="phone" size={20} color={COLORS.textLight} style={styles.icon} />
        <Text style={styles.detailText}>
          {phoneNumber}
        </Text>
      </View>) }
      { plateNumber && (<View style={styles.detailRow}>
        <MaterialCommunityIcons name="car" size={20} color={COLORS.textLight} style={styles.icon} />
        <Text style={styles.detailText}>
          {plateNumber}
        </Text>
      </View>) }
      { email && (<View style={styles.detailRow}>
        <MaterialCommunityIcons name="email" size={20} color={COLORS.textLight} style={styles.icon} />
        <Text style={styles.detailText}>
          {email}
        </Text>
      </View>) }
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 7, // Space between detail lines
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
});

export default ContactDetails;