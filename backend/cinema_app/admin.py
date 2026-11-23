from django.contrib import admin, messages
from django.utils.html import format_html
from .models import Movie, Utilisateur, Favori


def marquer_nouveau(modeladmin, request, queryset):
    nombre = queryset.update(new=True)
    messages.success(request, str(nombre) + ' film(s) marque(s) comme nouveaux')


marquer_nouveau.short_description = 'Marquer comme nouveau'


def desactiver_utilisateurs(modeladmin, request, queryset):
    nombre = queryset.update(actif=False)
    messages.success(request, str(nombre) + ' compte(s) desactive(s)')


desactiver_utilisateurs.short_description = 'Desactiver les comptes selectionnes'


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_year', 'new', 'note', 'nombre_favoris', 'image_preview')
    list_editable = ('new',)
    list_display_links = ('title',)
    search_fields = ('title', 'description')
    list_filter = ('release_year', 'new')
    list_per_page = 10
    readonly_fields = ('image_preview', 'nombre_favoris')
    actions = [marquer_nouveau]

    fieldsets = (
        ('Informations', {
            'fields': ('title', 'description', 'release_year', 'note'),
        }),
        ('Image', {
            'fields': ('image', 'image_preview'),
        }),
        ('Options', {
            'fields': ('new', 'tmdb_id', 'nombre_favoris'),
        }),
    )

    def nombre_favoris(self, obj):
        return obj.nombre_favoris()

    nombre_favoris.short_description = 'Favoris'

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="75" />', obj.image.url)
        return '(pas d image)'

    image_preview.short_description = 'Apercu'


@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    list_display = ('prenom', 'nom', 'age', 'role', 'actif', 'nombre_favoris', 'image_preview')
    list_editable = ('actif',)
    list_display_links = ('prenom',)
    search_fields = ('nom', 'prenom', 'user__email')
    list_filter = ('role', 'actif')
    list_per_page = 10
    readonly_fields = ('image_preview', 'nombre_favoris')
    actions = [desactiver_utilisateurs]

    fieldsets = (
        ('Compte', {
            'fields': ('user', 'role', 'actif'),
        }),
        ('Profil', {
            'fields': ('nom', 'prenom', 'age', 'photo', 'image_preview'),
        }),
    )

    def nombre_favoris(self, obj):
        return obj.nombre_favoris()

    nombre_favoris.short_description = 'Favoris'

    def image_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" width="50" height="50" />', obj.photo.url)
        return '(pas de photo)'

    image_preview.short_description = 'Photo'


@admin.register(Favori)
class FavoriAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'movie', 'date_ajout')
    list_filter = ('utilisateur',)
    search_fields = ('movie__title', 'utilisateur__prenom')
    list_per_page = 10
