// services/i18n.tsx
//
// Lightweight i18n with German + English. Persists the user's choice in
// AsyncStorage so it survives app restarts. Default language is German.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Locale = 'de' | 'en';
export const DEFAULT_LOCALE: Locale = 'de';
const STORAGE_KEY = 'app_locale';

// Re-exported for convenience by AppLoading (and anyone else who needs the
// raw translate function without React context).

// Add new keys here. Missing keys fall back to the English string.
const translations = {
  // Tab bar
  'tab.home': { en: 'Home', de: 'Start' },
  'tab.orders': { en: 'Orders', de: 'Aufträge' },
  'tab.about': { en: 'About', de: 'Über App' },
  'tab.settings': { en: 'Settings', de: 'Konto' },

  // Step indicator / screen titles
  'screen.location': { en: 'Select location', de: 'Standort auswählen' },
  'screen.availability': { en: 'Select availability', de: 'Termin auswählen' },
  'screen.services': { en: 'Select services', de: 'Leistungen auswählen' },
  'screen.confirm': { en: 'Confirm booking', de: 'Buchung bestätigen' },
  'screen.acknowledge': { en: 'Booking confirmation', de: 'Buchungsbestätigung' },
  'screen.order_details': { en: 'Order details', de: 'Auftragsdetails' },
  'screen.orders': { en: 'Orders', de: 'Aufträge' },
  'screen.settings': { en: 'Settings', de: 'Einstellungen' },

  // Common buttons
  'btn.back': { en: 'Back', de: 'Zurück' },
  'btn.confirm': { en: 'Confirm', de: 'Bestätigen' },
  'btn.place_order': { en: 'Place Order', de: 'Auftrag erteilen' },
  'btn.save_settings': { en: 'Save Settings', de: 'Einstellungen speichern' },
  'btn.confirm_availability': { en: 'Confirm Availability', de: 'Termin bestätigen' },
  'btn.confirm_location': { en: 'Confirm location', de: 'Standort bestätigen' },
  'btn.view_booking_details': { en: 'View Booking Details', de: 'Buchungsdetails anzeigen' },
  'btn.add_to_calendar': { en: 'Add to Calendar', de: 'Zum Kalender hinzufügen' },

  // Loading / empty states
  'loading.generic': { en: 'Loading...', de: 'Wird geladen ...' },
  'loading.device_info': { en: 'Loading device and personal information...', de: 'Geräte- und Benutzerdaten werden geladen ...' },
  'loading.order_details': { en: 'Loading order details...', de: 'Auftragsdetails werden geladen ...' },
  'loading.booking_confirmation': { en: 'Loading booking confirmation', de: 'Buchungsbestätigung wird geladen' },
  'empty.no_orders': { en: 'We are unable to find any orders at this time.', de: 'Aktuell sind keine Aufträge vorhanden.' },
  'empty.no_orders_title': { en: 'No orders found', de: 'Keine Aufträge gefunden' },
  'empty.no_times': { en: 'No available times for this date.', de: 'Für dieses Datum sind keine Termine verfügbar.' },

  // Acknowledge
  'ack.confirmed': { en: 'Booking confirmed!', de: 'Buchung bestätigt!' },
  'ack.scheduled': { en: 'Your car cleaning service is scheduled', de: 'Ihre Fahrzeugreinigung ist geplant' },
  'ack.help': { en: 'Need help? Call us at 1-800-CLEEN', de: 'Brauchen Sie Hilfe? Rufen Sie uns an: 1-800-CLEEN' },

  // Services screen
  'services.vehicle_details': { en: 'Vehicle Details', de: 'Fahrzeugdaten' },
  'services.registration_number': { en: 'Registration Number', de: 'Kennzeichen' },
  'services.phone_number': { en: 'Phone Number', de: 'Telefonnummer' },
  'services.additional': { en: 'Additional Services', de: 'Zusatzleistungen' },
  'services.provided': { en: 'Services Provided', de: 'Enthaltene Leistungen' },
  'services.selected': { en: 'Selected services', de: 'Ausgewählte Leistungen' },
  'services.error_plate': { en: 'Registration number is required', de: 'Kennzeichen ist erforderlich' },
  'services.error_phone': { en: 'Valid phone number is required', de: 'Bitte geben Sie eine gültige Telefonnummer ein' },
  'services.terms_prefix': { en: 'By placing order you agree to our ', de: 'Mit der Auftragsvergabe akzeptieren Sie unsere ' },
  'services.terms_link': { en: 'Terms', de: 'AGB' },

  // Availability / Sections
  'avail.date': { en: 'Select Date', de: 'Datum auswählen' },
  'avail.times': { en: 'Available Times', de: 'Verfügbare Uhrzeiten' },
  'avail.recent': { en: 'Recent Availability', de: 'Zuletzt ausgewählt' },
  'avail.none_selected': { en: 'No recent availability selected.', de: 'Noch kein Termin ausgewählt.' },
  'avail.required': { en: 'Please select an available time.', de: 'Bitte wählen Sie einen verfügbaren Termin.' },

  // Section titles
  'section.availability': { en: 'Availability', de: 'Termin' },
  'section.contact_info': { en: 'Contact info', de: 'Kontaktdaten' },
  'section.location': { en: 'Location', de: 'Standort' },
  'section.what_to_expect': { en: 'What to expect?', de: 'Was erwartet Sie?' },
  'section.expectations': {
    en: 'The cleaner arrives at the scheduled time, with an average cleaning duration of 25 minutes. A quality inspection is performed after cleaning, and payment is processed upon service completion.',
    de: 'Der Reiniger trifft pünktlich zum vereinbarten Termin ein. Die Reinigung dauert durchschnittlich 25 Minuten. Nach Abschluss erfolgt eine Qualitätskontrolle und die Zahlung wird abgewickelt.',
  },

  // Settings
  'settings.device_info': { en: 'Device information', de: 'Geräteinformationen' },
  'settings.device_id': { en: 'Device ID:', de: 'Geräte-ID:' },
  'settings.device_info_help': { en: 'This information is used to track your activity in our system.', de: 'Diese Information wird verwendet, um Ihre Aktivität in unserem System zuzuordnen.' },
  'settings.personal_info': { en: 'Personal information', de: 'Persönliche Daten' },
  'settings.email': { en: 'Email', de: 'E-Mail' },
  'settings.personal_help': { en: 'This information is used to prefill some of the inputs for faster booking complition. In case you provide email we are going to send you booking confirmation on the email.', de: 'Diese Daten werden verwendet, um Felder vorauszufüllen und Ihnen die Buchung zu erleichtern. Wenn Sie eine E-Mail-Adresse angeben, senden wir Ihnen die Buchungsbestätigung per E-Mail.' },
  'settings.saved': { en: 'The modifications were saved successfully.', de: 'Die Änderungen wurden erfolgreich gespeichert.' },
  'settings.language': { en: 'Language', de: 'Sprache' },
  'settings.language_help': { en: 'Choose the app language. Your selection is saved on this device.', de: 'Wählen Sie die App-Sprache. Ihre Auswahl wird auf diesem Gerät gespeichert.' },
  'settings.lang_en': { en: 'English', de: 'Englisch' },
  'settings.lang_de': { en: 'German', de: 'Deutsch' },

  // Policy footer / About
  'policy.terms': { en: 'Terms & Conditions', de: 'AGB' },
  'policy.privacy': { en: 'Privacy Policy', de: 'Datenschutzerklärung' },
  'policy.cancellation': { en: 'Cancellation Policy', de: 'Stornierungsbedingungen' },

  // Step indicator
  'step.of': { en: 'Step {current} of {total}', de: 'Schritt {current} von {total}' },

  // Home
  'home.title': { en: 'CleanCar Pro', de: 'CleanCar Pro' },
  'home.subtitle': { en: 'Professional on-site car cleaning', de: 'Professionelle Autoreinigung vor Ort' },
  'home.premium_title': { en: 'Premium Car Care Services', de: 'Premium-Reinigungsservice' },
  'home.premium_desc': {
    en: 'Professional cleaning for your vehicle by experienced specialists at your home or office.',
    de: 'Professionelle Reinigung Ihres Fahrzeugs durch erfahrene Spezialisten – bei Ihnen zu Hause oder im Büro.',
  },
  'home.advantages': { en: 'Our Advantages', de: 'Unsere Vorteile' },
  'home.exterior_title': { en: 'Exterior Wash', de: 'Außenreinigung' },
  'home.exterior_desc': { en: 'Complete exterior cleaning solution', de: 'Vollständige Außenreinigung' },
  'home.interior_title': { en: 'Interior Clean', de: 'Innenreinigung' },
  'home.interior_desc': { en: 'Deep cleaning and sanitization', de: 'Tiefenreinigung und Desinfektion' },
  'home.included': { en: 'Included in the standard package', de: 'Im Standardpaket enthalten' },
  'home.bookable': { en: 'Available as add-on', de: 'Zusätzlich buchbar' },
  'home.equipment_title': { en: 'Professional equipment', de: 'Professionelles Equipment' },
  'home.equipment_desc': { en: 'State-of-the-art cleaning tools and technology', de: 'Modernste Reinigungsgeräte und Technologien' },
  'home.specialists_title': { en: 'Experienced specialists', de: 'Erfahrene Spezialisten' },
  'home.specialists_desc': { en: 'Trained cleaning professionals', de: 'Ausgebildete Reinigungsprofis mit Expertise' },
  'home.eco_title': { en: 'Environmentally friendly', de: 'Umweltfreundlich' },
  'home.eco_desc': { en: 'Sustainable and gentle cleaning products', de: 'Nachhaltige und schonende Reinigungsmittel' },

  // App splash / loading screen
  'app.copyright': {
    en: '© 2026 CarGrime · All rights reserved.',
    de: '© 2026 CarGrime · Alle Rechte vorbehalten.',
  },

  // New home (hero / recent booking / service tiles)
  'home.hero_offer': {
    en: 'Book your professional interior car cleaning at your place now',
    de: 'Buchen Sie jetzt Ihre professionelle Innenreinigung bei Ihnen vor Ort',
  },
  'home.book_now': { en: 'Book Now', de: 'Jetzt buchen' },
  'home.recent': { en: 'Recent Booking', de: 'Letzte Buchung' },
  'home.no_recent': { en: "You don't have any bookings yet.", de: 'Sie haben noch keine Buchungen.' },
  'home.our_services': { en: 'Our Services', de: 'Unsere Leistungen' },
  'home.your_last_booking': { en: 'Your last booking', de: 'Ihre letzte Buchung' },
  'status.completed': { en: 'Completed', de: 'Abgeschlossen' },
  'status.open': { en: 'Open', de: 'Offen' },
  'status.cancelled': { en: 'Cancelled', de: 'Storniert' },

  // -------------------------------------------------------------------------
  // Services. The `name` and `description` columns in the DB store the
  // translation key (e.g. `exterior.name`, `interior.description`). To add
  // a new service, insert a key here matching whatever you stored in the DB.
  // -------------------------------------------------------------------------
  'exterior.name': { en: 'Exterior wash', de: 'Außenwäsche' },
  'exterior.description': { en: 'Full exterior body wash and rinse', de: 'Komplette Außenwäsche der Karosserie' },

  'interior.name': { en: 'Interior cleaning', de: 'Innenreinigung' },
  'interior.description': { en: 'Vacuum, dust and wipe-down of the interior', de: 'Staubsaugen, Entstauben und Abwischen des Innenraums' },

  'baby_chair.name': { en: 'Baby seat cleaning', de: 'Kindersitzreinigung' },
  'baby_chair.description': { en: 'Deep cleaning of child / baby seats', de: 'Tiefenreinigung von Kinder- und Babysitzen' },

  'wax.name': { en: 'Wax & polish', de: 'Wachs & Politur' },
  'wax.description': { en: 'Protective wax coat and hand polish', de: 'Schützende Wachsschicht und Handpolitur' },

  // ----- new interior cleaning catalog (Basic) ----------------------------
  'interior_vacuum.name': { en: 'Interior vacuum', de: 'Innenstaubsauger' },
  'interior_vacuum.description': {
    en: 'Carpets, mats, seats and trunk thoroughly vacuumed.',
    de: 'Teppiche, Matten, Sitze und Kofferraum gründlich gesaugt.',
  },

  'dashboard_wipe.name': { en: 'Dashboard & trim wipe-down', de: 'Armaturenbrett & Zierleisten' },
  'dashboard_wipe.description': {
    en: 'All hard surfaces wiped and dust-free.',
    de: 'Alle harten Oberflächen gereinigt und staubfrei.',
  },

  'seat_wash.name': { en: 'Seat wash (fabric)', de: 'Sitzwäsche (Stoff)' },
  'seat_wash.description': {
    en: 'Deep-cleans cloth seats; removes spills and odors.',
    de: 'Tiefenreinigung von Stoffsitzen; entfernt Flecken und Gerüche.',
  },

  'carpet_shampoo.name': { en: 'Carpet shampoo', de: 'Teppichshampoonierung' },
  'carpet_shampoo.description': {
    en: 'Wet extraction for stains and ground-in dirt.',
    de: 'Nassextraktion für Flecken und festsitzenden Schmutz.',
  },

  'leather_conditioning.name': { en: 'Leather conditioning', de: 'Lederpflege' },
  'leather_conditioning.description': {
    en: 'Cleans and nourishes leather seats to prevent cracking.',
    de: 'Reinigt und pflegt Ledersitze, um Risse zu vermeiden.',
  },

  // ----- new interior cleaning catalog (Extras) ---------------------------
  'window_cleaning.name': { en: 'Window cleaning (interior)', de: 'Fensterreinigung (innen)' },
  'window_cleaning.description': {
    en: 'Streak-free clean on the inside of all windows.',
    de: 'Streifenfreie Reinigung der Innenseite aller Scheiben.',
  },

  'baby_seat.name': { en: 'Baby seat cleaning', de: 'Kindersitzreinigung' },
  'baby_seat.description': {
    en: 'Deep clean of child / baby seats, including straps.',
    de: 'Tiefenreinigung von Kinder- und Babysitzen, inkl. Gurte.',
  },

  'pet_hair.name': { en: 'Pet hair removal', de: 'Tierhaarentfernung' },
  'pet_hair.description': {
    en: 'Specialized brushes for stubborn pet hair on fabrics.',
    de: 'Spezielle Bürsten gegen hartnäckige Tierhaare auf Stoffen.',
  },

  'trunk_cleaning.name': { en: 'Trunk cleaning', de: 'Kofferraum-Reinigung' },
  'trunk_cleaning.description': {
    en: 'Deep vacuum and wipe-down of the entire trunk, including spare-tire well and side panels.',
    de: 'Gründliches Saugen und Wischen des gesamten Kofferraums, inkl. Reserveradmulde und Seitenverkleidungen.',
  },

  'headliner_cleaning.name': { en: 'Headliner cleaning', de: 'Decken-Reinigung' },
  'headliner_cleaning.description': {
    en: 'Spot-cleans the roof fabric — stains, smoke residue and dust.',
    de: 'Punktreinigung des Dachhimmels — Flecken, Rauchrückstände und Staub.',
  },

  // Category aggregate labels shown above the per-service list.
  'category.basic.name': { en: 'Basic cleaning', de: 'Standardreinigung' },
  'category.extra.name': { en: 'Extra services', de: 'Zusatzleistungen' },

  // Misc
  'total': { en: 'Total', de: 'Gesamt' },
  'swipe_to_refresh': { en: 'Swipe up to refresh', de: 'Zum Aktualisieren nach oben wischen' },

  // -------------------------------------------------------------------------
  // Process steps. Store these key strings as the `name` / `text` columns on
  // the `process_steps` rows (same pattern as services).
  // -------------------------------------------------------------------------
  'step.booking_confirmed.name': { en: 'Thanks for your order', de: 'Vielen Dank für Ihre Bestellung' },
  'step.booking_confirmed.text': {
    en: 'We are looking for an available cleaner',
    de: 'Wir suchen einen verfügbaren Reiniger',
  },

  'step.cleaner_assigned.name': { en: 'Cleaner assigned', de: 'Reiniger zugewiesen' },
  'step.cleaner_assigned.text': {
    en: 'We will inform you when the cleaner is on the way',
    de: 'Wir informieren Sie, sobald der Reiniger unterwegs ist',
  },

  'step.on_the_way.name': { en: 'On the way', de: 'Unterwegs' },
  'step.on_the_way.text': {
    en: 'The cleaner will call you when they arrive',
    de: 'Der Reiniger ruft Sie an, sobald er ankommt',
  },

  'step.cleaning_in_progress.name': { en: 'Cleaning in progress', de: 'Reinigung läuft' },
  'step.cleaning_in_progress.text': {
    en: 'Almost done, please be patient',
    de: 'Fast fertig, einen Moment bitte',
  },

  'step.completed.name': { en: 'Completed', de: 'Abgeschlossen' },
  'step.completed.text': {
    en: 'Thanks for your order, we hope you are satisfied',
    de: 'Vielen Dank für Ihre Bestellung — wir hoffen, Sie sind zufrieden',
  },
} as const;

type TranslationKey = keyof typeof translations;
type ParamMap = Record<string, string | number>;

/** Minimal shape of a service that the i18n helpers expect. */
export type TranslatableService = {
  id: number;
  name?: string;
  description?: string;
};
type ServiceField = 'name' | 'description';

/** Minimal shape of a process step that the i18n helpers expect. */
export type TranslatableStep = {
  name?: string;
  text?: string;
};
type StepField = 'name' | 'text';

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => Promise<void>;
  t: (key: TranslationKey, params?: ParamMap) => string;
  tService: (service: TranslatableService, field?: ServiceField) => string;
  tStep: (step: TranslatableStep, field?: StepField) => string;
  ready: boolean;
}>({
  locale: DEFAULT_LOCALE,
  setLocale: async () => {},
  t: (k) => String(k),
  tService: (s, f = 'name') => (s ? s[f] ?? '' : ''),
  tStep: (s, f = 'name') => (s ? s[f] ?? '' : ''),
  ready: false,
});

function format(template: string, params?: ParamMap): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export function translate(locale: Locale, key: TranslationKey, params?: ParamMap): string {
  const entry = translations[key];
  if (!entry) return String(key);
  const value = entry[locale] ?? entry.en ?? String(key);
  return format(value, params);
}

/**
 * Translate a service's name or description.
 *
 * The DB columns `name` / `description` contain translation keys
 * (e.g. `"exterior.name"`, `"interior.description"`). This helper looks up
 * the value of that key in the translations table; if the value isn't itself
 * a known key (legacy rows, or a typo), it's returned as-is so the UI never
 * shows blanks.
 */
export function translateService(
  locale: Locale,
  service: TranslatableService | null | undefined,
  field: ServiceField = 'name',
): string {
  return translateRawKey(locale, service?.[field]);
}

/**
 * Translate a process step's name or text. Same pattern as services: the DB
 * column holds the translation key (e.g. `"step.on_the_way.name"`).
 */
export function translateStep(
  locale: Locale,
  step: TranslatableStep | null | undefined,
  field: StepField = 'name',
): string {
  return translateRawKey(locale, step?.[field]);
}

/** Used by translateService/translateStep: the DB value IS the key. */
function translateRawKey(locale: Locale, raw?: string | null): string {
  if (!raw) return '';
  if (raw in (translations as Record<string, unknown>)) {
    return translate(locale, raw as TranslationKey);
  }
  return raw;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as Locale | null;
        if (saved === 'de' || saved === 'en') {
          setLocaleState(saved);
        }
      } catch (e) {
        console.warn('Failed to read locale from storage', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLocale = useCallback(async (l: Locale) => {
    setLocaleState(l);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, l);
    } catch (e) {
      console.warn('Failed to persist locale', e);
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: TranslationKey, params?: ParamMap) => translate(locale, key, params),
      tService: (service: TranslatableService, field: ServiceField = 'name') =>
        translateService(locale, service, field),
      tStep: (step: TranslatableStep, field: StepField = 'name') =>
        translateStep(locale, step, field),
      ready,
    }),
    [locale, setLocale, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation() {
  return useContext(I18nContext);
}
