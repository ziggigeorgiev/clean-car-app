// app.config.js
//
// White-label Expo configuration. The static base lives in app.json (the car
// app's values); this file overlays brand-specific identity (name, slug,
// bundle id, scheme, colors, store metadata) based on EXPO_PUBLIC_BRAND.
//
//   EXPO_PUBLIC_BRAND=car   (default) → CarGrime
//   EXPO_PUBLIC_BRAND=home            → HomeGrime (couch / mattress cleaning)
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
    // EAS project 93d88494… was created with the slug "mobile"; the slug is an
    // internal EAS identifier (not user-facing) and must match the server, so
    // keep it as "mobile". Store name/bundle id are set separately below.
    slug: 'mobile',
    scheme: 'cargrime',
    owner: 'zdravkogeorgiev',
    primaryColor: '#2C4D9F',
    description:
      'Book professional on-site car interior cleaning. Trained cleaners come to your home or workplace.',
    iosBundleId: 'de.cargrime.app',
    androidPackage: 'de.cargrime.app',
    icon: './assets/images/car-icon.png',
    adaptiveIcon: './assets/images/car-adaptive-icon.png',
    // null → keep the projectId already present in app.json's extra.eas.
    easProjectId: null,
  },
  home: {
    name: 'HomeGrime',
    slug: 'homegrime',
    scheme: 'homegrime',
    owner: 'zdravkogeorgiev',
    primaryColor: '#2C4D9F', // same as car for now
    description:
      'Book professional on-site couch, sofa and mattress cleaning. Trained cleaners come to your home or workplace.',
    iosBundleId: 'de.homegrime.app',
    androidPackage: 'de.homegrime.app',
    icon: './assets/images/home-icon.png',
    adaptiveIcon: './assets/images/home-adaptive-icon.png',
    easProjectId: '2d741277-b38d-49f8-b88f-feb3ecc03b53',
  },
};

module.exports = ({ config }) => {
  const b = BRANDS[BRAND];

  // EAS projectId is bound to one owner+slug, so each brand needs its own.
  // Strip the inherited (car) projectId from app.json, then re-apply only the
  // correct one: car keeps app.json's id; other brands use their own
  // easProjectId (and get NO id until it's set, so `eas init` can mint one).
  const inheritedEas = (config.extra && config.extra.eas) || {};
  const { projectId: carProjectId, ...easRest } = inheritedEas;
  const projectId = b.easProjectId || (BRAND === 'car' ? carProjectId : undefined);

  return {
    ...config,
    name: b.name,
    slug: b.slug,
    scheme: b.scheme,
    owner: b.owner,
    primaryColor: b.primaryColor,
    description: b.description,
    icon: b.icon,

    ios: {
      ...config.ios,
      bundleIdentifier: b.iosBundleId,
      icon: b.icon,
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
        foregroundImage: b.adaptiveIcon,
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
        ...easRest,
        ...(projectId ? { projectId } : {}),
      },
    },
  };
};
