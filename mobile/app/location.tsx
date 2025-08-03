// screens/SelectLocationScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router, useLocalSearchParams } from "expo-router";
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
  Pressable,
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
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface SelectLocationScreenProps {
  // You can pass navigation props or other data here if needed
}

const SelectLocationScreen: React.FC<SelectLocationScreenProps> = () => {
  const [address, setAddress] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  // Flag to ensure initial map centering only happens once
  const initialCenterDone = useRef(false);
  // Flag to prevent reverse geocoding on initial map animation
  const isInitialAnimation = useRef(true);

  const [region, setRegion] = useState({
    latitude: 37.78825, // Default San Francisco
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const mapRef = useRef<MapView>(null);

  const params = useLocalSearchParams(); // Get parameters from navigation
  
  useEffect(() => {
    console.log('use effect');
    centerMap(); // Center map on user's location when component mounts
  }, []);

  const centerMap = useCallback(async () => {
    const getCurrentPosition = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to center the map on your current location.');
        return null; // Explicitly return null if permission denied
      }

      const position = await Location.getCurrentPositionAsync({});
      return position;
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
    };

    // Set a flag to tell handleRegionChangeComplete to skip address lookup temporarily
    isInitialAnimation.current = true;
    mapRef.current?.animateToRegion(currentRegion, 500);
    setRegion(currentRegion);

    const addr = await getAddress(latitude, longitude);
    if (addr) {
      setAddress(addr);
    } else {
      setAddress('Unknown Address');
    }
    // After animation, getAddress will be called by onRegionChangeComplete
  }, []); // No dependencies, as it should not change

  const getAddress = useCallback(async (lat: number, lng: number) => {
    try {
        const [addressResult] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        return `${addressResult.name || ''}, ${addressResult.city || ''}, ${addressResult.country || ''}`.replace(/^, |^,|, $/, '');
    } catch (error) {
        console.error("Error reverse geocoding:", error);
        return null;
    }
  }, []); // No dependencies, as it should not change

  useEffect(() => {
    console.log('SelectLocationScreen useEffect invoked. Params:', params, 'initialCenterDone:', initialCenterDone.current);

    // Prioritize handling selected location from search screen
    if (params.selectedLatitude && params.selectedLongitude && params.selectedAddress) {
      const newLatitude = parseFloat(params.selectedLatitude as string);
      const newLongitude = parseFloat(params.selectedLongitude as string);
      const newAddress = params.selectedAddress as string;

      if (isNaN(newLatitude) || isNaN(newLongitude)) {
        console.warn('Received invalid latitude or longitude from search params. Skipping map update.');
        return;
      }

      const newRegion = {
        latitude: newLatitude,
        longitude: newLongitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      // Set flag to prevent reverse geocoding if this is a programmatically set region
      isInitialAnimation.current = true;
      mapRef.current?.animateToRegion(newRegion, 1000);
      setRegion(newRegion);
      setAddress(newAddress); // Set address directly since it's already provided by search screen
      // Clear params after processing to avoid re-triggering this branch on subsequent re-renders
      router.setParams({ selectedLatitude: undefined, selectedLongitude: undefined, selectedAddress: undefined });
      initialCenterDone.current = true; // Mark as done as we've handled a specific location
    }
    // Only center map on current location if it hasn't been done yet
    else if (!initialCenterDone.current) {
        centerMap();
        initialCenterDone.current = true; // Mark that we've initiated the centering
    }

  }, [params, centerMap]); // Add centerMap to dependencies because it's used inside (due to useCallback)

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
    // if (moveTimeout.current) clearTimeout(moveTimeout.current);
    // moveTimeout.current = setTimeout(() => {
    //   setIsMoving(true);
    //   setRegion(newRegion);
    // }, 10);

    setIsMoving(true);
    setRegion(newRegion);
  };

  const handleRegionChangeComplete = useCallback((region) => {
    console.log('Region change complete:', region);
    setTimeout(() => {
      setIsMoving(false);
    }, 100); // optional smoothing

    // Only perform reverse geocoding if it's not the initial programmatic animation
    // or if the address is currently empty (meaning it hasn't been set by a search)
    if (isInitialAnimation.current) {
        // Reset the flag after the initial programmatic animation has completed
        isInitialAnimation.current = false;
        // Optionally, if address is empty, get it for the initial centered location
        if (!address) {
            getAddress(region.latitude, region.longitude).then((addr) => {
                if (addr) {
                    setAddress(addr);
                } else {
                    setAddress('Unknown Address');
                }
            });
        }
    } else {
        // If it's a user-initiated drag, always get the address
        getAddress(region.latitude, region.longitude).then((addr) => {
            if (addr) {
                setAddress(addr);
            } else {
                setAddress('Unknown Address');
            }
        });
    }
  }, [getAddress, region, address]); // Dependencies: getAddress (from useCallback), region, address


  // Function to navigate to search screen
  const handleAddressInputFocus = () => {
    console.log('Address input focused, navigating to search screen');
    router.push({ pathname: '/search', params: {} });
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
            onRegionChange={(newRegion) => handleRegionChange(newRegion)}
            onRegionChangeComplete={(region) => handleRegionChangeComplete(region)}
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

            {/* <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}> */}
                {/* <View style={styles.markerContainer}>
                    <MaterialCommunityIcons name="map-marker" size={40} color={COLORS.primary} />
                    {isMoving && (
                      <Ionicons
                          name="ellipse"
                          size={12}
                          color={COLORS.primary}
                          style={styles.mapShadow}
                      />
                    )}
                </View> */}
            {/* </Marker> */}
        </MapView>
        <View style={styles.markerContainer}>
            <MaterialCommunityIcons name="map-marker" size={40} color={COLORS.primary} />
            {/* <Text style={{ color: COLORS.textLight, fontSize: 12, marginTop: 5 }}>
                {isMoving ? 'Moving...' : 'Not moving'}
            </Text> */}
            {isMoving && (
              <Ionicons
                  name="ellipse"
                  size={12}
                  color={COLORS.primary}
                  style={styles.mapShadow}
              />
            )}
        </View>

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
            <Icon name="search" size={16} color="#888" style={styles.searchIcon} />
            <Pressable onPress={handleAddressInputFocus}>
                <TextInput
                    style={styles.addressInput}
                    placeholder="Enter your address"
                    placeholderTextColor="#999"
                    value={address}
                    editable={false} // Keep this as false
                    pointerEvents="none"
                    // Remove onFocus from here as it won't fire
                    // You don't need onChangeText if it's not directly editable
                />
            </Pressable>
            {/* <TextInput
              style={styles.addressInput}
              placeholder="Enter your address"
              placeholderTextColor="#999"
              value={address}
              // onChangeText={setAddress} // No direct editing here, it's for display
              onFocus={handleAddressInputFocus} // Open search screen on focus
              editable={false} // Make it not directly editable by keyboard
            /> */}
          </View>

          {/* Recent Addresses */}
          <Text style={styles.recentAddressesTitle}>Recent Addresses</Text>
          <View style={styles.recentAddressItem}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color="#666" style={styles.recentAddressIcon} />
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
    height: 45,
    fontSize: 16,
    color: COLORS.textLight,
  },
  recentAddressesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
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
    fontSize: 16,
    fontWeight: '600',
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

    //position: 'absolute',
    // top: height / 2 - 20, // Adjust to center the marker vertically
    // left: width / 2 - 20, // Adjust to center the marker horizontally
    marginLeft: 0,      // half of icon width (40px icon)
    marginTop: -230 - 20, // icon height offset + map padding offset (230 / 2)
    justifyContent: 'center',
  },
  mapShadow: {
    // marginTop: -5, // adjust as needed to bring the shadow closer
    opacity: 0.6,    // make it feel like a "shadow"
  },
});

export default SelectLocationScreen;