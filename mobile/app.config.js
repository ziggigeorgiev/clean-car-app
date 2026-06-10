// app.config.js
//
// White-label Expo configuration. The static base lives in app.json (the car
// app's values); this file overlays brand-specific identity (name, slug,
// bundle id, scheme, colors, store metadata) based on EXPO_PUBLIC_BRAND.
//
//   EXPO_PUBLIC_BRAND=car   (default) → CarGrime
//   EXPO_PUBLIC_BRAND=home            → FreshSofa (couch / mattress cleaning)
//
// Build each app with its own EAS profile, e.g.:
//   EXPO_PUBLIC_BRAND=home eas build --profile home-production
//
// NOTE: the car brand intentionally returns the exact identity already in
// app.json, so existing builds are unaffected when the env var is absent.

const BRAND = process.env.EXPO_PUBLIC_BRAND === 'home' ? 'home' : 'car';

const BRANDS = {
  car: {
    name: 'CarGrime',
    slug: 'cargrime',
    scheme: 'cargrime',
    owner: 'cargrime',
    primaryColor: '#2C4D9F',
    description:
      'Book professional on-site car interior cleaning. Trained cleaners come to your home or workplace.',
    iosBundleId: 'de.cargrime.app',
    androidPackage: 'de.cargrime.app',
    // null → keep the projectId already present in app.json's extra.eas.
    easProjectId: null,
  },
  home: {
    name: 'FreshSofa',
    slug: 'freshsofa',
    scheme: 'freshsofa',
    owner: 'cargrime',
    primaryColor: '#2C4D9F', // same as car for now
    description:
      'Book professional on-site couch, sofa and mattress cleaning. Trained cleaners come to your home or workplace.',
    iosBundleId: 'de.freshsofa.app',
    androidPackage: 'de.freshsofa.app',
    // TODO: run `eas init` for the home app and paste the new projectId here.
    easProjectId: null,
  },
};

module.exports = ({ config }) => {
  const b = BRANDS[BRAND];

  return {
    ...config,
    name: b.name,
    slug: b.slug,
    scheme: b.scheme,
    owner: b.owner,
    primaryColor: b.primaryColor,
    description: b.description,

    ios: {
      ...config.ios,
      bundleIdentifier: b.iosBundleId,
      infoPlist: {
        ...(config.ios && config.ios.infoPlist),
        CFBundleDisplayName: b.name,
      },
    },

    android: {
      ...config.android,
      package: b.androidPackage,
      adaptiveIcon: {
        ...(config.android && config.android.adaptiveIcon),
        backgroundColor: b.primaryColor,
      },
    },

    web: {
      ...config.web,
      name: b.name,
      shortName: b.name,
      themeColor: b.primaryColor,
    },

    extra: {
      ...config.extra,
      brand: BRAND,
      eas: {
        ...(config.extra && config.extra.eas),
        ...(b.easProjectId ? { projectId: b.easProjectId } : {}),
      },
    },
  };
};
