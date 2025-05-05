from rest_framework_mongoengine import serializers
from rest_framework import fields
from .models import User
from teams.models import Team

class UserSerializer(serializers.DocumentSerializer):
    team_name = fields.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'team', 'team_name']
        read_only_fields = ['id']

class UserRegistrationSerializer(serializers.DocumentSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'team']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user