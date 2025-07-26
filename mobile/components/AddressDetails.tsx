import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from "../constants/colors";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type ContactDetailsProps = {
  address: string;
  latitude: number;
  longitude: number;
  sectionTitle?: string;
};

const AddressDetails = ({
  address, latitude, longitude,
  sectionTitle = 'Location', // Default title, can be overridden
}: ContactDetailsProps) => {
  const markerCoordinate = {
    latitude: latitude,
    longitude: longitude,
  };
  const initialRegion = { 
    ...markerCoordinate,
    latitudeDelta: 0.01, // Zoomed in: smaller delta
    longitudeDelta: 0.005, // Zoomed in: smaller delta
  };

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
      <View style={styles.detailRow}>
        <MaterialCommunityIcons name="map-marker-outline" size={20} color="#666" style={styles.icon} />
        <Text style={styles.detailText}>
          {address}
        </Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        // Disable all gestures to make the map static
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        provider={PROVIDER_GOOGLE}  // Use Google Maps provider
        // You might need to set liteMode={true} for a truly static image-like map
        // depending on your react-native-maps version and specific requirements.
        // liteMode={true} // Uncomment if you want a lighter, image-based map
      >
        {/* Static Marker */}
        <Marker coordinate={markerCoordinate}>
            <View style={styles.markerContainer}>
                <MaterialCommunityIcons name="map-marker" size={30} color={COLORS.primary} />
            </View>
        </Marker>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
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
  map: {
    width: '100%', // Take full width of its container
    height: 150, // Fixed height for the map
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  markerContainer: {
    backgroundColor: 'transparent', // No background for the marker
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20, // Rounded marker
    padding: 5, // Padding around the icon
  },
});

export default AddressDetails;