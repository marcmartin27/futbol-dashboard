from mongoengine import Document, StringField, IntField, URLField, ReferenceField
from django.contrib.auth import get_user_model
User = get_user_model()

class Task(Document):
    image = URLField(required=True)
    title = StringField(required=True, max_length=200)
    description = StringField(required=True)
    participants = IntField(required=True)
    duration = IntField(required=True)
    category = StringField(required=True, max_length=100)
    material = StringField(required=True)
    owner = ReferenceField('User', required=True)
    
    meta = {'collection': 'tasks'}
    
    def __str__(self):
        return self.title