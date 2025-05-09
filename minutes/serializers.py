from rest_framework_mongoengine import serializers
from rest_framework import fields
from .models import PlayerMinutes

class PlayerMinutesSerializer(serializers.DocumentSerializer):
    # Campos del jugador para mostrar información completa
    player_name = fields.CharField(source='player.name', read_only=True)
    player_last_name = fields.CharField(source='player.last_name', read_only=True)
    player_number = fields.IntegerField(source='player.number', read_only=True)
    player_position = fields.CharField(source='player.position', read_only=True)
    player_age = fields.IntegerField(source='player.age', read_only=True)
    player_id = fields.CharField(source='player.id', read_only=True)
    
    # Campos de partido formateados
    match_date_display = fields.SerializerMethodField(read_only=True)
    
    class Meta:
        model = PlayerMinutes
        fields = '__all__'
    
    def get_match_date_display(self, obj):
        """Devuelve la fecha en formato legible"""
        if obj.match_date:
            return obj.match_date.strftime('%d/%m/%Y')
        return ""