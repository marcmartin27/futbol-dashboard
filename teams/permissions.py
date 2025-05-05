from rest_framework.permissions import BasePermission

class IsCoachOfTeamOrAdmin(BasePermission):
    """
    Permission to allow only coaches of the specific team or admin users
    """
    def has_permission(self, request, view):
        # Admin users can do anything
        if request.user.role == 'admin':
            return True
        
        # Obtener el team_id de la URL si existe
        team_id = view.kwargs.get('team_id') or view.kwargs.get('id')
        
        # Coaches can only access their own team
        if request.user.role == 'coach':
            # Si no hay team_id en la URL, permitir acceso general
            if not team_id:
                return True
                
            # Si hay team_id, verificar que sea su equipo
            if hasattr(request.user, 'team') and request.user.team:
                return str(request.user.team.id) == team_id
                
        return False
        
    def has_object_permission(self, request, view, obj):
        # Admin users can do anything
        if request.user.role == 'admin':
            return True
            
        # Para objetos que tienen una referencia al team
        if hasattr(obj, 'team'):
            # Coaches can only access objects related to their team
            if request.user.role == 'coach' and hasattr(request.user, 'team'):
                return obj.team == request.user.team
                
        # Si el objeto es un equipo
        elif type(obj).__name__ == 'Team':
            # Coaches can only access their assigned team
            if request.user.role == 'coach' and hasattr(request.user, 'team'):
                return obj == request.user.team
                
        return False