from rest_framework_mongoengine import serializers
from rest_framework import fields  # Importar los campos estándar de DRF
from .models import Team, Player, Attendance  # Añadir Attendance aquí

class TeamSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.DocumentSerializer):
    position_display = fields.CharField(source='get_position_display', read_only=True)
    team_name = fields.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = Player
        fields = '__all__'

class AttendanceSerializer(serializers.DocumentSerializer):
    player_name = fields.CharField(source='player.name', read_only=True)
    player_last_name = fields.CharField(source='player.last_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'