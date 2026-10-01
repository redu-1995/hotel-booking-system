import hashlib
import hmac
import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings


class ChapaError(Exception):
    pass


def _request(method, path, payload=None):
    if not settings.CHAPA_SECRET_KEY:
        raise ChapaError("Chapa payments are not configured.")

    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        f"{settings.CHAPA_API_BASE_URL}{path}",
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise ChapaError("Chapa could not process the request.") from exc

    if not isinstance(result, dict):
        raise ChapaError("Chapa returned an invalid response.")
    return result


def initialize_transaction(payment, *, callback_url, return_url):
    guest_name = payment.booking.guest.full_name.strip().split()
    first_name = guest_name[0] if guest_name else "Guest"
    last_name = " ".join(guest_name[1:]) or first_name
    guest_email = payment.booking.guest.email
    if not guest_email:
        raise ChapaError("A guest email is required to start Chapa checkout.")

    response = _request(
        "POST",
        "/transaction/initialize",
        {
            "amount": format(payment.amount, ".2f"),
            "currency": "ETB",
            "email": guest_email,
            "first_name": first_name,
            "last_name": last_name,
            "tx_ref": payment.transaction_reference,
            "callback_url": callback_url,
            "return_url": return_url,
            "customization": {
                "title": "Grandview Hotel",
                "description": f"Booking {payment.booking.booking_reference}",
            },
        },
    )
    checkout_url = response.get("data", {}).get("checkout_url")
    if response.get("status") != "success" or not checkout_url:
        raise ChapaError("Chapa did not return a checkout link.")
    return checkout_url


def verify_transaction(transaction_reference):
    return _request(
        "GET",
        f"/transaction/verify/{quote(transaction_reference, safe='')}",
    )


def verify_webhook_signature(raw_body, headers):
    secret = settings.CHAPA_WEBHOOK_SECRET
    if not secret:
        return False

    try:
        payload = json.loads(raw_body)
    except (TypeError, ValueError):
        return False

    compact_body = json.dumps(
        payload,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")
    signatures = (
        headers.get("x-chapa-signature", ""),
        headers.get("chapa-signature", ""),
    )
    expected_payload_signatures = (
        hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest(),
        hmac.new(secret.encode("utf-8"), compact_body, hashlib.sha256).hexdigest(),
    )
    expected_secret_signature = hmac.new(
        secret.encode("utf-8"),
        secret.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return any(
        hmac.compare_digest(signature, expected)
        for signature in signatures
        for expected in (*expected_payload_signatures, expected_secret_signature)
        if signature
    )