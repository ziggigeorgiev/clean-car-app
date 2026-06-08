// components/AppLoading.tsx
//
// Branded splash / loading screen shown while the app boots (e.g. while the
// I18nProvider reads the saved locale from AsyncStorage). Mirrors the web
// header: cleen-logo on top, grime-logo smaller below, then a copyright
// line in the currently-selected language.

import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { translate, Locale, DEFAULT_LOCALE } from '@/services/i18n';

type Props = {
  // Pass the active locale; defaults to the app's default if not yet known.
  locale?: Locale;
};

const AppLoading: React.FC<Props> = ({ locale = DEFAULT_LOCALE }) => {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require('@/assets/images/cleen-logo.png')}
          style={styles.cleen}
          resizeMode="contain"
        />
        <Image
          source={require('@/assets/images/grime-logo.png')}
          style={styles.grime}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.copyright}>
        {translate(locale, 'app.copyright')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 140,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleen: {
    width: 160,
    height: 160,
  },
  grime: {
    width: 180,
    height: 56,
    marginTop: 8,
  },
  copyright: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default AppLoading;
