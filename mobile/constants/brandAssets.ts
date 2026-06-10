// constants/brandAssets.ts
//
// Per-brand image assets. Metro requires every require() path to be a static
// string literal, so we can't do `require(BRAND.logo)`. Instead we list each
// brand's assets here and pick the active one by BRAND_ID — same pattern as
// services/serviceIcons.ts.
//
// To give the HOME (FreshSofa) app its own artwork:
//   1. Drop the files into assets/images/ (e.g. freshsofa-logo.png,
//      freshsofa-wordmark.png, hero-home.png).
//   2. Swap the three `require(...)` lines under `home` below to point at them.
// Until then, home falls back to the car artwork so the app still builds.

import { BRAND_ID } from './brand';

const ASSETS = {
  car: {
    logo: require('@/assets/images/car-logo.png'),       // main mark
    wordmark: require('@/assets/images/car-prime.png'),   // text logo under the mark
    hero: require('@/assets/images/car-hero.png'),    // home-screen hero image
  },
  home: {
    // TODO: replace with FreshSofa artwork once added to assets/images/.
    logo: require('@/assets/images/home-logo.png'),       // main mark
    wordmark: require('@/assets/images/home-prime.png'),   // text logo under the mark
    hero: require('@/assets/images/home-hero.png'),    // home-screen hero image
  },
} as const;

/** The image assets for the brand this build was compiled for. */
export const BRAND_ASSETS = ASSETS[BRAND_ID];
