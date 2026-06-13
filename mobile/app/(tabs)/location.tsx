// screens/SelectLocationScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  SafeAreaView,
  ActivityIndicator,
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


import StepIndocator from '../../components/StepIndicator'; // Adjust path
import { COLORS } from '@/constants/colors';
import { useTranslation } from '@/services/i18n';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface SelectLocationScreenProps {
  // You can pass navigation props or other data here if needed
}

const SelectLocationScreen: React.FC<SelectLocationScreenProps> = () => {
  const { t } = useTranslation();
  const [address, setAddress] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);
  // Don't render the map until we have a real location, otherwise it flashes
  // the default (San Francisco) region before jumping to the user.
  const [locationReady, setLocationReady] = useState(false);

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
  // Keep the latest params readable inside the focus callback without re-subscribing.
  const paramsRef = useRef(params);
  paramsRef.current = params;
  // True once the user explicitly picked a place from search — stops the GPS
  // auto-center from overriding their choice.
  const hasSelection = useRef(false);
  // True once the user has manually panned the map — stops a late-arriving GPS
  // fix from yanking the map back to the start position.
  const userInteracted = useRef(false);
  
  const getAddress = useCallback(async (lat: number, lng: number) => {
    try {
        const [a] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (!a) return null;
        // "Ungererstraße 7, 80805 München, Germany"
        const streetLine = [a.street, a.streetNumber].filter(Boolean).join(' ');
        const line1 = streetLine || a.name || '';            // fall back to name/POI
        const cityLine = [a.postalCode, a.city].filter(Boolean).join(' ');
        return [line1, cityLine, a.country].filter(Boolean).join(', ');
    } catch (error) {
        console.error("Error reverse geocoding:", error);
        return null;
    }
  }, []); // No dependencies, as it should not change

  const applyRegion = useCallback((latitude: number, longitude: number) => {
    const r = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    isInitialAnimation.current = true; // skip reverse-geocode on programmatic move
    setRegion(r);
    setLocationReady(true);            // map mounts (or animates) at a real location
    mapRef.current?.animateToRegion(r, 500); // no-op on first mount; initialRegion handles it
    return r;
  }, []);

  const centerMap = useCallback(async () => {
    userInteracted.current = false; // this is an explicit re-center request; allow it
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to center the map on your current location.');
      setLocationReady(true); // show the map at the fallback so we're not stuck on the loader
      return;
    }

    // Don't auto-center if the user already picked a place or panned the map.
    const blocked = () => hasSelection.current || userInteracted.current;

    // 1) Instant: last known position lets the map mount already on the user,
    //    avoiding the default-region (San Francisco) flash.
    const last = await Location.getLastKnownPositionAsync();
    if (last && !blocked()) {
      applyRegion(last.coords.latitude, last.coords.longitude);
      getAddress(last.coords.latitude, last.coords.longitude).then((a) => { if (a && !blocked()) setAddress(a); });
    }

    // 2) Precise: refine with an actual GPS fix (smoothly animates into place).
    // Bail if the user picked a place or panned the map while we were waiting.
    try {
      const cur = await Location.getCurrentPositionAsync({});
      if (cur && !blocked()) {
        applyRegion(cur.coords.latitude, cur.coords.longitude);
        const addr = await getAddress(cur.coords.latitude, cur.coords.longitude);
        if (!blocked()) setAddress(addr || 'Unknown Address');
      } else if (!last) {
        setLocationReady(true);
      }
    } catch (e) {
      if (!last) setLocationReady(true);
    }
  }, [applyRegion, getAddress]);

  // On focus: if we're returning from the search screen with a chosen place,
  // keep it (the useEffect below applies it). Otherwise — e.g. tapping the "+"
  // tab — start fresh and GPS-center on the user.
  useFocusEffect(
    useCallback(() => {
      const p = paramsRef.current;
      if (p?.selectedLatitude && p?.selectedLongitude) {
        hasSelection.current = true; // don't let centerMap override the pick
        return;
      }
      hasSelection.current = false;
      initialCenterDone.current = false;
      setAddress('');
      centerMap();
    }, [centerMap])
  );

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
      hasSelection.current = true; // user picked this place — block GPS auto-center
      setRegion(newRegion);
      setLocationReady(true); // ensure the map is mounted at this location
      mapRef.current?.animateToRegion(newRegion, 1000);
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
    // Alert.alert('Location Confirmed!', JSON.stringify(selectedLocation))
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
    <View style={styles.safeArea}>
        {/* Header */}
        <StepIndocator title={t('screen.location')} backRoute={""} backParams={{}} totalSteps={3} currentStep={1} />
        
        {/* Map Section */}
        <View style={styles.mapContainer}>
        {locationReady ? (
          <>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}  // Use Google Maps provider
                style={styles.map}
                initialRegion={region}
                onPanDrag={() => { userInteracted.current = true; }} // user grabbed the map
                onRegionChange={(newRegion) => handleRegionChange(newRegion)}
                onRegionChangeComplete={(region) => handleRegionChangeComplete(region)}
                showsUserLocation={true} // Show user's current location
                showsMyLocationButton={false} // Show the button to center on user's location
                mapPadding={{top:0, right:0, left:0, bottom:230}}
            />

            {/* Recenter button — MUST be a sibling of <MapView>, not a child.
                react-native-maps only accepts map overlays (Marker, Polyline, …)
                as children; a plain view here crashes on the New Architecture with
                "addViewAt: failed to insert view … child already has a parent". */}
            <TouchableOpacity style={styles.locationButton} onPress={centerMap}>
                <Ionicons name="locate-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
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
          </>
        ) : (
          <ActivityIndicator size="large" color={COLORS.primary} />
        )}

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
            <Pressable onPress={handleAddressInputFocus} style={styles.addressField}>
                {/* Read-only display of the chosen address. Using <Text> instead
                    of a disabled <TextInput> avoids Android's TextInput padding/
                    clipping that hid the first characters under the search icon. */}
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.addressText, !address && styles.addressPlaceholder]}
                >
                    {address || 'Enter your address'}
                </Text>
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
            <Text style={styles.confirmButtonText}>{t('btn.confirm_location')}</Text>
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
    flex: 1,
    width: width,
    // height: height - 80 - 30, // Adjust map height as needed, e.g., 45% of screen height
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // No direct borderRadius for map, but you could try wrapping in a View with it
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Map fills its container
    flex: 1
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
  addressField: {
    flex: 1,
    height: 45,
    justifyContent: 'center', // vertically center the single-line address
  },
  addressText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  addressPlaceholder: {
    color: '#999',
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
    bottom: 0, // Adjust to position above the map
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    // borderRadius: 15,
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
    marginTop: -230 - 20 - 6, // icon height offset + map padding offset (230 / 2)
    justifyContent: 'center',
  },
  mapShadow: {
    // marginTop: -5, // adjust as needed to bring the shadow closer
    opacity: 0.6,    // make it feel like a "shadow"
  },
});

export default SelectLocationScreen;