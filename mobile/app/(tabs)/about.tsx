import { COLORS } from '@/constants/colors';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import Details from "@/components/Details";
import ContactDetails from "@/components/ContactDetails";

// Define the main App component
const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          {/* Placeholder for the logo image */}
          <Image
            source={require('../../assets/images/cleen-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        {/* About Us Section */}
        <Details
          sectionTitle="About Us"
          text="We are a leading technology company dedicated to creating innovative solutions that transform the way people work and live. Since our founding in 2015, we've been committed to delivering exceptional value to our customers through cutting-edge software solutions."
        />

        {/* Contact Us Section */}
        <ContactDetails
          phoneNumber="123-456-7890"
          email="support@company.com" // Example email
          sectionTitle="Contact Us"
        />

        {/* Policy Links Section */}
        <View style={styles.policyLinksContainer}>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            <Text style={styles.policyLinkText}>Terms & Conditions</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL('https://example.com/privacy')}
          >
            <Text style={styles.policyLinkText}>Privacy Policy</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL('https://example.com/cancellation')}
          >
            <Text style={styles.policyLinkText}>Cancellation Policy</Text>
            <Text style={styles.policyArrow}>›</Text>
            {/* <Icon name="chevron-forward" size={20} color="#A0A0A0" /> */}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Define the styles using StyleSheet.create
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    top: 30,
    padding: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 200,
    height: 70,
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  policyLinksContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 10,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden', // Ensures borders look good with rounded corners
  },
  policyLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  policyLinkText: {
    fontSize: 14,
    color: COLORS.text,
  },
  policyArrow: {
    fontSize: 20,
    color: COLORS.text, // Light gray arrow
  },
});

export default AboutScreen;