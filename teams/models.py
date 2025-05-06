from mongoengine import Document, StringField, IntField, ReferenceField, BooleanField  # Añadir BooleanField aquí

class Team(Document):
    name = StringField(required=True, max_length=100)
    city = StringField(required=True, max_length=100)
    founded = IntField(required=True)
    
    meta = {'collection': 'teams'}
    
    def __str__(self):
        return self.name

class Player(Document):
    name = StringField(required=True, max_length=100)
    last_name = StringField(required=True, max_length=100)
    number = IntField(required=True, min_value=1, max_value=99)
    position = StringField(required=True, choices=[
        'POR', 'DEF', 'LTD', 'LTI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'SD', 'DEL'
    ])
    age = IntField(required=True, min_value=16, max_value=50)
    nationality = StringField(required=True, max_length=50)
    height = IntField(required=False)  # En cm
    weight = IntField(required=False)  # En kg
    team = ReferenceField('Team', required=True)
    photo_url = StringField(required=False)
    
    meta = {'collection': 'players', 'ordering': ['position', 'number']}
    
    def __str__(self):
        return f"{self.name} {self.last_name} ({self.number})"

    # Método para obtener posición textual completa
    def get_position_display(self):
        positions = {
            'POR': 'Portero',
            'DEF': 'Defensa Central',
            'LTD': 'Lateral Derecho',
            'LTI': 'Lateral Izquierdo',
            'MCD': 'Mediocentro Defensivo',
            'MC': 'Mediocentro',
            'MCO': 'Mediocentro Ofensivo',
            'ED': 'Extremo Derecho',
            'EI': 'Extremo Izquierdo',
            'SD': 'Segunda Punta',
            'DEL': 'Delantero'
        }
        return positions.get(self.position, self.position)
class Attendance(Document):
    player = ReferenceField('Player', required=True)
    week = IntField(required=True, min_value=1)
    training1 = BooleanField(default=False)  # Entrenamiento 1
    training2 = BooleanField(default=False)  # Entrenamiento 2
    training3 = BooleanField(default=False)  # Entrenamiento 3
    match = BooleanField(default=False)      # Partido
    
    meta = {'collection': 'attendances', 'indexes': [
        {'fields': ['player', 'week'], 'unique': True}
    ]}