from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Team, Player, Attendance  # Añadir Attendance aquí
from .serializers import TeamSerializer, PlayerSerializer, AttendanceSerializer  # Añadir AttendanceSerializer aquí
from rest_framework.permissions import IsAuthenticated
from .permissions import IsCoachOfTeamOrAdmin
import traceback

class TeamListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Filtrar equipos según el rol del usuario
            if request.user.role == 'coach' and request.user.team:
                teams = [request.user.team]
            else:
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
    permission_classes = [IsCoachOfTeamOrAdmin]
    
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
        
class TeamDetailView(APIView):
    permission_classes = [IsCoachOfTeamOrAdmin]
    
    def get(self, request, id):
        try:
            team = Team.objects.get(id=id)
            serializer = TeamSerializer(team)
            return Response(serializer.data)
        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Corregir indentación aquí - debe estar al mismo nivel que get
    def put(self, request, id):
        try:
            team = Team.objects.get(id=id)
            serializer = TeamSerializer(team, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error_traceback = traceback.format_exc()
            print(f"Error en PUT teams/{id}/: {str(e)}")
            print(error_traceback)
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Este método también debe estar al mismo nivel que get y put
    def delete(self, request, id):
        try:
            team = Team.objects.get(id=id)
            team.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            error_traceback = traceback.format_exc()
            print(f"Error en DELETE teams/{id}/: {str(e)}")
            print(error_traceback)
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PlayerListView(APIView):
    permission_classes = [IsCoachOfTeamOrAdmin]
    
    def get(self, request, team_id=None):
        try:
            if team_id:
                team = Team.objects.get(id=team_id)
                players = Player.objects(team=team)
            else:
                players = Player.objects.all()
                
            serializer = PlayerSerializer(players, many=True)
            return Response(serializer.data)
        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PlayerCreateView(APIView):
    permission_classes = [IsCoachOfTeamOrAdmin]
    
    def post(self, request, team_id):
        try:
            team = Team.objects.get(id=team_id)
            
            # Añadir el team_id al request.data
            data = request.data.copy()
            data['team'] = str(team.id)
            
            serializer = PlayerSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PlayerDetailView(APIView):
    permission_classes = [IsCoachOfTeamOrAdmin]
    
    def get(self, request, id):
        try:
            player = Player.objects.get(id=id)
            serializer = PlayerSerializer(player)
            return Response(serializer.data)
        except Player.DoesNotExist:
            return Response({"error": "Jugador no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, id):
        try:
            player = Player.objects.get(id=id)
            serializer = PlayerSerializer(player, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Player.DoesNotExist:
            return Response({"error": "Jugador no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, id):
        try:
            player = Player.objects.get(id=id)
            player.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Player.DoesNotExist:
            return Response({"error": "Jugador no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
# Añadir al final del archivo views.py
class AttendanceListView(APIView):
    permission_classes = [IsCoachOfTeamOrAdmin]
    
    def get(self, request, team_id):
        try:
            team = Team.objects.get(id=team_id)
            players = Player.objects(team=team)
            
            # Obtener la semana solicitada (por defecto semana 1)
            week = int(request.query_params.get('week', 1))
            
            attendances = []
            for player in players:
                # Buscar la asistencia o crear una si no existe
                attendance = Attendance.objects(player=player, week=week).first()
                if not attendance:
                    attendance = Attendance(player=player, week=week)
                    attendance.save()
                attendances.append(attendance)
            
            serializer = AttendanceSerializer(attendances, many=True)
            return Response(serializer.data)
        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, team_id):
        try:
            # Actualizar una asistencia específica
            attendance_id = request.data.get('id')
            attendance = Attendance.objects.get(id=attendance_id)
            
            # Actualizar campos específicos
            if 'training1' in request.data:
                attendance.training1 = request.data.get('training1')
            if 'training2' in request.data:
                attendance.training2 = request.data.get('training2')
            if 'training3' in request.data:
                attendance.training3 = request.data.get('training3')
            if 'match' in request.data:
                attendance.match = request.data.get('match')
            
            attendance.save()
            
            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data)
        except Attendance.DoesNotExist:
            return Response({"error": "Asistencia no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )