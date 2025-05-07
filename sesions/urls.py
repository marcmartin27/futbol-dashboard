from django.urls import path
from .views import SessionListCreateView

urlpatterns = [
    path('', SessionListCreateView.as_view(), name='session-list-create'),
]