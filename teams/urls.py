from django.urls import path
from .views import (
    TeamListView, TeamCreateView, TeamTestView,
    TeamDetailView, PlayerListView, PlayerCreateView, PlayerDetailView
)

urlpatterns = [
    path('', TeamListView.as_view(), name='team-list'),
    path('create/', TeamCreateView.as_view(), name='team-create'),
    path('test/', TeamTestView.as_view(), name='team-test'),
    path('<str:id>/', TeamDetailView.as_view(), name='team-detail'),
    path('players/', PlayerListView.as_view(), name='player-list'),
    path('<str:team_id>/players/', PlayerListView.as_view(), name='team-player-list'),
    path('<str:team_id>/players/create/', PlayerCreateView.as_view(), name='team-player-create'),
    path('players/<str:id>/', PlayerDetailView.as_view(), name='player-detail'),
]