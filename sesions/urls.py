from django.urls import path
from .views import SessionListCreateView, AdminSessionListView

urlpatterns = [
    path('', SessionListCreateView.as_view(), name='session-list-create'),
    path('admin/', AdminSessionListView.as_view(), name='admin-session-list'),
]