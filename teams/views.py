from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Team
from .serializers import TeamSerializer
from rest_framework.permissions import IsAuthenticated
import traceback

class TeamListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Debugging para autenticación
            print("Usuario autenticado:", request.user)
            print("Token JWT:", request.auth)
            
            # Usar objects para mongoengine
            teams = Team.objects.all()
            serializer = TeamSerializer(teams, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Mostrar el traceback completo para diagnóstico
            error_traceback = traceback.format_exc()
            print(f"Error en GET teams/: {str(e)}")
            print(error_traceback)
            return Response(
                {'error': f'Error del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TeamCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Debugging para autenticación 
            print("Usuario autenticado:", request.user)
            print("Token JWT:", request.auth)
            print("Datos recibidos:", request.data)
            
            serializer = TeamSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            print("Errores:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Mostrar el traceback completo para diagnóstico
            error_traceback = traceback.format_exc()
            print(f"Error en POST teams/create/: {str(e)}")
            print(error_traceback)
            return Response(
                {'error': f'Error del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
# Añade esta nueva clase al final del archivo actual

class TeamTestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Test MongoDB connection
            mongo_status = "Unknown"
            try:
                # Try to fetch a team count
                count = Team.objects.count()
                mongo_status = f"Connected, {count} teams found"
            except Exception as e:
                mongo_status = f"Error: {str(e)}"
            
            return Response({
                "message": "Autenticación exitosa",
                "user_id": str(request.user.id) if hasattr(request.user, 'id') else None,
                "username": getattr(request.user, 'username', str(request.user)),
                "auth_type": str(type(request.auth)),
                "mongodb_status": mongo_status
            })
        except Exception as e:
            print(f"Error en test view: {str(e)}")
            return Response({"error": str(e)}, status=500)