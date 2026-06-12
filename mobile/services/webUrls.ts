// services/webUrls.ts
//
// URLs to the public website (terms, privacy, cancellation, etc.).
// Configured via .env (EXPO_PUBLIC_WEB_BASE_URL).

import { BRAND, BRAND_ID } from '../constants/brand';

// Each app links to its OWN website (home → homegrime.de, car → cargrime.de).
// The domain comes from the brand config; a per-brand env var
// (EXPO_PUBLIC_WEB_BASE_URL_HOME / _CAR) can override it for local testing.
// We intentionally do NOT use the shared EXPO_PUBLIC_WEB_BASE_URL here, because
// that single value would point both brands at the same domain.
const ENV_OVERRIDE =
  BRAND_ID === 'home'
    ? process.env.EXPO_PUBLIC_WEB_BASE_URL_HOME
    : process.env.EXPO_PUBLIC_WEB_BASE_URL_CAR;

const WEB_BASE_URL = (ENV_OVERRIDE ?? BRAND.webBaseUrl).replace(/\/$/, '');

// Append the brand too, so the right policy pages render even if the override
// points at a non-branded host (e.g. localhost).
const join = (path: string) =>
  `${WEB_BASE_URL}${path}?brand=${encodeURIComponent(BRAND.apiBrand)}`;

export const WebUrls = {
  base: WEB_BASE_URL,
  terms: join('/terms'),
  privacy: join('/privacy'),
  cancellation: join('/cancellation'),
} as const;
