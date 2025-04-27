from django.apps import AppConfig

class TeamsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'teams'
    
    def ready(self):
        # Asegurarse que la colección de equipos está inicializada
        from .models import Team
        try:
            # Verificar acceso a la colección
            Team._get_collection()
            print("Conexión a colección de equipos establecida")
        except Exception as e:
            print(f"Error al acceder a la colección de equipos: {str(e)}")