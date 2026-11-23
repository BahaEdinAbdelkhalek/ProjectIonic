from rest_framework import serializers
from .models import Movie, Utilisateur


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'release_year', 'image', 'new', 'note', 'tmdb_id']

    def to_representation(self, instance):
        request = self.context.get('request')

        image = ''
        if instance.image and request:
            image = request.build_absolute_uri(instance.image.url)

        return {
            'id': instance.id,
            'titre': instance.title,
            'image': image,
            'resume': instance.description,
            'annee': instance.release_year,
            'note': instance.note,
        }


class UtilisateurSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Utilisateur
        fields = ['id', 'nom', 'prenom', 'age', 'photo', 'email', 'role', 'actif']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        if instance.photo and request:
            data['photo'] = request.build_absolute_uri(instance.photo.url)
        else:
            data['photo'] = ''

        return data
