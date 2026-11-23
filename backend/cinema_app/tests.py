from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse

from .models import Movie, Utilisateur, Favori


def profil_de(user, **kwargs):
    utilisateur = user.utilisateur
    for cle, valeur in kwargs.items():
        setattr(utilisateur, cle, valeur)
    utilisateur.save()
    return utilisateur


class MovieModelTest(TestCase):
    def test_creation_film(self):
        film = Movie.objects.create(
            title='Inception',
            description='Un film sur les reves',
            release_year=2010,
            note=8.4,
        )
        self.assertEqual(film.title, 'Inception')
        self.assertEqual(str(film), 'Inception')

    def test_est_recent(self):
        film_recent = Movie.objects.create(
            title='Recent', description='', release_year=2025,
        )
        film_ancien = Movie.objects.create(
            title='Ancien', description='', release_year=1990,
        )
        self.assertTrue(film_recent.est_recent())
        self.assertFalse(film_ancien.est_recent())

    def test_nombre_favoris(self):
        film = Movie.objects.create(title='Matrix', description='', release_year=1999)
        user = User.objects.create(username='test')
        utilisateur = profil_de(user, nom='Test', prenom='User', age=20)
        Favori.objects.create(utilisateur=utilisateur, movie=film)
        self.assertEqual(film.nombre_favoris(), 1)
        self.assertEqual(utilisateur.nombre_favoris(), 1)


class UtilisateurModelTest(TestCase):
    def test_nom_complet(self):
        user = User.objects.create(username='u')
        utilisateur = profil_de(user, nom='Jelassi', prenom='Nidhal', age=25)
        self.assertEqual(utilisateur.nom_complet(), 'Nidhal Jelassi')

    def test_est_admin(self):
        user = User.objects.create(username='admin2')
        utilisateur = profil_de(user, nom='Benali', prenom='Yasmine', age=22, role='admin')
        self.assertTrue(utilisateur.est_admin())


class VueTest(TestCase):
    def setUp(self):
        self.client = Client()
        Movie.objects.create(title='Film A', description='', release_year=2020)
        Movie.objects.create(title='Film B', description='', release_year=2021, new=True)

    def test_liste_films(self):
        reponse = self.client.get(reverse('movie_list'))
        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(len(reponse.context['movies']), 2)

    def test_filtrage_nouveaux(self):
        reponse = self.client.get(reverse('movie_list') + '?nouveaux=1')
        self.assertEqual(len(reponse.context['movies']), 1)

    def test_detail_film(self):
        film = Movie.objects.first()
        reponse = self.client.get(reverse('movie_detail', args=[film.id]))
        self.assertEqual(reponse.status_code, 200)


class ApiTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_api_films_publique(self):
        Movie.objects.create(title='Film API', description='', release_year=2020)
        reponse = self.client.get('/api/films')
        self.assertEqual(reponse.status_code, 200)

    def test_connexion_mauvais_mdp(self):
        user = User.objects.create_user(username='x@test.com', password='bonmdp')
        profil_de(user, nom='Test', prenom='Test', age=20)
        reponse = self.client.post(
            '/api/connexion',
            {'email': 'x@test.com', 'motDePasse': 'mauvais'},
            content_type='application/json',
        )
        self.assertEqual(reponse.status_code, 401)

    def test_admin_refuse_simple_user(self):
        user = User.objects.create_user(username='u@test.com', password='mdp')
        profil_de(user, nom='U', prenom='U', age=20, role='user')
        self.client.force_login(user)
        reponse = self.client.get('/api/admin/utilisateurs')
        self.assertEqual(reponse.status_code, 403)


class SignalTest(TestCase):
    def test_profil_cree_automatiquement(self):
        user = User.objects.create(username='signal@test.com')
        self.assertTrue(hasattr(user, 'utilisateur'))
