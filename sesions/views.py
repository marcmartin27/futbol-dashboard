from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Session
from .serializers import SessionSerializer
from rest_framework.permissions import IsAuthenticated

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
        serializer = SessionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)