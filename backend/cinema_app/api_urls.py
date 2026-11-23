from django.urls import path
from . import api_views

urlpatterns = [
    path('inscription', api_views.inscription),
    path('connexion', api_views.connexion),
    path('moi', api_views.moi),
    path('films', api_views.films),
    path('films/<int:pk>', api_views.film_detail),
    path('favoris', api_views.favoris),
    path('favoris/<int:film_id>', api_views.basculer_favori),
    path('matching', api_views.matching),
    path('admin/films', api_views.admin_films),
    path('admin/utilisateurs', api_views.admin_utilisateurs),
    path('admin/utilisateurs/<int:pk>/desactiver', api_views.desactiver_utilisateur),
    path('admin/utilisateurs/<int:pk>/activer', api_views.activer_utilisateur),
]
