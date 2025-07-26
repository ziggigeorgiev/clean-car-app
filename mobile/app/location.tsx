// screens/SelectLocationScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Image,
  PermissionsAndroid, // For Android permissions
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import Geolocation from 'react-native-geolocation-service';
import * as Location from 'expo-location';
import Icon from '@expo/vector-icons/Feather'; // For search icon
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon


import StepIndocator from '../components/StepIndicator'; // Adjust path
import { COLORS } from '@/constants/colors';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface SelectLocationScreenProps {
  // You can pass navigation props or other data here if needed
}

const SelectLocationScreen: React.FC<SelectLocationScreenProps> = () => {
  const [address, setAddress] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825, // Default San Francisco
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const mapRef = useRef<MapView>(null);

  const centerMap = async () => {

    const getCurrentPosition = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            alert('Permission denied');
            return;
        }

        const position = await Location.getCurrentPositionAsync({});
        return position
    };

    const position = await getCurrentPosition();
    if (!position) {
        return;
    }
    const { latitude, longitude } = position.coords;
    const currentRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    }

    mapRef.current?.animateToRegion(currentRegion, 1000);
    setRegion(currentRegion);
  };

  const getAddress = async (lat: number, lng: number) => {
    try {
        const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        // return `${address.name}, ${address.street}, ${address.city}, ${address.region}, ${address.country}`;
        return `${address.name}, ${address.city}, ${address.country}`;
    } catch (error) {
        console.error(error);
        return null;
    }
    };

  useEffect(() => {
    centerMap(); // Center map on user's location when component mounts
  }, []);

  const handleConfirmLocation = () => {
    // In a real app, you would typically save the selected location
    // and navigate to the next step of the booking process.
    const selectedLocation = {
      longitude: region.longitude,
      latitude: region.latitude,
      address: address
    }
    Alert.alert('Location Confirmed!', JSON.stringify(selectedLocation))
    router.push({ pathname: '/availability', params: { location: JSON.stringify(selectedLocation) } });
  };

  const moveTimeout = useRef<NodeJS.Timeout | number | null>(null);

  const handleRegionChange = (newRegion: React.SetStateAction<{
          latitude: number; // Default San Francisco
          longitude: number; latitudeDelta: number; longitudeDelta: number;
      }>) => {
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = setTimeout(() => {
      setIsMoving(true);
      setRegion(newRegion);
    }, 15);

    //   setIsMoving(true);
    //   setRegion(newRegion);
  };

  const handleRegionChangeComplete = () => {
    setIsMoving(false);
    getAddress(region.latitude, region.longitude).then((addr) => {
      if (addr) {
        setAddress(addr);
      } else {
        setAddress('Unknown Address');
      }
    });
  };

  return (      
    <View>
        {/* Header */}
        <View style={styles.headerContainer}>
            <StepIndocator totalSteps={3} currentStep={1} />
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
        <MapView
            // provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} // Use Google Maps on Android explicitly
            ref={mapRef}
            provider={PROVIDER_GOOGLE}  // Use Google Maps provider
            style={styles.map}
            initialRegion={region}
            // onRegionChange={setRegion} // Update region when map moves
            onRegionChange={handleRegionChange}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={true} // Show user's current location
            showsMyLocationButton={true} // Show the button to center on user's location
            mapPadding={{top:0, right:0, left:0, bottom:230}}
        >   
            {/* Central Marker */}
            {/* <Marker
            coordinate={{ latitude: region.latitude, longitude: region.longitude }}
            title="Your Location"
            description="Drag map to change location"
            draggable
            > */}
            <TouchableOpacity style={styles.locationButton} onPress={centerMap}>
                <Ionicons name="locate-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
                <View style={styles.markerContainer}>
                    <MaterialCommunityIcons name="map-marker" size={40} color={COLORS.primary} />

                    {isMoving && (
                    <Ionicons
                        name="ellipse"
                        size={12}
                        color={COLORS.primary}
                        style={styles.mapShadow}
                    />
                    )}
                </View>
            </Marker>
        </MapView>

        {/* <View style={styles.fixedPinContainer}>
            <MaterialCommunityIcons name="map-marker" size={40} color="#007AFF" />
        </View> */}
        {/* The blue pin from the screenshot appears to be fixed center, not a draggable marker.
            If you want a truly fixed pin in the center of the map view, you'd layer it:
        */}
        {/* <View style={styles.fixedPinContainer}>
            <MaterialCommunityIcons name="map-marker" size={40} color="#007AFF" />
        </View> */}
        </View>

        {/* Bottom Overlay Container (positioned absolutely at the bottom) */}
      <KeyboardAvoidingView
        style={styles.bottomOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust as needed
      >
        <ScrollView contentContainerStyle={styles.overlayScrollViewContent}>
          {/* Address Input */}
          <View style={styles.inputContainer}>
            <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your address"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
              // You would integrate a geocoding/autocomplete API here
            />
          </View>

          {/* Recent Addresses */}
          <Text style={styles.recentAddressesTitle}>Recent Addresses</Text>
          <View style={styles.recentAddressItem}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#666" style={styles.recentAddressIcon} />
            <Text style={styles.recentAddressText}>{address}</Text>
          </View>
          {/* Add more recent addresses here if needed */}

          {/* Confirm Location Button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Light background for the screen
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1, // Allows content to grow and scroll if needed
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    alignItems: 'flex-start', // Align content to left
  },
  mapContainer: {
    width: width,
    height: height - 80 - 30, // Adjust map height as needed, e.g., 45% of screen height
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
    // No direct borderRadius for map, but you could try wrapping in a View with it
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Map fills its container
  },
  fixedPinContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    // Adjust these to center the base of the pin, not the center of the icon itself
    top: '50%',
    left: '50%',
    marginTop: -20, // Half of icon height
    marginLeft: -10, // Half of icon width (adjust for pin base)
  },
  bottomContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Light grey background for input
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  addressInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  recentAddressesTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.primary,
    marginBottom: 5,
  },
  recentAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  recentAddressIcon: {
    marginRight: 10,
    color: COLORS.textLight,
  },
  recentAddressText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  confirmButton: {
    backgroundColor: COLORS.primary, // Blue button
    borderRadius: 15,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5, // Space above the button
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomOverlay: {
    position: 'absolute', // Position above the map
    bottom: 80 + 10, // Adjust to position above the map
    left: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // Shadow pointing upwards
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Add padding for iOS safe area at bottom
    zIndex: 2, // Ensure it's above the map
    maxHeight: height * 0.5, // Prevent overlay from taking too much space
  },
  overlayScrollViewContent: {
    paddingTop: 20, // Padding inside the scroll view of the overlay
    paddingBottom: 20, // No extra padding at the bottom here, handled by bottomOverlay
  },
  locationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
  },
  markerContainer: {
    alignItems: 'center', // centers the shadow under the marker
  },
  mapShadow: {
    // marginTop: -5, // adjust as needed to bring the shadow closer
    opacity: 0.6,    // make it feel like a "shadow"
  },
});

export default SelectLocationScreen;