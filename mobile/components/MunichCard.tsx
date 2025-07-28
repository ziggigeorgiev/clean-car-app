
import { COLORS } from '@/constants/colors';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For location pin icon
import { LinearGradient } from "expo-linear-gradient";

const MunichCard = () => {
  return (
    <View style={styles.heroContainer}>
        <ImageBackground
          source={require('../assets/images/munich.jpeg')} 
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
        
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
            style={styles.gradientOverlay}
          />
          
          <View style={styles.heroOverlay}>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={COLORS.white} />
              <Text style={styles.locationText}>München, Deutschland</Text>
            </View>
            <Text style={styles.availabilityText}>Jetzt verfügbar in München</Text>
          </View>
        </ImageBackground>
      </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  heroImage: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    borderRadius: 15,
  },
  heroOverlay: {
    // backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 5,
  },
  availabilityText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
});

export default MunichCard;
