from mongoengine import Document, ReferenceField, IntField, BooleanField, StringField, DateField

class PlayerMinutes(Document):
    player = ReferenceField('teams.Player', required=True)
    match_date = DateField(required=True)
    match_name = StringField(required=True)  # Nombre del rival o identificación del partido
    is_starter = BooleanField(default=False)  # Si el jugador fue titular
    minutes_played = IntField(default=0)  # Total de minutos jugados
    entry_minute = IntField(required=False)  # Minuto en que entró (0 para titulares)
    exit_minute = IntField(required=False)  # Minuto en que salió (90 o prórroga si jugó todo)
    team = ReferenceField('teams.Team', required=True)  # Para filtrar por equipo
    
    meta = {'collection': 'player_minutes', 'indexes': [
        {'fields': ['player', 'match_date', 'match_name'], 'unique': True}
    ]}