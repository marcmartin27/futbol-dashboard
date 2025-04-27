from django.urls import path
from .views import TeamListView, TeamCreateView, TeamTestView  # Añade TeamTestView aquí

urlpatterns = [
    path('', TeamListView.as_view(), name='team-list'),
    path('create/', TeamCreateView.as_view(), name='team-create'),
    path('test/', TeamTestView.as_view(), name='team-test'),  # Añade esta nueva ruta
]