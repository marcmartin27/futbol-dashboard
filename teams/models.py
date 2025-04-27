from mongoengine import Document, StringField, IntField

class Team(Document):
    name = StringField(required=True, max_length=100)
    city = StringField(required=True, max_length=100)
    founded = IntField(required=True)
    
    meta = {'collection': 'teams'}
    
    def __str__(self):
        return self.name