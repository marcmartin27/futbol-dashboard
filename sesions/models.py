from mongoengine import Document, ListField, ReferenceField, DateTimeField
import datetime

class Session(Document):
    # Lista de 4 tareas (se debe enviar exactamente 4 IDs de tareas)
    tasks = ListField(ReferenceField('Task'), required=True, min_length=4, max_length=4)
    owner = ReferenceField('User', required=True)
    created_at = DateTimeField(default=datetime.datetime.now)

    meta = {'collection': 'sessions'}

    def __str__(self):
        return f"Session by {self.owner} at {self.created_at}"