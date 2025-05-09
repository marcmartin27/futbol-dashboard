from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated

class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects(owner=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        data['owner'] = str(request.user.id)
        try:
            data['participants'] = int(data.get('participants'))
            data['duration'] = int(data.get('duration'))
        except (ValueError, TypeError):
            return Response({'error': "Formato numérico inválido en 'participants' o 'duration'"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
            
            # Verificar que el usuario es el dueño de la tarea
            if str(task.owner.id) != str(request.user.id) and request.user.role != 'admin':
                return Response({"error": "No tienes permiso para ver esta tarea"}, 
                              status=status.HTTP_403_FORBIDDEN)
                
            serializer = TaskSerializer(task)
            return Response(serializer.data)
        except Task.DoesNotExist:
            return Response({"error": "Tarea no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error del servidor: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
            
            # Verificar que el usuario es el dueño de la tarea
            if str(task.owner.id) != str(request.user.id) and request.user.role != 'admin':
                return Response({"error": "No tienes permiso para editar esta tarea"}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            # Actualizar la tarea
            data = request.data.copy()
            try:
                data['participants'] = int(data.get('participants', task.participants))
                data['duration'] = int(data.get('duration', task.duration))
            except (ValueError, TypeError):
                return Response({'error': "Formato numérico inválido en 'participants' o 'duration'"},
                            status=status.HTTP_400_BAD_REQUEST)
            
            serializer = TaskSerializer(task, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Task.DoesNotExist:
            return Response({"error": "Tarea no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error del servidor: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
            
            # Verificar que el usuario es el dueño de la tarea
            if str(task.owner.id) != str(request.user.id) and request.user.role != 'admin':
                return Response({"error": "No tienes permiso para eliminar esta tarea"}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            task.delete()
            return Response({"message": "Tarea eliminada correctamente"}, status=status.HTTP_204_NO_CONTENT)
        except Task.DoesNotExist:
            return Response({"error": "Tarea no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error del servidor: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class AdminTaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Solo los administradores pueden ver todas las tareas
        if request.user.role != 'admin':
            return Response({"error": "Acceso no autorizado"}, status=status.HTTP_403_FORBIDDEN)
            
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)