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
                    'last_name': user.last_name
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