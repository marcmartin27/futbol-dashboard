from django.urls import path
from .views import TaskListCreateView, AdminTaskListView, TaskDetailView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'),
    path('all/', AdminTaskListView.as_view(), name='admin-task-list'),
    path('<str:task_id>/', TaskDetailView.as_view(), name='task-detail'),
]