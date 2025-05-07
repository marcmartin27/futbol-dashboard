from rest_framework_mongoengine import serializers
from rest_framework import fields
from .models import Session

class SessionSerializer(serializers.DocumentSerializer):
    tasks_details = fields.SerializerMethodField(read_only=True)
    players_details = fields.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Session
        fields = '__all__'
    
    def get_tasks_details(self, obj):
        from tasks.serializers import TaskSerializer
        return TaskSerializer(obj.tasks, many=True).data
    
    def get_players_details(self, obj):
        from teams.serializers import PlayerSerializer
        return PlayerSerializer(obj.players, many=True).data