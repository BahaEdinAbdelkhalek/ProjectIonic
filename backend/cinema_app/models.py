from django.db import models
from django.contrib.auth.models import User


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

    def __str__(self):
        return self.title

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

    def __str__(self):
        return self.prenom + ' ' + self.nom

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

    def __str__(self):
        return self.utilisateur.prenom + ' - ' + self.movie.title
