// services/webUrls.ts
//
// URLs to the public website (terms, privacy, cancellation, etc.).
// Configured via .env (EXPO_PUBLIC_WEB_BASE_URL).

import { BRAND } from '../constants/brand';

const WEB_BASE_URL =
  process.env.EXPO_PUBLIC_WEB_BASE_URL ?? 'https://clean-car-app.onrender.com';

// Pass the active brand so the website serves the matching (car/home) policy
// pages regardless of which domain WEB_BASE_URL points at.
const join = (path: string) =>
  `${WEB_BASE_URL.replace(/\/$/, '')}${path}?brand=${encodeURIComponent(BRAND.apiBrand)}`;

export const WebUrls = {
  base: WEB_BASE_URL,
  terms: join('/terms'),
  privacy: join('/privacy'),
  cancellation: join('/cancellation'),
} as const;
