import time
from django.utils import timezone


class TempsReponseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        debut = time.time()
        reponse = self.get_response(request)
        duree = round((time.time() - debut) * 1000, 2)
        reponse['X-Temps-Reponse'] = str(duree) + ' ms'
        return reponse


class DerniereVisiteMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            request.session['derniere_visite'] = timezone.now().isoformat()
        return self.get_response(request)
