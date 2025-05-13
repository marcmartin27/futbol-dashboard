from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Session
from .serializers import SessionSerializer
from rest_framework.permissions import IsAuthenticated
from teams.models import Player
from tasks.models import Task
from .utils import notify_admins_new_session


class SessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = Session.objects(owner=request.user)
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        data['owner'] = str(request.user.id)
        
        # Verificar que se hayan seleccionado exactamente 4 tareas
        if 'tasks' not in data or len(data['tasks']) != 4:
            return Response({'error': "Debe seleccionar exactamente 4 tareas"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que se hayan seleccionado jugadores
        if 'players' not in data or not data['players']:
            return Response({'error': "Debe seleccionar al menos un jugador"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que existan las tareas
        for task_id in data['tasks']:
            try:
                Task.objects.get(id=task_id)
            except Task.DoesNotExist:
                return Response({'error': f"Tarea con ID {task_id} no encontrada"},
                              status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que existan los jugadores
        for player_id in data['players']:
            try:
                Player.objects.get(id=player_id)
            except Player.DoesNotExist:
                return Response({'error': f"Jugador con ID {player_id} no encontrado"},
                              status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SessionSerializer(data=data)
        if serializer.is_valid():
            session = serializer.save()
            
            # Enviar notificación por correo a los administradores
            try:
                notify_admins_new_session(session, request.user)
                print("Notificación por correo enviada exitosamente")
            except Exception as e:
                print(f"Error al enviar notificación por correo: {str(e)}")
                # No devolvemos error al cliente si falla el envío de correo
                # La sesión ya se guardó correctamente
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Solo los administradores pueden ver todas las sesiones
        if request.user.role != 'admin':
            return Response({"error": "Acceso no autorizado"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            # Obtener parámetro coach para filtrar por entrenador
            coach_id = request.query_params.get('coach')
            
            if coach_id:
                sessions = Session.objects(owner=coach_id)
            else:
                sessions = Session.objects.all()
                
            serializer = SessionSerializer(sessions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            traceback_str = traceback.format_exc()
            print(f"Error en AdminSessionListView: {traceback_str}")
            return Response(
                {"error": f"Error del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class SessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            # Verificar permisos: solo el propietario o admin pueden ver la sesión
            session = Session.objects.get(id=session_id)
            
            if request.user.role != 'admin' and str(request.user.id) != str(session.owner.id):
                return Response(
                    {"error": "No tienes permiso para ver esta sesión"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            serializer = SessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Session.DoesNotExist:
            return Response(
                {"error": "Sesión no encontrada"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            traceback_str = traceback.format_exc()
            print(f"Error en SessionDetailView: {traceback_str}")
            return Response(
                {"error": f"Error del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )