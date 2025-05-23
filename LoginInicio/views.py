from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_jwt.settings import api_settings
import datetime
from rest_framework.permissions import IsAuthenticated


from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

class UserLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        try:
            # Manejo explícito de errores para mejor diagnóstico
            if not username or not password:
                return Response(
                    {'error': 'Se requiere nombre de usuario y contraseña'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Usuario no encontrado'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.check_password(password):
                return Response(
                    {'error': 'Contraseña incorrecta'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            # Actualizar último acceso
            user.last_login = datetime.datetime.now()
            user.save()
            
            # Crear token JWT
            payload = jwt_payload_handler(user)
            token = jwt_encode_handler(payload)
            
            return Response({
                'token': token,
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'team': str(user.team.id) if user.team else None
                }
            })
        except Exception as e:
            # Log the error for debugging
            print(f"Error en login: {str(e)}")
            return Response(
                {'error': f'Error del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class UserRegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            
            # Validación básica
            if not all([username, email, password]):
                return Response(
                    {'error': 'Todos los campos son requeridos'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar si el usuario ya existe
            if User.objects(username=username).first():
                return Response(
                    {'error': 'El nombre de usuario ya está en uso'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if User.objects(email=email).first():
                return Response(
                    {'error': 'El email ya está registrado'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear nuevo usuario
            user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            # Importante: hashear la contraseña
            user.set_password(password)
            user.save()
            
            return Response({
                'message': 'Usuario registrado con éxito',
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log del error para debugging
            print(f"Error en registro: {str(e)}")
            return Response(
                {'error': f'Error del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            users = User.objects.all()
            serializer = UserSerializer(users, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error listando usuarios: {str(e)}")
            return Response(
                {'error': f'Error del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        try:
            # Para creación de usuarios por administradores
            data = request.data.copy()
            
            # Validación básica
            if not all([data.get('username'), data.get('email')]):
                return Response(
                    {'error': 'Nombre de usuario y email son requeridos'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar si el usuario ya existe
            if User.objects(username=data.get('username')).first():
                return Response(
                    {'error': 'El nombre de usuario ya está en uso'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if User.objects(email=data.get('email')).first():
                return Response(
                    {'error': 'El email ya está registrado'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
                        # Asignar rol (por defecto 'user' si no se especifica)
            if not data.get('role'):
                data['role'] = 'user'
                
            # Si es entrenador, verificar que tenga un equipo asignado
            if data.get('role') == 'coach' and not data.get('team'):
                return Response(
                    {'error': 'Los entrenadores deben tener un equipo asignado'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Si no se proporciona una contraseña, generar una temporal
            if not data.get('password'):
                data['password'] = 'changeme123'  # Contraseña temporal
            
            # Crear usuario
            serializer = UserRegistrationSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                # Importante: hashear la contraseña
                user.set_password(data.get('password'))
                user.save()
                
                return Response({
                    'message': 'Usuario creado con éxito',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"Error creando usuario: {str(e)}")
            return Response(
                {'error': f'Error del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

# Añadir esta nueva clase al final del archivo

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            # Solo administradores pueden modificar otros usuarios
            if request.user.role != 'admin' and str(request.user.id) != user_id:
                return Response(
                    {"error": "No tienes permisos para modificar este usuario"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            data = request.data.copy()
            
            # Si se intenta cambiar el equipo, verificar que sea un ID válido
            if 'team' in data and data['team']:
                try:
                    from teams.models import Team
                    team = Team.objects.get(id=data['team'])
                except:
                    return Response(
                        {"error": "El equipo seleccionado no existe"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Actualizar campos
            if 'username' in data:
                # Verificar que el nuevo username no exista ya
                existing_user = User.objects(username=data['username']).first()
                if existing_user and str(existing_user.id) != user_id:
                    return Response(
                        {"error": "Este nombre de usuario ya está en uso"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.username = data['username']
                
            if 'email' in data:
                # Verificar que el nuevo email no exista ya
                existing_user = User.objects(email=data['email']).first()
                if existing_user and str(existing_user.id) != user_id:
                    return Response(
                        {"error": "Este email ya está registrado"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.email = data['email']
            
            if 'first_name' in data:
                user.first_name = data['first_name']
                
            if 'last_name' in data:
                user.last_name = data['last_name']
                
            if 'role' in data:
                user.role = data['role']
                
            if 'team' in data:
                from teams.models import Team
                user.team = Team.objects.get(id=data['team']) if data['team'] else None
            
            # Si se proporciona nueva contraseña
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            user.save()
            
            serializer = UserSerializer(user)
            return Response(serializer.data)
                
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(f"Error actualizando usuario: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            # Solo administradores pueden eliminar usuarios
            if request.user.role != 'admin':
                return Response(
                    {"error": "No tienes permisos para eliminar usuarios"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # No permitir eliminar al propio usuario
            if str(request.user.id) == user_id:
                return Response(
                    {"error": "No puedes eliminar tu propio usuario"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )