from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField, ReferenceField
from django.contrib.auth.hashers import make_password, check_password
import datetime

class User(Document):
    username = StringField(required=True, unique=True, max_length=150)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    first_name = StringField(max_length=30)
    last_name = StringField(max_length=30)
    role = StringField(default='user', choices=['admin', 'coach', 'user'])  # Nuevo campo para rol
    team = ReferenceField('teams.Team', null=True)  # Referencia al equipo para entrenadores
    is_active = BooleanField(default=True)
    date_joined = DateTimeField(default=datetime.datetime.now)
    last_login = DateTimeField(default=datetime.datetime.now)
    
    meta = {'collection': 'users'}
    
    # Propiedades para compatibilidad con Django auth
    @property
    def is_authenticated(self):
        return True
        
    @property
    def is_anonymous(self):
        return False
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    def __str__(self):
        return self.username