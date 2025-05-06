from rest_framework_mongoengine import serializers
from rest_framework import fields
from .models import PlayerMinutes

class PlayerMinutesSerializer(serializers.DocumentSerializer):
    player_name = fields.CharField(source='player.name', read_only=True)
    player_last_name = fields.CharField(source='player.last_name', read_only=True)
    player_number = fields.IntegerField(source='player.number', read_only=True)
    player_position = fields.CharField(source='player.position', read_only=True)
    
    class Meta:
        model = PlayerMinutes
        fields = '__all__'