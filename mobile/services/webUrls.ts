// services/webUrls.ts
//
// URLs to the public website (terms, privacy, cancellation, etc.).
// Configured via .env (EXPO_PUBLIC_WEB_BASE_URL).

const WEB_BASE_URL =
  process.env.EXPO_PUBLIC_WEB_BASE_URL ?? 'https://clean-car-app.onrender.com';

const join = (path: string) => `${WEB_BASE_URL.replace(/\/$/, '')}${path}`;

export const WebUrls = {
  base: WEB_BASE_URL,
  terms: join('/terms'),
  privacy: join('/privacy'),
  cancellation: join('/cancellation'),
} as const;
