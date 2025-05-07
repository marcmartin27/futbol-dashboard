from mongoengine import Document, ListField, ReferenceField, DateTimeField, DateField
from datetime import datetime

class Session(Document):
    # Lista de 4 tareas (se debe enviar exactamente 4 IDs de tareas)
    tasks = ListField(ReferenceField('Task'), required=True, min_length=4, max_length=4)
    players = ListField(ReferenceField('teams.Player'), required=True)  # Lista de jugadores seleccionados
    owner = ReferenceField('User', required=True)  # Entrenador que crea la sesión
    date = DateField(default=datetime.now().date)  # Fecha de la sesión
    created_at = DateTimeField(default=datetime.now)

    meta = {'collection': 'sessions'}

    def __str__(self):
        return f"Session by {self.owner} on {self.date}"