from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    DRF's SessionAuthentication enforces CSRF on every request.
    During development with a cross-origin React frontend this
    blocks every authenticated call. This subclass skips the
    CSRF check while still using Django's session/cookie auth.
    """

    def enforce_csrf(self, request):
        return  # skip CSRF — we rely on CORS_ALLOWED_ORIGINS instead
