# app/email_service.py
"""
Lightweight SMTP-based email service.

Configuration is read from environment variables so credentials never live in
code:

    SMTP_HOST       e.g. smtp.gmail.com
    SMTP_PORT       e.g. 587  (default 587 for STARTTLS)
    SMTP_USER       login username (often the from address)
    SMTP_PASSWORD   password or app password
    SMTP_FROM       From: header, defaults to SMTP_USER
    SMTP_USE_TLS    "1" (default) for STARTTLS on 587, "0" for SSL on 465
    SMTP_TIMEOUT    seconds, default 10

If SMTP_HOST is not configured, the service logs a warning and does nothing
(useful for local development). Sending is best-effort: failures are caught
and logged so order creation never fails because email failed.
"""

from __future__ import annotations

import logging
import os
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage
from typing import Iterable, Optional
from zoneinfo import ZoneInfo

logger = logging.getLogger(__name__)

BERLIN_TZ = ZoneInfo("Europe/Berlin")


def _is_configured() -> bool:
    return bool(os.getenv("SMTP_HOST"))


def _format_berlin(dt: Optional[datetime]) -> str:
    if dt is None:
        return "-"
    if dt.tzinfo is None:
        # Treat naive timestamps as UTC, matching the timestamptz column.
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    local = dt.astimezone(BERLIN_TZ)
    return local.strftime("%A, %B %d, %Y at %H:%M")


def send_email(to: str, subject: str, body_text: str, body_html: Optional[str] = None) -> bool:
    """Send an email to ``to`` and return True on success, False otherwise."""
    if not _is_configured():
        logger.warning("SMTP not configured; skipping email to %s", to)
        return False
    if not to:
        logger.warning("Empty recipient; skipping email")
        return False

    host = os.environ["SMTP_HOST"]
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "")
    password = os.getenv("SMTP_PASSWORD", "")
    from_addr = os.getenv("SMTP_FROM", user or "no-reply@example.com")
    use_tls = os.getenv("SMTP_USE_TLS", "1") == "1"
    timeout = int(os.getenv("SMTP_TIMEOUT", "10"))

    msg = EmailMessage()
    msg["From"] = from_addr
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")

    try:
        if use_tls:
            with smtplib.SMTP(host, port, timeout=timeout) as smtp:
                smtp.ehlo()
                smtp.starttls(context=ssl.create_default_context())
                smtp.ehlo()
                if user:
                    smtp.login(user, password)
                smtp.send_message(msg)
        else:
            # SSL on connect (typically port 465)
            with smtplib.SMTP_SSL(host, port, timeout=timeout, context=ssl.create_default_context()) as smtp:
                if user:
                    smtp.login(user, password)
                smtp.send_message(msg)
        logger.info("Sent email to %s subject=%r", to, subject)
        return True
    except Exception as e:  # noqa: BLE001 — best-effort, never raise
        logger.exception("Failed to send email to %s: %s", to, e)
        return False


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
) -> bool:
    """Build and send a booking confirmation email."""
    when = _format_berlin(availability_time)
    services_list = [s for s in service_names if s]
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
