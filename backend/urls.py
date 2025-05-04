from django.urls import path, include
from django.http import JsonResponse
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token
from LoginInicio.views import UserLoginView, UserRegisterView, UserListView


# Función simple para la ruta raíz
def api_root(request):
    return JsonResponse({
        "message": "API de Futbol Dashboard",
        "endpoints": {
            "login": "/api/users/login/",
            "register": "/api/users/register/",
            "teams": "/api/teams/"
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/users/login/', UserLoginView.as_view(), name='user-login'),
    path('api/users/register/', UserRegisterView.as_view(), name='user-register'),
    path('api/users/', UserListView.as_view(), name='user-list'),  # Nueva URL
    path('api/token-refresh/', refresh_jwt_token, name='token-refresh'),
    path('api/teams/', include('teams.urls')),
]