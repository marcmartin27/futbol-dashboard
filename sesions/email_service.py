from django.core.mail import EmailMessage
from LoginInicio.models import User
import logging

logger = logging.getLogger(__name__)

def get_admin_emails():
    """
    Obtiene todos los correos electrónicos de usuarios con rol 'admin'
    """
    try:
        admin_users = User.objects(role='admin')
        admin_emails = [user.email for user in admin_users if user.email]
        return admin_emails
    except Exception as e:
        logger.error(f"Error obteniendo emails de administradores: {str(e)}")
        return []

def send_session_notification(session, pdf_content):
    """
    Envía un correo a todos los administradores notificando la creación de una sesión
    """
    try:
        # Obtener emails de administradores
        admin_emails = get_admin_emails()
        
        if not admin_emails:
            logger.warning("No hay administradores para notificar la creación de sesión")
            return False
        
        # Obtener información del coach
        coach_name = f"{session.owner.first_name} {session.owner.last_name}" if (hasattr(session.owner, 'first_name') and hasattr(session.owner, 'last_name')) else session.owner.username
        
        # Preparar el asunto del correo
        subject = f"Nueva Sesión de Entrenamiento Creada por {coach_name}"
        
        # Preparar el cuerpo del mensaje
        body = f"""
        Hola Administrador,
        
        El entrenador {coach_name} ha creado una nueva sesión de entrenamiento para la fecha {session.date.strftime('%d/%m/%Y')}.
        
        Detalles de la sesión:
        - Fecha: {session.date.strftime('%d/%m/%Y')}
        - Tareas: {len(session.tasks_details) if hasattr(session, 'tasks_details') else 0}
        - Jugadores convocados: {len(session.players_details) if hasattr(session, 'players_details') else 0}
        
        Se adjunta un PDF con el detalle completo de la sesión.
        
        Saludos,
        Team Manager
        """
        
        # Crear el email
        email = EmailMessage(
            subject=subject,
            body=body,
            to=admin_emails
        )
        
        # Adjuntar el PDF
        email.attach(
            filename=f"sesion_{session.date.strftime('%Y%m%d')}.pdf",
            content=pdf_content,
            mimetype='application/pdf'
        )
        
        # Enviar el email
        email.send()
        
        return True
    except Exception as e:
        logger.error(f"Error enviando notificación de sesión: {str(e)}")
        return False