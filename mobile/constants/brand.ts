// constants/brand.ts
//
// Central white-label brand configuration. ONE codebase powers multiple apps
// (car interior cleaning, couch/mattress cleaning, ...). The active brand is
// chosen at build time via the EXPO_PUBLIC_BRAND env var (see .env / eas.json).
//
// Everything that differs between apps *as a feature flag* lives here. Pure
// visual differences (logo/hero images, app name, bundle id) are handled in
// app.config.js + the theme in constants/colors.js.

export type BrandId = 'car' | 'home';

/** Active brand. Defaults to 'car' so the original app behaves unchanged. */
export const BRAND_ID: BrandId =
  process.env.EXPO_PUBLIC_BRAND === 'home' ? 'home' : 'car';

export interface BrandConfig {
  id: BrandId;
  /** Value sent as `?brand=` on API requests (and stored on orders/services). */
  apiBrand: BrandId;
  /** Whether the vehicle registration-plate field/rows are shown. */
  hasVehiclePlate: boolean;
  /**
   * 'toggle'   → extras are selected on/off (car app).
   * 'quantity' → each service has a quantity stepper (home app, e.g. 2 sofas).
   */
  serviceMode: 'toggle' | 'quantity';
  /**
   * Public website for this brand — used for the in-app Terms/Privacy/
   * Cancellation links so each app opens its own domain. This is the source of
   * truth; EXPO_PUBLIC_WEB_BASE_URL only overrides it for local testing.
   */
  webBaseUrl: string;
}

export const BRANDS: Record<BrandId, BrandConfig> = {
  car: {
    id: 'car',
    apiBrand: 'car',
    hasVehiclePlate: true,
    serviceMode: 'toggle',
    webBaseUrl: 'https://cargrime.de',
  },
  home: {
    id: 'home',
    apiBrand: 'home',
    hasVehiclePlate: false,
    serviceMode: 'quantity',
    webBaseUrl: 'https://homegrime.de',
  },
};

/** The resolved config for the brand this build was compiled for. */
export const BRAND: BrandConfig = BRANDS[BRAND_ID];
