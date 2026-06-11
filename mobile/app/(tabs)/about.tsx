import { COLORS } from '@/constants/colors';
import { BRAND_ASSETS } from '@/constants/brandAssets';
import { BRAND_ID } from '@/constants/brand';
import React from 'react';

// Brand-specific support email.
const CONTACT_EMAIL = BRAND_ID === 'home' ? 'info@homegrime.de' : 'info@cargrime.de';
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
import StepIndocator from '../../components/StepIndicator';
import { useTranslation } from "../../services/i18n";
import { WebUrls } from "../../services/webUrls";
import Constants from 'expo-constants';

// Pulled from app.json's `expo.version` at build time so we have one source of truth.
const APP_VERSION =
  Constants.expoConfig?.version ??
  (Constants.manifest as any)?.version ??
  '0.0.0';

const AboutScreen = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StepIndocator title={t('tab.about')} backRoute={""} backParams={{}} totalSteps={0} currentStep={0} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={BRAND_ASSETS.logo}
            style={styles.cleenLogo}
            resizeMode="contain"
          />
          <Image
            source={BRAND_ASSETS.wordmark}
            style={styles.grimeLogo}
            resizeMode="contain"
          />
          <Text style={styles.versionText}>{t('about.version')} {APP_VERSION}</Text>
        </View>

        {/* About Us Section */}
        <Details
          sectionTitle={t('about.title')}
          text={t('about.text')}
        />

        {/* Contact Us Section */}
        <ContactDetails
          phoneNumber="+49 177 1914891"
          email={CONTACT_EMAIL}
          sectionTitle={t('about.contact_title')}
        />

        {/* Policy Links Section */}
        <View style={styles.policyLinksContainer}>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL(WebUrls.terms)}
          >
            <Text style={styles.policyLinkText}>{t('policy.terms')}</Text>
            <Text style={styles.policyArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL(WebUrls.privacy)}
          >
            <Text style={styles.policyLinkText}>{t('policy.privacy')}</Text>
            <Text style={styles.policyArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyLink}
            onPress={() => Linking.openURL(WebUrls.cancellation)}
          >
            <Text style={styles.policyLinkText}>{t('policy.cancellation')}</Text>
            <Text style={styles.policyArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  cleenLogo: {
    width: 140,
    height: 140,
  },
  grimeLogo: {
    width: 150,
    height: 44,
    marginTop: 4,
    marginBottom: 6,
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
    overflow: 'hidden',
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
    color: COLORS.text,
  },
});

export default AboutScreen;
