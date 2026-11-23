from django.urls import path
from . import views

urlpatterns = [
    path('', views.MovieListView.as_view(), name='movie_list'),
    path('film/<int:pk>', views.MovieDetailView.as_view(), name='movie_detail'),
    path('film/ajouter', views.MovieCreateView.as_view(), name='movie_create'),
    path('film/<int:pk>/modifier', views.MovieUpdateView.as_view(), name='movie_update'),
]
