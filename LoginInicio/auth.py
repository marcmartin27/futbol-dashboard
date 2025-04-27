from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework_jwt.settings import api_settings
from rest_framework import exceptions
import traceback
from .models import User

class MongoJWTAuthentication(JSONWebTokenAuthentication):
    """Autenticador JWT personalizado para modelos MongoDB"""
    
    def authenticate(self, request):
        """Debugging mejorado para el proceso de autenticación JWT"""
        try:
            # Mostrar headers recibidos para depuración
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            print(f"Header de autenticación: '{auth_header}'")
            
            # Obtener el token JWT del header
            jwt_value = self.get_jwt_value(request)
            if not jwt_value:
                print("No se encontró token JWT en la solicitud")
                return None
                
            print(f"Token JWT encontrado: {jwt_value[:20]}...")  # Mostrar inicio del token
            
            # Decodificar el token
            try:
                payload = api_settings.JWT_DECODE_HANDLER(jwt_value)
                print(f"Payload decodificado: {payload}")
            except Exception as e:
                print(f"Error decodificando token: {str(e)}")
                raise exceptions.AuthenticationFailed("Token JWT inválido")
            
            # Autenticar usuario con el payload
            user = self.authenticate_credentials(payload)
            print(f"Usuario autenticado: {user}")
            
            return (user, jwt_value)
        except Exception as e:
            print(f"Error en autenticación: {str(e)}")
            traceback.print_exc()
            raise
            
    def authenticate_credentials(self, payload):
        """
        Método personalizado para trabajar con MongoDB User model
        """
        user_id = payload.get('user_id')
        
        if not user_id:
            print("No se encontró user_id en el payload")
            raise exceptions.AuthenticationFailed("Token inválido, no contiene ID de usuario")
            
        try:
            # Usar MongoEngine para buscar el usuario por ID
            user = User.objects.get(id=user_id)
            print(f"Usuario encontrado: {user.username}")
            
            if not user.is_active:
                print("La cuenta de usuario no está activa")
                raise exceptions.AuthenticationFailed("La cuenta de usuario no está activa")
                
            return user
            
        except User.DoesNotExist:
            print(f"Usuario con ID {user_id} no encontrado")
            raise exceptions.AuthenticationFailed("Usuario no encontrado")
        except Exception as e:
            print(f"Error buscando usuario: {str(e)}")
            raise exceptions.AuthenticationFailed("Error al autenticar")