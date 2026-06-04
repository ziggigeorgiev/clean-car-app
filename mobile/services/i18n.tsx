// services/i18n.tsx
//
// Lightweight i18n with German + English. Persists the user's choice in
// AsyncStorage so it survives app restarts. Default language is German.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Locale = 'de' | 'en';
export const DEFAULT_LOCALE: Locale = 'de';
const STORAGE_KEY = 'app_locale';

// Add new keys here. Missing keys fall back to the English string.
const translations = {
  // Tab bar
  'tab.home': { en: 'Home', de: 'Start' },
  'tab.orders': { en: 'Orders', de: 'Aufträge' },
  'tab.about': { en: 'About', de: 'Über uns' },
  'tab.settings': { en: 'Settings', de: 'Einstellungen' },

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
} as const;

type TranslationKey = keyof typeof translations;
type ParamMap = Record<string, string | number>;

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => Promise<void>;
  t: (key: TranslationKey, params?: ParamMap) => string;
  ready: boolean;
}>({
  locale: DEFAULT_LOCALE,
  setLocale: async () => {},
  t: (k) => String(k),
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
      ready,
    }),
    [locale, setLocale, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation() {
  return useContext(I18nContext);
}
