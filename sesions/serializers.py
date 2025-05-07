from rest_framework_mongoengine import serializers
from .models import Session

class SessionSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Session
        fields = '__all__'