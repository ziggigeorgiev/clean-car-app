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


def normalize_locale(locale: str | None) -> Locale:
    """Return a locale we know about, falling back to the default."""
    if locale and locale.lower().startswith("en"):
        return "en"
    return DEFAULT_LOCALE
