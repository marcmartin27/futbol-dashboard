from django.urls import path
from .views import UserLoginView, UserRegisterView, UserListView, UserDetailView

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<str:user_id>/', UserDetailView.as_view(), name='user-detail'),
]