import base64
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import Movie, Utilisateur, Favori
from .serializers import MovieSerializer, UtilisateurSerializer


SEUIL = 75


def get_utilisateur(user):
    try:
        return Utilisateur.objects.get(user=user)
    except Utilisateur.DoesNotExist:
        return None


def enregistrer_photo(utilisateur, photo):
    if not photo or not photo.startswith('data:image'):
        return

    try:
        entete, donnees = photo.split(',', 1)
        extension = 'png' if 'png' in entete else 'jpg'
        binaire = base64.b64decode(donnees)
        utilisateur.photo.save(
            'photo_%s.%s' % (utilisateur.id, extension),
            ContentFile(binaire),
            save=True,
        )
    except Exception:
        pass


def calculer_taux(a, b):
    if len(a) == 0 or len(b) == 0:
        return 0
    ids_a = set(x['id'] for x in a)
    ids_b = set(x['id'] for x in b)
    communs = len(ids_a & ids_b)
    return round((communs / (len(a) + len(b))) * 200)


@api_view(['POST'])
@permission_classes([AllowAny])
def inscription(request):
    data = request.data
    email = data.get('email', '')
    mot_de_passe = data.get('motDePasse', '')

    if User.objects.filter(username=email).exists():
        return Response({'message': 'Cet email est deja utilise.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=email, email=email, password=mot_de_passe)
    utilisateur = Utilisateur.objects.create(
        user=user,
        nom=data.get('nom', ''),
        prenom=data.get('prenom', ''),
        age=data.get('age', 0),
        role='user',
        actif=True,
    )

    enregistrer_photo(utilisateur, data.get('photo', ''))

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'utilisateur': UtilisateurSerializer(utilisateur, context={'request': request}).data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def connexion(request):
    email = request.data.get('email', '')
    mot_de_passe = request.data.get('motDePasse', '')

    user = User.objects.filter(username=email).first()

    if user is None or not user.check_password(mot_de_passe):
        return Response({'message': 'Email ou mot de passe incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)

    utilisateur = get_utilisateur(user)

    if utilisateur is None or not utilisateur.actif:
        return Response({'message': 'Ce compte a ete desactive.'}, status=status.HTTP_403_FORBIDDEN)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'utilisateur': UtilisateurSerializer(utilisateur, context={'request': request}).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def films(request):
    queryset = Movie.objects.all()
    recherche = request.query_params.get('query', '')
    if recherche:
        queryset = queryset.filter(Q(title__icontains=recherche) | Q(description__icontains=recherche))
    serializer = MovieSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def film_detail(request, pk):
    try:
        film = Movie.objects.get(pk=pk)
    except Movie.DoesNotExist:
        return Response({'message': 'Film introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(MovieSerializer(film, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def moi(request):
    utilisateur = get_utilisateur(request.user)
    if utilisateur is None:
        return Response({'message': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(UtilisateurSerializer(utilisateur, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favoris(request):
    utilisateur = get_utilisateur(request.user)
    if utilisateur is None:
        return Response({'message': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    films = [Favori.objects.filter(utilisateur=utilisateur, movie=f).first() for f in Movie.objects.all()]
    films = [f for f in films if f is not None]
    serializer = MovieSerializer([f.movie for f in films], many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def basculer_favori(request, film_id):
    utilisateur = get_utilisateur(request.user)
    if utilisateur is None:
        return Response({'message': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        film = Movie.objects.get(pk=film_id)
    except Movie.DoesNotExist:
        return Response({'message': 'Film introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    favori = Favori.objects.filter(utilisateur=utilisateur, movie=film).first()

    if favori:
        favori.delete()
        return Response({'favori': False})

    Favori.objects.create(utilisateur=utilisateur, movie=film)
    return Response({'favori': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def matching(request):
    utilisateur = get_utilisateur(request.user)
    if utilisateur is None:
        return Response({'message': 'Profil introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    mes_films = MovieSerializer(
        [f.movie for f in Favori.objects.filter(utilisateur=utilisateur)],
        many=True,
        context={'request': request},
    ).data

    resultats = []

    for autre in Utilisateur.objects.filter(actif=True).exclude(id=utilisateur.id):
        ses_films = MovieSerializer(
            [f.movie for f in Favori.objects.filter(utilisateur=autre)],
            many=True,
            context={'request': request},
        ).data

        taux = calculer_taux(mes_films, ses_films)

        if taux > SEUIL:
            ids_a = set(x['id'] for x in mes_films)
            communs = [x for x in ses_films if x['id'] in ids_a]
            resultats.append({
                'utilisateur': UtilisateurSerializer(autre, context={'request': request}).data,
                'taux': taux,
                'filmsCommuns': communs,
            })

    resultats.sort(key=lambda x: x['taux'], reverse=True)
    return Response(resultats)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_films(request):
    utilisateur = get_utilisateur(request.user)

    if utilisateur is None or utilisateur.role != 'admin':
        return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'POST':
        data = request.data
        film = Movie.objects.create(
            title=data.get('titre', ''),
            description=data.get('resume', ''),
            release_year=data.get('annee', 0),
            note=data.get('note', 0),
        )
        return Response(MovieSerializer(film, context={'request': request}).data, status=status.HTTP_201_CREATED)

    films = Movie.objects.all()
    return Response(MovieSerializer(films, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_utilisateurs(request):
    utilisateur = get_utilisateur(request.user)

    if utilisateur is None or utilisateur.role != 'admin':
        return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)

    utilisateurs = Utilisateur.objects.all()
    return Response(UtilisateurSerializer(utilisateurs, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activer_utilisateur(request, pk):
    utilisateur = get_utilisateur(request.user)

    if utilisateur is None or utilisateur.role != 'admin':
        return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        cible = Utilisateur.objects.get(pk=pk)
    except Utilisateur.DoesNotExist:
        return Response({'message': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    cible.actif = True
    cible.save()

    return Response({'message': 'Compte active.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def desactiver_utilisateur(request, pk):
    utilisateur = get_utilisateur(request.user)

    if utilisateur is None or utilisateur.role != 'admin':
        return Response({'message': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        cible = Utilisateur.objects.get(pk=pk)
    except Utilisateur.DoesNotExist:
        return Response({'message': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    cible.actif = False
    cible.save()

    return Response({'message': 'Compte desactive.'})
