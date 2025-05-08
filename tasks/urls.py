# Añadir la nueva ruta
from django.urls import path
from .views import TaskListCreateView, AdminTaskListView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'),
    path('all/', AdminTaskListView.as_view(), name='admin-task-list'),
]