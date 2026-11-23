from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('', views.MovieListView.as_view(), name='movie_list'),
    path('film/<int:pk>', views.MovieDetailView.as_view(), name='movie_detail'),
    path('film/ajouter', views.MovieCreateView.as_view(), name='movie_create'),
    path('film/<int:pk>/modifier', views.MovieUpdateView.as_view(), name='movie_update'),
    path('film/<int:pk>/supprimer', views.MovieDeleteView.as_view(), name='movie_delete'),
]
