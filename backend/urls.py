from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token
from LoginInicio.views import UserLoginView, UserRegisterView, UserListView, UserDetailView  # Añadir UserDetailView aquí

# Función simple para la ruta raíz
def api_root(request):
    return JsonResponse({
        "message": "API de Futbol Dashboard",
        "endpoints": {
            "login": "/api/login/",
            "register": "/api/users/register/",
            "teams": "/api/teams/"
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_root, name='api-root'),
    path('api/login/', UserLoginView.as_view(), name='user-login'),
    path('api/users/register/', UserRegisterView.as_view(), name='user-register'),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/users/<str:user_id>/', UserDetailView.as_view(), name='user-detail'),  # Añadir esta línea
    path('api/token-refresh/', refresh_jwt_token, name='token-refresh'),
    path('api/teams/', include('teams.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/teams/', include('minutes.urls')),
    path('api/sessions/', include('sesions.urls')),
]