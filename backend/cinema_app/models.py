from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    release_year = models.IntegerField()
    image = models.ImageField(upload_to='movies/', blank=True, null=True)
    new = models.BooleanField(default=False)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    note = models.FloatField(default=0)

    class Meta:
        ordering = ['-release_year']
        verbose_name = 'Film'
        verbose_name_plural = 'Films'

    def __str__(self):
        return self.title

    def est_recent(self):
        return self.release_year >= timezone.now().year - 5

    def nombre_favoris(self):
        return self.favori_set.count()

    def image_preview(self):
        if self.image:
            return '<img src="%s" width="50" height="75" />' % self.image.url
        return '(pas d image)'

    image_preview.short_description = 'Apercu'
    image_preview.allow_tags = True


class Utilisateur(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    age = models.IntegerField()
    photo = models.ImageField(upload_to='photos/', blank=True, null=True)
    role = models.CharField(max_length=10, default='user')
    actif = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return self.prenom + ' ' + self.nom

    def nom_complet(self):
        return self.prenom + ' ' + self.nom

    def nombre_favoris(self):
        return self.favori_set.count()

    def est_admin(self):
        return self.role == 'admin'

    def image_preview(self):
        if self.photo:
            return '<img src="%s" width="50" height="50" />' % self.photo.url
        return '(pas de photo)'

    image_preview.short_description = 'Photo'
    image_preview.allow_tags = True


class Favori(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('utilisateur', 'movie')
        verbose_name = 'Favori'
        verbose_name_plural = 'Favoris'
        ordering = ['-date_ajout']

    def __str__(self):
        return self.utilisateur.prenom + ' - ' + self.movie.title
