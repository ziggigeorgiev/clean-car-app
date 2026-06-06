# app/email_service.py
"""
Lightweight email service with two backends:

1. Resend HTTP API (preferred on hosts that block outbound SMTP, like Render
   free/Starter plans). Requires:
       RESEND_API_KEY    API key from https://resend.com/api-keys
       RESEND_FROM       verified sender, e.g. "CleanCar <noreply@yourdomain>"
                         (falls back to SMTP_FROM, then onboarding@resend.dev)

2. SMTP fallback. Requires:
       SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM,
       SMTP_USE_TLS (default "1"), SMTP_TIMEOUT (default "10")

If neither RESEND_API_KEY nor SMTP_HOST is set, sending is skipped with a
warning (useful for local dev). Sending is always best-effort: failures are
caught and logged so order creation never fails because email failed.
"""

from __future__ import annotations

import json
import logging
import os
import smtplib
import ssl
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from email.message import EmailMessage
from typing import Iterable, Optional
from zoneinfo import ZoneInfo

from .translations import translate as _tr, normalize_locale, DEFAULT_LOCALE

logger = logging.getLogger(__name__)

BERLIN_TZ = ZoneInfo("Europe/Berlin")

# Public base URL for links embedded in emails (cleaner page, etc.). Override
# via env var when running on a different host / locally.
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "https://clean-car-app.onrender.com").rstrip("/")

# Where cleaner notifications go.
CLEANER_NOTIFY_EMAIL = os.getenv("CLEANER_NOTIFY_EMAIL", "info@cleen.de")

# Duration of a booking slot (must match BOOKING_DURATION_MINUTES on the
# mobile side; used to compute calendar event end times).
BOOKING_DURATION_MINUTES = int(os.getenv("BOOKING_DURATION_MINUTES", "90"))


def _is_configured() -> bool:
    return bool(os.getenv("RESEND_API_KEY") or os.getenv("SMTP_HOST"))


def _format_berlin(dt: Optional[datetime]) -> str:
    if dt is None:
        return "-"
    if dt.tzinfo is None:
        # Treat naive timestamps as UTC, matching the timestamptz column.
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    local = dt.astimezone(BERLIN_TZ)
    return local.strftime("%A, %B %d, %Y at %H:%M")


def _send_via_resend(to: str, from_addr: str, subject: str, body_text: str, body_html: Optional[str]) -> bool:
    """Send via Resend HTTP API. Returns True on success."""
    api_key = os.environ["RESEND_API_KEY"]
    payload = {
        "from": from_addr,
        "to": [to],
        "subject": subject,
        "text": body_text,
    }
    if body_html:
        payload["html"] = body_html

    req = urllib.request.Request(
        url="https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # Cloudflare in front of api.resend.com blocks the default
            # Python-urllib UA (error 1010); send a normal-looking UA.
            "User-Agent": "clean-car-app/1.0 (+resend)",
            "Accept": "application/json",
        },
        method="POST",
    )
    print(f"[email] resend POST from={from_addr} to={to}", flush=True)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            body = resp.read().decode("utf-8", errors="replace")
        print(f"[email] resend status={status} body={body[:200]}", flush=True)
        return 200 <= status < 300
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace") if e.fp else ""
        logger.error("Resend HTTPError %s: %s", e.code, err_body)
        print(f"[email] resend HTTPError {e.code}: {err_body[:300]}", flush=True)
        return False


def _send_via_smtp(to: str, from_addr: str, subject: str, body_text: str, body_html: Optional[str]) -> bool:
    """Send via SMTP (smtplib). Returns True on success."""
    host = os.environ["SMTP_HOST"]
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "")
    password = os.getenv("SMTP_PASSWORD", "")
    use_tls = os.getenv("SMTP_USE_TLS", "1") == "1"
    timeout = int(os.getenv("SMTP_TIMEOUT", "10"))

    msg = EmailMessage()
    msg["From"] = from_addr
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")

    print(
        f"[email] smtp connecting host={host} port={port} use_tls={use_tls} from={from_addr} to={to}",
        flush=True,
    )
    if use_tls:
        with smtplib.SMTP(host, port, timeout=timeout) as smtp:
            smtp.ehlo()
            smtp.starttls(context=ssl.create_default_context())
            smtp.ehlo()
            if user:
                smtp.login(user, password)
            smtp.send_message(msg)
    else:
        with smtplib.SMTP_SSL(host, port, timeout=timeout, context=ssl.create_default_context()) as smtp:
            if user:
                smtp.login(user, password)
            smtp.send_message(msg)
    return True


def send_email(to: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
    """Send an email to ``to`` and return True on success, False otherwise."""
    use_resend = bool(os.getenv("RESEND_API_KEY"))
    use_smtp = bool(os.getenv("SMTP_HOST"))
    print(
        f"[email] send_email start to={to!r} resend={use_resend} smtp={use_smtp}",
        flush=True,
    )
    if not (use_resend or use_smtp):
        logger.warning("Email not configured (no RESEND_API_KEY or SMTP_HOST); skipping email to %s", to)
        print(f"[email] SKIPPED — neither RESEND_API_KEY nor SMTP_HOST is set", flush=True)
        return False
    if not to:
        logger.warning("Empty recipient; skipping email")
        print(f"[email] SKIPPED — empty recipient", flush=True)
        return False

    from_addr = (
        os.getenv("RESEND_FROM")
        or os.getenv("SMTP_FROM")
        or os.getenv("SMTP_USER")
        or "onboarding@resend.dev"
    )

    logger.info(
        "Sending email backend=%s from=%s to=%s subject=%r",
        "resend" if use_resend else "smtp", from_addr, to, subject,
    )

    try:
        if use_resend:
            ok = _send_via_resend(to, from_addr, subject, body_text, body_html)
        else:
            ok = _send_via_smtp(to, from_addr, subject, body_text, body_html)
        if ok:
            logger.info("Sent email to %s subject=%r", to, subject)
            print(f"[email] SENT to={to}", flush=True)
        else:
            print(f"[email] FAILED (see prior log) to={to}", flush=True)
        return ok
    except Exception as e:  # noqa: BLE001 — best-effort, never raise
        logger.exception("Failed to send email to %s: %s", to, e)
        print(f"[email] FAILED to={to} error={type(e).__name__}: {e}", flush=True)
        return False


def _to_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=ZoneInfo("UTC"))
    return dt.astimezone(ZoneInfo("UTC"))


def _gcal_link(title: str, start: datetime, end: datetime, details: str, location: str) -> str:
    """
    Build a Google Calendar "Render Event" URL. Opening it in a browser pre-
    fills the event creation form so the cleaner can save with one click.
    """
    start_utc = _to_utc(start).strftime("%Y%m%dT%H%M%SZ")
    end_utc = _to_utc(end).strftime("%Y%m%dT%H%M%SZ")
    params = {
        "action": "TEMPLATE",
        "text": title,
        "dates": f"{start_utc}/{end_utc}",
        "details": details,
        "location": location,
    }
    return "https://calendar.google.com/calendar/render?" + urllib.parse.urlencode(params)


def send_booking_confirmation(
    to: str,
    order_id: int,
    plate_number: str,
    phone_number: str,
    address: str,
    availability_time: Optional[datetime],
    service_names: Iterable[str],
    total_price: Optional[float] = None,
    currency: str = "EUR",
    locale: str = DEFAULT_LOCALE,
) -> bool:
    """Build and send a booking confirmation email."""
    loc = normalize_locale(locale)
    when = _format_berlin(availability_time)
    services_list = [_tr(s, loc) for s in service_names if s]
    services_text = "\n".join(f"  • {s}" for s in services_list) or "  • —"
    services_html = "".join(f"<li>{s}</li>" for s in services_list) or "<li>—</li>"

    total_line_txt = ""
    total_line_html = ""
    if total_price is not None:
        total_line_txt = f"\nTotal: {total_price:.2f} {currency}\n"
        total_line_html = f"<p><strong>Total:</strong> {total_price:.2f} {currency}</p>"

    subject = f"Booking confirmed — Order #{order_id}"

    body_text = (
        f"Hi,\n\n"
        f"Thanks for your booking! Here are your details:\n\n"
        f"Order:        #{order_id}\n"
        f"When:         {when} (Europe/Berlin)\n"
        f"Where:        {address or '-'}\n"
        f"Vehicle:      {plate_number or '-'}\n"
        f"Phone:        {phone_number or '-'}\n\n"
        f"Services:\n{services_text}\n"
        f"{total_line_txt}\n"
        f"We will be in touch shortly to confirm the cleaner.\n\n"
        f"— CleanCar"
    )

    body_html = f"""\
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#0EA5A4;margin:0 0 12px 0;">Booking confirmed</h2>
  <p>Thanks for your booking — here are your details:</p>
  <table style="border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:4px 12px 4px 0;color:#666;">Order</td><td>#{order_id}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666;">When</td><td>{when} <span style="color:#888;">(Europe/Berlin)</span></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666;">Where</td><td>{address or '-'}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666;">Vehicle</td><td>{plate_number or '-'}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td>{phone_number or '-'}</td></tr>
  </table>
  <p style="margin:8px 0 4px 0;color:#666;">Services</p>
  <ul style="margin:0 0 16px 18px;padding:0;">{services_html}</ul>
  {total_line_html}
  <p>We will be in touch shortly to confirm your cleaner.</p>
  <p style="color:#888;font-size:13px;margin-top:24px;">— CleanCar</p>
</body>
</html>
"""

    return send_email(to=to, subject=subject, body_text=body_text, body_html=body_html)


def send_cleaner_notification(
    order_id: int,
    order_uuid: str,
    plate_number: str,
    phone_number: str,
    address: str,
    availability_time: Optional[datetime],
    service_names: Iterable[str],
    customer_email: Optional[str] = None,
    total_price: Optional[float] = None,
    currency: str = "EUR",
    to: Optional[str] = None,
    locale: str = DEFAULT_LOCALE,
) -> bool:
    """
    Notify the cleaning team about a new booking. Includes a deep link to the
    cleaner page for this order and a one-click "Add to Google Calendar" button.
    """
    recipient = to or CLEANER_NOTIFY_EMAIL
    loc = normalize_locale(locale)
    when_label = _format_berlin(availability_time)
    services_list = [_tr(s, loc) for s in service_names if s]
    services_text = "\n".join(f"  • {s}" for s in services_list) or "  • —"
    services_html = "".join(f"<li>{s}</li>" for s in services_list) or "<li>—</li>"

    total_line_txt = ""
    total_line_html = ""
    if total_price is not None:
        total_line_txt = f"\nTotal: {total_price:.2f} {currency}\n"
        total_line_html = f"<p><strong>Total:</strong> {total_price:.2f} {currency}</p>"

    cleaner_url = f"{PUBLIC_BASE_URL}/cleaner/orders/{order_uuid}"

    # Build the Google Calendar add-event link. Falls back to "no time" if the
    # booking somehow lacks an availability_time.
    if availability_time is not None:
        start_dt = availability_time
        end_dt = (
            start_dt.replace(tzinfo=ZoneInfo("UTC")) if start_dt.tzinfo is None else start_dt
        ) + timedelta(minutes=BOOKING_DURATION_MINUTES)
        gcal_title = f"Car cleaning — {plate_number or 'order'}"
        gcal_details = (
            f"CleanCar order #{order_id}\\n"
            f"Plate: {plate_number}\\n"
            f"Phone: {phone_number}\\n"
            f"Services: {', '.join(services_list) or '—'}\\n\\n"
            f"Manage: {cleaner_url}"
        )
        gcal_url = _gcal_link(
            title=gcal_title,
            start=start_dt,
            end=end_dt,
            details=gcal_details,
            location=address or "",
        )
    else:
        gcal_url = None

    subject = f"[CleanCar] New booking — Order #{order_id} @ {when_label}"

    body_text_lines = [
        "New booking for CleanCar:",
        "",
        f"Order:    #{order_id}",
        f"When:     {when_label} (Europe/Berlin)",
        f"Where:    {address or '-'}",
        f"Vehicle:  {plate_number or '-'}",
        f"Phone:    {phone_number or '-'}",
    ]
    if customer_email:
        body_text_lines.append(f"Email:    {customer_email}")
    body_text_lines += [
        "",
        "Services:",
        services_text,
        total_line_txt.rstrip("\n") if total_line_txt else "",
        "",
        f"Open booking: {cleaner_url}",
    ]
    if gcal_url:
        body_text_lines.append(f"Add to Google Calendar: {gcal_url}")
    body_text = "\n".join([l for l in body_text_lines if l is not None])

    gcal_button_html = (
        f'<a href="{gcal_url}" target="_blank" '
        f'style="display:inline-block;padding:10px 16px;background:#1a73e8;color:#fff;'
        f'border-radius:6px;text-decoration:none;font-weight:600;margin-right:8px;">'
        f'Add to Google Calendar</a>'
    ) if gcal_url else ""

    customer_row_html = (
        f'<tr><td style="padding:4px 12px 4px 0;color:#666;">Customer email</td>'
        f'<td><a href="mailto:{customer_email}">{customer_email}</a></td></tr>'
    ) if customer_email else ""

    body_html = f"""\
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#0EA5A4;margin:0 0 12px 0;">New booking — Order #{order_id}</h2>
  <table style="border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:4px 12px 4px 0;color:#666;">When</td><td>{when_label} <span style="color:#888;">(Europe/Berlin)</span></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666;">Where</td><td>{address or '-'}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666;">Vehicle</td><td>{plate_number or '-'}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td><a href="tel:{phone_number}">{phone_number or '-'}</a></td></tr>
    {customer_row_html}
  </table>
  <p style="margin:8px 0 4px 0;color:#666;">Services</p>
  <ul style="margin:0 0 16px 18px;padding:0;">{services_html}</ul>
  {total_line_html}
  <div style="margin-top:20px;">
    {gcal_button_html}
    <a href="{cleaner_url}" target="_blank" style="display:inline-block;padding:10px 16px;background:#0EA5A4;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Open booking</a>
  </div>
  <p style="color:#888;font-size:12px;margin-top:24px;">CleanCar internal notification.</p>
</body>
</html>
"""

    return send_email(to=recipient, subject=subject, body_text=body_text, body_html=body_html)
