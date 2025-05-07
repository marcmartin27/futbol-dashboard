from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Session
from .serializers import SessionSerializer
from rest_framework.permissions import IsAuthenticated
from teams.models import Player
from tasks.models import Task

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
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)