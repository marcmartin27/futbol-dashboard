from rest_framework import permissions

class IsCoachOfTeamOrAdmin(permissions.BasePermission):
    """
    Permiso para entrenadores o administradores.
    Los entrenadores solo pueden acceder a su equipo asignado.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Administradores tienen acceso completo
        if request.user.role == 'admin':
            return True
        
        # Entrenadores solo pueden acceder a su propio equipo
        if request.user.role == 'coach':
            team_id = view.kwargs.get('id') or view.kwargs.get('team_id')
            
            # Si no hay team_id en la URL, permitir acceso (será filtrado en la vista)
            if not team_id:
                return True
                
            # Verificar que el entrenador esté asignado a este equipo
            return str(request.user.team.id) == team_id
            
        return False