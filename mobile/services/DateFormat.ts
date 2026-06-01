// services/DateFormat.ts
//
// All booking times are expressed in Europe/Berlin regardless of the
// device's local timezone. These helpers wrap Intl.DateTimeFormat so we get
// the same display in Munich, New York, or Tokyo.

const TZ = 'Europe/Berlin';
const LOCALE = 'en-US';

type DateLike = Date | string | number | null | undefined;

const toDate = (input: DateLike): Date | null => {
  if (input == null) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
};

const fmt = (input: DateLike, options: Intl.DateTimeFormatOptions, fallback = '-'): string => {
  const d = toDate(input);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: TZ }).format(d);
};

/** "August 5th, 2026 - 14:30" — full date with 24h time. */
export const formatDateTime = (date: DateLike, fallback = '-') =>
  fmt(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }, fallback).replace(',', '').replace(' at ', ' - ');

/** "14:30" — Berlin time, 24h. */
export const formatTime = (date: DateLike, fallback = '-') =>
  fmt(date, { hour: '2-digit', minute: '2-digit', hour12: false }, fallback);

/** "2:30 PM" — Berlin time, 12h. */
export const formatTime12h = (date: DateLike, fallback = '-') =>
  fmt(date, { hour: 'numeric', minute: '2-digit', hour12: true }, fallback);

/** "Wednesday, Aug 5, 2026 - 2:30 PM" */
export const formatLongDateTime12h = (date: DateLike, fallback = '-') => {
  const d = toDate(date);
  if (!d) return fallback;
  const datePart = fmt(d, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const timePart = formatTime12h(d);
  return `${datePart} - ${timePart}`;
};

/** "Wed" / "5" / "Aug" — small calendar pill bits. */
export const formatWeekday = (date: DateLike) => fmt(date, { weekday: 'short' });
export const formatDayOfMonth = (date: DateLike) => fmt(date, { day: 'numeric' });
export const formatMonthShort = (date: DateLike) => fmt(date, { month: 'short' });
