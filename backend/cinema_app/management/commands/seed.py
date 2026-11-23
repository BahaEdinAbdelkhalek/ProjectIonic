from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from cinema_app.models import Movie, Utilisateur, Favori

FILMS = [
    ('Inception', 'Un voleur de secrets dans les reves.', 2010, 8.4, 27205),
    ('The Matrix', 'La realite est une simulation.', 1999, 8.2, 603),
    ('Dunkirk', 'Des soldats encercles sur la cote.', 2017, 7.5, 505244),
    ('Interstellar', 'Un voyage dans l espace.', 2014, 8.4, 157336),
    ('Parasite', 'Une famille vit dans un sous-sol.', 2019, 8.5, 496243),
    ('Titanic', 'Un jeune homme et une jeune femme.', 1997, 7.9, 597),
    ('Pulp Fiction', 'Histoires de gangsters.', 1994, 8.5, 680),
    ('Forrest Gump', 'Les aventures d un homme simple.', 1994, 8.5, 13),
]

COMPTES = [
    ('admin@cinema.com', 'admin123', 'Benali', 'Yasmine', 22, 'admin', [27205, 603, 505244, 157336, 13]),
    ('nidhal@cinema.com', 'test1234', 'Jelassi', 'Nidhal', 25, 'user', [27205, 603, 505244, 680, 13]),
    ('hanin@cinema.com', 'test1234', 'Sahli', 'Hanin', 23, 'user', [27205, 603, 505244, 680, 13, 496243]),
    ('ahmed@cinema.com', 'test1234', 'Gharbi', 'Ahmed', 30, 'user', [603, 680, 13]),
]


class Command(BaseCommand):
    help = 'Remplit la base avec les donnees de demonstration'

    def handle(self, *args, **options):
        films = {}
        for titre, description, annee, note, tmdb_id in FILMS:
            movie, _ = Movie.objects.get_or_create(
                tmdb_id=tmdb_id,
                defaults={
                    'title': titre,
                    'description': description,
                    'release_year': annee,
                    'note': note,
                    'new': annee >= 2015,
                },
            )
            films[tmdb_id] = movie

        self.stdout.write(str(len(films)) + ' films crees')

        for email, mdp, nom, prenom, age, role, favoris in COMPTES:
            user, cree = User.objects.get_or_create(username=email, defaults={'email': email})
            if cree:
                user.set_password(mdp)
                user.save()

            utilisateur, _ = Utilisateur.objects.get_or_create(
                user=user,
                defaults={'nom': nom, 'prenom': prenom, 'age': age, 'role': role, 'actif': True},
            )

            for tmdb_id in favoris:
                Favori.objects.get_or_create(utilisateur=utilisateur, movie=films[tmdb_id])

        self.stdout.write(str(len(COMPTES)) + ' comptes crees')

        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@cinwatch.local', 'is_staff': True, 'is_superuser': True},
        )
        if not admin.is_staff:
            admin.is_staff = True
            admin.is_superuser = True
            admin.set_password('admin123')
            admin.save()

        self.stdout.write('Admin Django : admin / admin123')
        self.stdout.write('Donnees de demonstration pretes')
