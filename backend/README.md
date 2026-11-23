# CinWatch — Backend Django

Backend conforme aux TPs du cours Django du professeur Nizar MAATOUG.

## Ce qui correspond aux TPs

| TP du cours | Ce que j'ai fait ici |
|---|---|
| **TP-CBV-CRUD-v2** (Author + BlogPost, CBV) | `Movie` + `Utilisateur` + `Favori` avec **CBV** : `ListView`, `DetailView`, `CreateView`, `UpdateView` dans `views.py` |
| **TP-Formulaires** (ModelForm, crispy-forms) | `MovieForm` et `UtilisateurForm` qui héritent de `forms.ModelForm`, avec `FormHelper` et `{{ form\|crispy }}` |
| **Tp image et admin** (Movie, ImageField, filtrage, Jazzmin) | `Movie` avec `ImageField`, `MEDIA_ROOT/movies`, **filtrage sans redirection** en JS, admin `@admin.register` avec `list_display`, `list_editable`, `search_fields`, `list_filter`, `list_per_page = 10`, `image_preview`, `readonly_fields`, et **Jazzmin** |
| **Cours : REST API / DRF** | `api_views.py` avec `@api_view`, `TokenAuthentication`, sérialiseurs |
| **Cours : Authentification, permissions** | Connexion/inscription avec mot de passe haché, `IsAuthenticated`, rôle `admin` vérifié côté serveur |
| **Cours : Sessions et Middlewares** | `middleware.py` : header `X-Temps-Reponse`, date de dernière visite et filtre stockés en session |
| **Cours : Django Signals** | `signals.py` : profil créé automatiquement à la création d'un `User`, logs des ajouts/retraits de favoris |
| **Cours : groupes et permissions** | Groupe « Administrateurs » avec les permissions sur `Movie`, `LoginRequiredMixin` sur les vues de modification |
| **TP-CBV-CRUD : CRUD complet** | `DeleteView` et template de confirmation de suppression |

## Structure

```
backend/
  manage.py
  requirements.txt
  .venv/                          environnement virtuel
  cinwatch_project/
    settings.py                   INSTALLED_APPS, MEDIA_ROOT, DRF, CORS, Jazzmin
    urls.py                       /admin/, /api/, / (pages HTML)
  cinema_app/
    models.py                     Movie, Utilisateur, Favori
    forms.py                      ModelForm + crispy
    views.py                      CBV (liste, détail, ajout, modification, suppression)
    signals.py                    signaux Django
    middleware.py                 middlewares personnalisés
    tests.py                      12 tests unitaires
    urls.py                       URLs des pages HTML
    api_views.py                  endpoints REST (DRF)
    api_urls.py                   URLs de l'API
    serializers.py                MovieSerializer, UtilisateurSerializer
    admin.py                      configuration admin + Jazzmin
    management/commands/seed.py   données de démonstration
    migrations/0001_initial.py
  templates/
    base.html
    movies/movie_list.html        avec filtrage JS
    movies/movie_detail.html
    movies/movie_form.html
  media/                          images uploadées (ignoré par git)
  db.sqlite3                      base de données (ignorée par git)
```

## Démarrage

```
E:\projetIonic\start-django.cmd
```

Le script crée le venv, installe les dépendances, applique les migrations et lance le serveur.

**URLs :**
- Interface HTML : http://localhost:8000/
- Admin Jazzmin : http://localhost:8000/admin/ (**admin / admin123**)
- API : http://localhost:8000/api/films

## Comptes de démonstration

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@cinema.com` | `admin123` | admin (côté application) |
| `nidhal@cinema.com` | `test1234` | utilisateur |
| `hanin@cinema.com` | `test1234` | utilisateur |
| `ahmed@cinema.com` | `test1234` | utilisateur |

Et `admin / admin123` pour le panneau d'administration Django.

## API REST

| Méthode | URL | Accès | Rôle |
|---|---|---|---|
| POST | `/api/inscription` | public | créer un compte |
| POST | `/api/connexion` | public | obtenir un token |
| GET | `/api/moi` | connecté | profil courant |
| GET | `/api/films` | public | liste des films |
| GET | `/api/films/<id>` | public | détail d'un film |
| GET | `/api/favoris` | connecté | ma playlist |
| POST | `/api/favoris/<id>` | connecté | ajouter/retirer |
| GET | `/api/matching` | connecté | correspondances > 75 % |
| GET/POST | `/api/admin/films` | admin | gérer les films |
| GET | `/api/admin/utilisateurs` | admin | liste des comptes |
| POST | `/api/admin/utilisateurs/<id>/desactiver` | admin | désactiver |
| POST | `/api/admin/utilisateurs/<id>/activer` | admin | réactiver |

**Authentification** : envoyer `Authorization: Token <token>` dans le header.

## Le matching

Formule de **Dice** (symétrique) : `2 × films en commun / (taille A + taille B) × 100`.
Seuls les taux **strictement supérieurs à 75 %** sont renvoyés.

## Commandes utiles

```
.venv\Scripts\python.exe manage.py check
.venv\Scripts\python.exe manage.py makemigrations
.venv\Scripts\python.exe manage.py migrate
.venv\Scripts\python.exe manage.py seed
.venv\Scripts\python.exe manage.py runserver 8000
.venv\Scripts\python.exe -m pip freeze > requirements.txt
```
