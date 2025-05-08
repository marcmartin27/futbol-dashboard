from django.core.mail import send_mail
from django.conf import settings
import traceback

def notify_admins_new_session(session, coach):
    """
    Envía un correo electrónico HTML sobre la nueva sesión
    directamente a marc.martin@inslapineda.cat
    """
    try:
        # Dirección de correo fija
        admin_email = 'marc.martin@inslapineda.cat'
        
        # Obtener el nombre del entrenador de forma segura
        coach_first_name = getattr(coach, 'first_name', '') or coach.username
        coach_last_name = getattr(coach, 'last_name', '') or ''
        coach_full_name = f"{coach_first_name} {coach_last_name}".strip()
        
        # Si no hay nombre completo, usar el nombre de usuario
        if not coach_full_name:
            coach_full_name = coach.username
        
        subject = f'Nueva sesión creada por {coach.username}'
        
        # Imprimir información de diagnóstico
        print(f"Enviando notificación de nueva sesión:")
        print(f"- ID de sesión: {session.id}")
        print(f"- Fecha: {session.date}")
        print(f"- Entrenador: {coach_full_name} (username: {coach.username})")
        print(f"- Destinatario: {admin_email}")
        
        # Crear mensaje HTML con información de la sesión
        html_message = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
                .header {{ background-color: #3f51b5; color: white; padding: 15px; border-radius: 5px 5px 0 0; }}
                .content {{ padding: 20px 0; }}
                .session-info {{ background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                .footer {{ margin-top: 20px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0;">Nueva Sesión de Entrenamiento</h2>
                </div>
                <div class="content">
                    <p>Hola,</p>
                    <p>El entrenador <strong>{coach_full_name}</strong> acaba de crear una nueva sesión de entrenamiento.</p>
                    
                    <div class="session-info">
                        <p><strong>Fecha:</strong> {session.date}</p>
                        <p><strong>Jugadores:</strong> {len(session.players)} seleccionados</p>
                        <p><strong>Tareas:</strong> {len(session.tasks)} ejercicios</p>
                        <p><strong>Creada:</strong> {session.created_at.strftime('%d/%m/%Y %H:%M')}</p>
                    </div>
                    
                    <p>Puedes ver todos los detalles de esta sesión accediendo al <a href="http://localhost:3000/dashboard">panel de administración</a>.</p>
                </div>
                <div class="footer">
                    <p>Este es un mensaje automático del sistema Team Manager. Por favor no responda a este correo.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Versión en texto plano
        plain_message = f"""
        Nueva Sesión de Entrenamiento
        -----------------------------
        
        El entrenador {coach_full_name} ha creado una nueva sesión:
        
        * Fecha: {session.date}
        * Jugadores: {len(session.players)} seleccionados
        * Tareas: {len(session.tasks)} ejercicios
        * Creada: {session.created_at.strftime('%d/%m/%Y %H:%M')}
        
        Acceda al panel de administración para ver más detalles:
        http://localhost:3000/dashboard
        
        -----------------------------
        Este es un mensaje automático. Por favor no responda a este correo.
        """
        
        print(f"Enviando correo a {admin_email}...")
        
        # Enviar el correo
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        print(f"✓ Correo enviado exitosamente a {admin_email}")
        return True
        
    except Exception as e:
        print(f"✗ ERROR al enviar correo: {str(e)}")
        traceback.print_exc()
        return False