from django.contrib import admin
from .models import Movie, Utilisateur, Favori


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_year', 'new', 'note', 'image_preview')
    list_editable = ('new',)
    list_display_links = ('title',)
    search_fields = ('title', 'description')
    list_filter = ('release_year', 'new')
    list_per_page = 10
    readonly_fields = ('image_preview',)
    fields = ('title', 'description', 'release_year', 'image', 'image_preview', 'new', 'note', 'tmdb_id')


@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    list_display = ('prenom', 'nom', 'age', 'role', 'actif', 'image_preview')
    list_editable = ('actif',)
    list_display_links = ('prenom',)
    search_fields = ('nom', 'prenom', 'user__email')
    list_filter = ('role', 'actif')
    list_per_page = 10
    readonly_fields = ('image_preview',)
    fields = ('user', 'nom', 'prenom', 'age', 'photo', 'image_preview', 'role', 'actif')


@admin.register(Favori)
class FavoriAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'movie', 'date_ajout')
    list_filter = ('utilisateur',)
    search_fields = ('movie__title', 'utilisateur__prenom')
    list_per_page = 10
