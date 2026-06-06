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
}


def translate(raw: str | None, locale: Locale = DEFAULT_LOCALE) -> str:
    """
    Translate a single key. If ``raw`` isn't itself a known key (e.g. a legacy
    row or a typo) it is returned verbatim — same safe-fallback behaviour as
    the mobile app.
    """
    if not raw:
        return ""
    entry = _TRANSLATIONS.get(raw)
    if not entry:
        return raw
    return entry.get(locale) or entry.get("en") or raw


def normalize_locale(locale: str | None) -> Locale:
    """Return a locale we know about, falling back to the default."""
    if locale and locale.lower().startswith("en"):
        return "en"
    return DEFAULT_LOCALE
