import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, AntDesign, Feather } from '@expo/vector-icons'; // Assuming Expo icons for simplicity
import MunichCard from '@/components/MunichCard';
import { COLORS } from '@/constants/colors';
import ServiceCard from '@/components/ServiceCard';
import { useTranslation } from '@/services/i18n';

const HomeScreen = () => {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <FontAwesome5 name="car-wash" size={24} color="#007AFF" /> */}
        <Text style={styles.headerTitle}>{t('home.title')}</Text>
      </View>
      <Text style={styles.headerSubtitle}>{t('home.subtitle')}</Text>

      <MunichCard />

      {/* Hero Image */}
      {/* <View style={styles.heroContainer}>
        <ImageBackground
          source={require('../assets/images/munich.jpeg')} 
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.locationContainer}>
              <Feather name="map-pin" size={16} color="#FFFFFF" />
              <Text style={styles.locationText}>München, Deutschland</Text>
            </View>
            <Text style={styles.availabilityText}>Jetzt verfügbar in München</Text>
          </View>
        </ImageBackground>
      </View> */}

      {/* Premium Car Care Services */}
      <Text style={styles.sectionTitle}>{t('home.premium_title')}</Text>
      <Text style={styles.sectionDescription}>{t('home.premium_desc')}</Text>

      {/* Service Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceCardsContainer}>
        <ServiceCard
          iconName="water"
          title={t('home.exterior_title')}
          description={t('home.exterior_desc')}
          includeText={t('home.included')}
          includeIcon="checkcircleo"
          colors={['#3B82F6', '#22D3EE']}
        />
        <ServiceCard
          iconName="car-seat"
          title={t('home.interior_title')}
          description={t('home.interior_desc')}
          includeText={t('home.bookable')}
          includeIcon="pluscircleo"
          colors={['#A855F7', '#F472B6']}
        />
      </ScrollView>

      {/* Advantages */}
      <Text style={styles.sectionTitle}>{t('home.advantages')}</Text>

      <View style={styles.advantageItem}>
        <Feather name="tool" size={20} color="#007AFF" />
        <View style={styles.advantageTextContainer}>
          <Text style={styles.advantageTitle}>{t('home.equipment_title')}</Text>
          <Text style={styles.advantageDescription}>{t('home.equipment_desc')}</Text>
        </View>
      </View>

      <View style={styles.advantageItem}>
        <Feather name="star" size={20} color="#007AFF" />
        <View style={styles.advantageTextContainer}>
          <Text style={styles.advantageTitle}>{t('home.specialists_title')}</Text>
          <Text style={styles.advantageDescription}>{t('home.specialists_desc')}</Text>
        </View>
      </View>

      <View style={styles.advantageItem}>
        <Feather name="shield" size={20} color="#007AFF" />
        <View style={styles.advantageTextContainer}>
          <Text style={styles.advantageTitle}>{t('home.eco_title')}</Text>
          <Text style={styles.advantageDescription}>{t('home.eco_desc')}</Text>
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Light grey background
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  serviceCardsContainer: {
    marginBottom: 30,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderColor: COLORS.border,
    borderWidth: 1,
    elevation: 3, // For Android shadow
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
  },
  advantageTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  advantageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  advantageDescription: {
    fontSize: 13,
    color: '#666',
  },
});

export default HomeScreen;
