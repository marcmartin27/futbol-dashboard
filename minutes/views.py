from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PlayerMinutes
from .serializers import PlayerMinutesSerializer
from teams.models import Team, Player
from teams.permissions import IsCoachOfTeamOrAdmin

class PlayerMinutesView(APIView):
    permission_classes = [IsCoachOfTeamOrAdmin]
    
    def get(self, request, team_id):
        try:
            team = Team.objects.get(id=team_id)
            players = Player.objects(team=team)
            
            # Obtener parámetros de la solicitud
            match_date = request.query_params.get('match_date')
            match_name = request.query_params.get('match_name')
            
            # Si se proporcionaron fecha y nombre del partido, buscar registros existentes
            if match_date and match_name:
                minutes_records = PlayerMinutes.objects(team=team, match_date=match_date, match_name=match_name)
                
                # Crear automáticamente si no existen y se solicita
                if not minutes_records and request.query_params.get('auto_create') == 'true':
                    minutes_records = []
                    for player in players:
                        record = PlayerMinutes(
                            player=player,
                            team=team,
                            match_date=match_date,
                            match_name=match_name,
                            is_starter=False,
                            minutes_played=0,
                            entry_minute=None,
                            exit_minute=None
                        )
                        record.save()
                        minutes_records.append(record)
            else:
                # Sin filtro, devolver todos los registros de minutos del equipo
                minutes_records = PlayerMinutes.objects(team=team)
            
            serializer = PlayerMinutesSerializer(minutes_records, many=True)
            return Response(serializer.data)
        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Este método debe estar indentado dentro de la clase, al mismo nivel que 'get'
    def put(self, request, team_id):
        try:
            # Actualizar un registro específico de minutos
            minute_id = request.data.get('id')
            player_minute = PlayerMinutes.objects.get(id=minute_id)
            
            # Actualizar campos según los datos recibidos
            if 'is_starter' in request.data:
                player_minute.is_starter = request.data.get('is_starter')
                # Si es titular, establecer minuto de entrada en 0
                if request.data.get('is_starter'):
                    player_minute.entry_minute = 0
            
            if 'entry_minute' in request.data:
                player_minute.entry_minute = request.data.get('entry_minute')
            
            if 'exit_minute' in request.data:
                player_minute.exit_minute = request.data.get('exit_minute')
            
            # Calcular minutos jugados automáticamente
            entry = player_minute.entry_minute or 0
            exit = player_minute.exit_minute or 90
            
            # Si es titular, la entrada es siempre 0
            if player_minute.is_starter:
                entry = 0
                
            # Calcular minutos jugados como la diferencia
            player_minute.minutes_played = max(0, exit - entry)
            
            player_minute.save()
            
            serializer = PlayerMinutesSerializer(player_minute)
            return Response(serializer.data)
        except PlayerMinutes.DoesNotExist:
            return Response({"error": "Registro de minutos no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"Error del servidor: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )