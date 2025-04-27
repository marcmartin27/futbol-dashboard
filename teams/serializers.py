from rest_framework_mongoengine import serializers
from .models import Team

class TeamSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Team
        fields = '__all__'