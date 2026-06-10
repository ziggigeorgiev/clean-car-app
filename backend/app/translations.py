# app/translations.py
"""
Server-side translation table used for emails (the mobile app has its own
copy for in-app rendering). Keys MUST stay in sync with the mobile i18n
table — when you add a new service translation here, add it there too.
"""

from __future__ import annotations

Locale = str  # "de" | "en"
DEFAULT_LOCALE: Locale = "de"


_TRANSLATIONS: dict[str, dict[Locale, str]] = {
    # ----- services ---------------------------------------------------------
    "exterior.name":            {"en": "Exterior wash",          "de": "Außenwäsche"},
    "exterior.description":     {"en": "Full exterior body wash and rinse",
                                 "de": "Komplette Außenwäsche der Karosserie"},

    "interior.name":            {"en": "Interior cleaning",      "de": "Innenreinigung"},
    "interior.description":     {"en": "Vacuum, dust and wipe-down of the interior",
                                 "de": "Staubsaugen, Entstauben und Abwischen des Innenraums"},

    "baby_chair.name":          {"en": "Baby seat cleaning",     "de": "Kindersitzreinigung"},
    "baby_chair.description":   {"en": "Deep cleaning of child / baby seats",
                                 "de": "Tiefenreinigung von Kinder- und Babysitzen"},

    "wax.name":                 {"en": "Wax & polish",           "de": "Wachs & Politur"},
    "wax.description":          {"en": "Protective wax coat and hand polish",
                                 "de": "Schützende Wachsschicht und Handpolitur"},

    # ----- new interior cleaning catalog (Basic) -------------------------
    "interior_vacuum.name":         {"en": "Interior vacuum",   "de": "Innenstaubsauger"},
    "interior_vacuum.description":  {"en": "Carpets, mats, seats and trunk thoroughly vacuumed.",
                                     "de": "Teppiche, Matten, Sitze und Kofferraum gründlich gesaugt."},

    "dashboard_wipe.name":          {"en": "Dashboard & trim wipe-down",
                                     "de": "Armaturenbrett & Zierleisten"},
    "dashboard_wipe.description":   {"en": "All hard surfaces wiped and dust-free.",
                                     "de": "Alle harten Oberflächen gereinigt und staubfrei."},

    "seat_wash.name":               {"en": "Seat wash (fabric)", "de": "Sitzwäsche (Stoff)"},
    "seat_wash.description":        {"en": "Deep-cleans cloth seats; removes spills and odors.",
                                     "de": "Tiefenreinigung von Stoffsitzen; entfernt Flecken und Gerüche."},

    "carpet_shampoo.name":          {"en": "Carpet shampoo",    "de": "Teppichshampoonierung"},
    "carpet_shampoo.description":   {"en": "Wet extraction for stains and ground-in dirt.",
                                     "de": "Nassextraktion für Flecken und festsitzenden Schmutz."},

    "leather_conditioning.name":         {"en": "Leather conditioning", "de": "Lederpflege"},
    "leather_conditioning.description":  {"en": "Cleans and nourishes leather seats to prevent cracking.",
                                          "de": "Reinigt und pflegt Ledersitze, um Risse zu vermeiden."},

    # ----- new interior cleaning catalog (Extras) ------------------------
    "window_cleaning.name":         {"en": "Window cleaning (interior)",
                                     "de": "Fensterreinigung (innen)"},
    "window_cleaning.description":  {"en": "Streak-free clean on the inside of all windows.",
                                     "de": "Streifenfreie Reinigung der Innenseite aller Scheiben."},

    "baby_seat.name":               {"en": "Baby seat cleaning", "de": "Kindersitzreinigung"},
    "baby_seat.description":        {"en": "Deep clean of child / baby seats, including straps.",
                                     "de": "Tiefenreinigung von Kinder- und Babysitzen, inkl. Gurte."},

    "pet_hair.name":                {"en": "Pet hair removal",  "de": "Tierhaarentfernung"},
    "pet_hair.description":         {"en": "Specialized brushes for stubborn pet hair on fabrics.",
                                     "de": "Spezielle Bürsten gegen hartnäckige Tierhaare auf Stoffen."},

    "trunk_cleaning.name":          {"en": "Trunk cleaning",    "de": "Kofferraum-Reinigung"},
    "trunk_cleaning.description":   {"en": "Deep vacuum and wipe-down of the entire trunk, including spare-tire well and side panels.",
                                     "de": "Gründliches Saugen und Wischen des gesamten Kofferraums, inkl. Reserveradmulde und Seitenverkleidungen."},

    "headliner_cleaning.name":      {"en": "Headliner cleaning", "de": "Decken-Reinigung"},
    "headliner_cleaning.description": {"en": "Spot-cleans the roof fabric — stains, smoke residue and dust.",
                                       "de": "Punktreinigung des Dachhimmels — Flecken, Rauchrückstände und Staub."},

    # ----- process steps ----------------------------------------------------
    "step.booking_confirmed.name": {"en": "Thanks for your order",
                                    "de": "Vielen Dank für Ihre Bestellung"},
    "step.booking_confirmed.text": {"en": "We are looking for an available cleaner",
                                    "de": "Wir suchen einen verfügbaren Reiniger"},

    "step.cleaner_assigned.name": {"en": "Cleaner assigned",     "de": "Reiniger zugewiesen"},
    "step.cleaner_assigned.text": {"en": "We will inform you when the cleaner is on the way",
                                   "de": "Wir informieren Sie, sobald der Reiniger unterwegs ist"},

    "step.on_the_way.name":      {"en": "On the way",            "de": "Unterwegs"},
    "step.on_the_way.text":      {"en": "The cleaner will call you when they arrive",
                                  "de": "Der Reiniger ruft Sie an, sobald er ankommt"},

    "step.cleaning_in_progress.name": {"en": "Cleaning in progress",
                                       "de": "Reinigung läuft"},
    "step.cleaning_in_progress.text": {"en": "Almost done, please be patient",
                                       "de": "Fast fertig, einen Moment bitte"},

    "step.completed.name":       {"en": "Completed",             "de": "Abgeschlossen"},
    "step.completed.text":       {"en": "Thanks for your order, we hope you are satisfied",
                                  "de": "Vielen Dank für Ihre Bestellung — wir hoffen, Sie sind zufrieden"},

    # ----- customer booking confirmation email ------------------------------
    "email.customer.subject":     {"en": "Booking confirmed — Order #{order_id}",
                                   "de": "Buchung bestätigt — Auftrag #{order_id}"},
    "email.customer.greeting":    {"en": "Hi,",                         "de": "Hallo,"},
    "email.customer.intro":       {"en": "Thanks for your booking! Here are your details:",
                                   "de": "Vielen Dank für Ihre Buchung! Hier sind Ihre Details:"},
    "email.customer.outro":       {"en": "We will be in touch shortly to confirm your cleaner.",
                                   "de": "Wir melden uns in Kürze, um Ihren Reiniger zu bestätigen."},
    "email.customer.heading":     {"en": "Booking confirmed",          "de": "Buchung bestätigt"},
    "email.customer.signature":   {"en": "— CleanCar",                  "de": "— CleanCar"},

    # Brand-specific overrides (home = couch / mattress / upholstery app). These
    # are looked up first via the `.home` suffix; missing ones fall back to the
    # generic key above.
    "email.customer.signature.home": {"en": "— FreshSofa",             "de": "— FreshSofa"},

    # ----- cleaner notification email ---------------------------------------
    "email.cleaner.subject":      {"en": "[CleanCar] New booking — Order #{order_id} @ {when}",
                                   "de": "[CleanCar] Neue Buchung — Auftrag #{order_id} @ {when}"},
    "email.cleaner.heading":      {"en": "New booking — Order #{order_id}",
                                   "de": "Neue Buchung — Auftrag #{order_id}"},
    "email.cleaner.intro":        {"en": "New booking for CleanCar:",
                                   "de": "Neue Buchung für CleanCar:"},
    "email.cleaner.cta_open":     {"en": "Open booking",                "de": "Buchung öffnen"},
    "email.cleaner.cta_calendar": {"en": "Add to Google Calendar",      "de": "Zu Google Kalender hinzufügen"},
    "email.cleaner.footer":       {"en": "CleanCar internal notification.",
                                   "de": "Interne Benachrichtigung von CleanCar."},

    # Brand-specific (home) overrides for the cleaner email.
    "email.cleaner.subject.home": {"en": "[FreshSofa] New booking — Order #{order_id} @ {when}",
                                   "de": "[FreshSofa] Neue Buchung — Auftrag #{order_id} @ {when}"},
    "email.cleaner.intro.home":   {"en": "New booking for FreshSofa:",
                                   "de": "Neue Buchung für FreshSofa:"},
    "email.cleaner.footer.home":  {"en": "FreshSofa internal notification.",
                                   "de": "Interne Benachrichtigung von FreshSofa."},

    # ----- shared field labels ----------------------------------------------
    "email.field.order":    {"en": "Order",     "de": "Auftrag"},
    "email.field.when":     {"en": "When",      "de": "Termin"},
    "email.field.where":    {"en": "Where",     "de": "Ort"},
    "email.field.vehicle":  {"en": "Vehicle",   "de": "Fahrzeug"},
    "email.field.phone":    {"en": "Phone",     "de": "Telefon"},
    "email.field.email":    {"en": "Email",     "de": "E-Mail"},
    "email.field.services": {"en": "Services",  "de": "Leistungen"},
    "email.field.total":    {"en": "Total",     "de": "Gesamt"},
    "email.field.tz_suffix":{"en": "(Europe/Berlin)", "de": "(Europa/Berlin)"},

    # ----- web UI -----------------------------------------------------------
    "web.brand":            {"en": "CleanCar",  "de": "CleanCar"},
    "web.lang.de":          {"en": "Deutsch",   "de": "Deutsch"},
    "web.lang.en":          {"en": "English",   "de": "English"},
    "web.last_updated":     {"en": "Last updated:", "de": "Zuletzt aktualisiert:"},

    # cleaner orders list
    "web.cleaner.title":            {"en": "Cleaner — Orders", "de": "Reiniger — Aufträge"},
    "web.cleaner.heading":          {"en": "Open orders",       "de": "Offene Aufträge"},
    "web.cleaner.subheading":       {"en": "Pick an order to view its steps and mark progress.",
                                     "de": "Wählen Sie einen Auftrag, um Schritte und Fortschritt zu sehen."},
    "web.cleaner.empty":            {"en": "No open orders right now. Take a break ☕",
                                     "de": "Aktuell keine offenen Aufträge. Gönnen Sie sich eine Pause ☕"},
    "web.cleaner.order_prefix":     {"en": "Order",             "de": "Auftrag"},

    # cleaner order detail
    "web.cleaner.back_to_list":     {"en": "← All orders",      "de": "← Alle Aufträge"},
    "web.cleaner.vehicle":          {"en": "Vehicle",           "de": "Fahrzeug"},
    "web.cleaner.phone":            {"en": "Phone",             "de": "Telefon"},
    "web.cleaner.status":           {"en": "Status",            "de": "Status"},
    "web.cleaner.services":         {"en": "Services",          "de": "Leistungen"},
    "web.cleaner.process_steps":    {"en": "Process steps",     "de": "Prozessschritte"},
    "web.cleaner.complete_order":   {"en": "Complete order",    "de": "Auftrag abschließen"},
    "web.cleaner.cancel_order":     {"en": "Cancel order",      "de": "Auftrag stornieren"},
    "web.cleaner.cancel_confirm":   {"en": "Cancel this order?",
                                     "de": "Diesen Auftrag wirklich stornieren?"},
    "web.cleaner.reopen_order":     {"en": "Reopen order",      "de": "Auftrag erneut öffnen"},
    "web.cleaner.start":            {"en": "Start",             "de": "Starten"},
    "web.cleaner.mark_complete":    {"en": "Mark complete",     "de": "Als erledigt markieren"},
    "web.cleaner.completed_btn":    {"en": "Completed",         "de": "Erledigt"},

    # Web status badges + step status (lower-case keys to match the DB value)
    "web.status.open":              {"en": "open",              "de": "offen"},
    "web.status.completed":         {"en": "completed",         "de": "abgeschlossen"},
    "web.status.cancelled":         {"en": "cancelled",         "de": "storniert"},
    "web.status.pending":           {"en": "pending",           "de": "ausstehend"},
    "web.status.in_progress":       {"en": "in progress",       "de": "läuft"},
    "web.status.failed":            {"en": "failed",            "de": "fehlgeschlagen"},

    # policy pages
    "web.policy.terms.title":       {"en": "Terms & Conditions — CleanCar",
                                     "de": "AGB — CleanCar"},
    "web.policy.terms.heading":     {"en": "Terms & Conditions",
                                     "de": "Allgemeine Geschäftsbedingungen"},
    "web.policy.privacy.title":     {"en": "Privacy Policy — CleanCar",
                                     "de": "Datenschutzerklärung — CleanCar"},
    "web.policy.privacy.heading":   {"en": "Privacy Policy",   "de": "Datenschutzerklärung"},
    "web.policy.cancellation.title":{"en": "Cancellation Policy — CleanCar",
                                     "de": "Stornierungsbedingungen — CleanCar"},
    "web.policy.cancellation.heading": {"en": "Cancellation Policy",
                                        "de": "Stornierungsbedingungen"},

    # Generic policy section labels (used only as placeholders — the long copy
    # stays in the existing templates for now, but the page chrome translates.)
    "web.policy.questions":         {"en": "Questions? Reach us at",
                                     "de": "Fragen? Erreichen Sie uns unter"},

    # public index
    "web.index.title":              {"en": "CleanCar — Professional on-site car cleaning",
                                     "de": "CleanCar — Professionelle Autoreinigung vor Ort"},
    "web.index.hero_headline":      {"en": "Book your professional car cleaning at your place",
                                     "de": "Buchen Sie Ihre professionelle Autoreinigung bei Ihnen vor Ort"},
    "web.index.hero_sub":           {"en": "Trained cleaners, premium equipment, eco-friendly products. Download the app and book in seconds.",
                                     "de": "Geschulte Reiniger, Premium-Ausstattung, umweltfreundliche Produkte. Laden Sie die App herunter und buchen Sie in Sekunden."},
    "web.index.download_heading":   {"en": "Get the app",
                                     "de": "App herunterladen"},
    "web.index.download_sub":       {"en": "Scan the QR with your phone or tap a badge below.",
                                     "de": "Scannen Sie den QR-Code mit Ihrem Handy oder tippen Sie auf eine der Schaltflächen."},
    "web.index.qr_ios":             {"en": "Scan for iOS",
                                     "de": "QR für iOS scannen"},
    "web.index.qr_android":         {"en": "Scan for Android",
                                     "de": "QR für Android scannen"},
    "web.index.services_heading":   {"en": "Our services",
                                     "de": "Unsere Leistungen"},
    "web.index.services_sub":       {"en": "Pick the basics or add-on extras. Transparent prices, no surprises.",
                                     "de": "Wählen Sie das Standardpaket oder fügen Sie Extras hinzu. Transparente Preise, keine Überraschungen."},
    "web.index.footer_legal":       {"en": "Legal",
                                     "de": "Rechtliches"},
    "web.footer.copyright":         {"en": "© 2026 CarGrime · All rights reserved.",
                                     "de": "© 2026 CarGrime · Alle Rechte vorbehalten."},
}


def translate(raw: str | None, locale: Locale = DEFAULT_LOCALE, **params) -> str:
    """
    Translate a single key. If ``raw`` isn't itself a known key (e.g. a legacy
    row or a typo) it is returned verbatim — same safe-fallback behaviour as
    the mobile app. ``params`` are interpolated into ``{name}`` placeholders.
    """
    if not raw:
        return ""
    entry = _TRANSLATIONS.get(raw)
    value = entry.get(locale) or entry.get("en") or raw if entry else raw
    if params:
        try:
            return value.format(**params)
        except (KeyError, IndexError):
            return value
    return value


def translate_brand(raw: str | None, locale: Locale, brand: str | None = None, **params) -> str:
    """
    Brand-aware translate. Tries the brand-specific key ``{raw}.{brand}`` first
    (e.g. ``email.customer.signature.home``) and falls back to the generic key.
    """
    if raw and brand:
        brand_key = f"{raw}.{brand}"
        if brand_key in _TRANSLATIONS:
            return translate(brand_key, locale, **params)
    return translate(raw, locale, **params)


def normalize_locale(locale: str | None) -> Locale:
    """Return a locale we know about, falling back to the default."""
    if locale and locale.lower().startswith("en"):
        return "en"
    return DEFAULT_LOCALE
