from rest_framework.permissions import BasePermission

class IsCoachOfTeamOrAdmin(BasePermission):
    """
    Permission to allow only coaches of the specific team or admin users
    """
    def has_permission(self, request, view):
        # Admin users can do anything
        if request.user.role == 'admin':
            return True
        
        # Para todas las vistas que no sean para un objeto específico
        # Los entrenadores tienen permiso general
        if request.user.role == 'coach':
            return True
                
        return False
        
    def has_object_permission(self, request, view, obj):
        # Admin users can do anything
        if request.user.role == 'admin':
            return True
            
        # Para objetos que tienen una referencia al team (como Player)
        if hasattr(obj, 'team'):
            # Coaches can only access objects related to their team
            if request.user.role == 'coach' and hasattr(request.user, 'team') and request.user.team:
                # Comparar los IDs como strings, no los objetos
                return str(obj.team.id) == str(request.user.team.id)
                
        # Si el objeto es un equipo
        elif type(obj).__name__ == 'Team':
            # Coaches can only access their assigned team
            if request.user.role == 'coach' and hasattr(request.user, 'team') and request.user.team:
                # Comparar los IDs como strings para evitar problemas de tipo
                return str(obj.id) == str(request.user.team.id)
                
        return False