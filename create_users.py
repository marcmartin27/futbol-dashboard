from mongoengine import connect
from LoginInicio.models import User
from teams.models import Team

# Conectar a MongoDB
connect('futbol_dashboard')  # Ajusta el nombre de tu base de datos si es diferente

def crear_admin():
    # Verificar si ya existe un admin
    if User.objects(role='admin').first():
        print("Ya existe un administrador")
        return
    
    # Crear usuario admin
    admin = User(
        username="admin",
        email="admin@example.com",
        role="admin"
    )
    admin.set_password("admin123")
    admin.save()
    print("Administrador creado exitosamente")

def crear_entrenador():
    # Obtener un equipo
    equipo = Team.objects.first()
    if not equipo:
        print("No hay equipos disponibles. Crea un equipo primero.")
        return
    
    # Crear entrenador
    coach = User(
        username="coach",
        email="coach@example.com",
        role="coach",
        team=equipo
    )
    coach.set_password("coach123")
    coach.save()
    print(f"Entrenador creado y asignado al equipo: {equipo.name}")

if __name__ == "__main__":
    crear_admin()
    crear_entrenador()