from django.urls import path
from .views import PlayerMinutesView

urlpatterns = [
    path('<str:team_id>/minutes/', PlayerMinutesView.as_view(), name='team-player-minutes'),
]