import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import EditUserModal from './EditUserModal';
import '../../styles/main.scss';

function UsersSection({ users, form, loading, error, handleChange, handleSubmit, refreshUsers }) {
  const [teams, setTeams] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  
  useEffect(() => {
    loadTeams();
  }, []);
  
  const loadTeams = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/teams/', {
        headers: authHeader()
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando equipos:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: 'DELETE',
        headers: authHeader()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      refreshUsers();
    } catch (err) {
      alert("Error eliminando usuario: " + err.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const onUserUpdated = (updatedUser) => {
    refreshUsers();
  };
  
  // Función para obtener iniciales del usuario
  const getUserInitials = (user) => {
    if (!user) return '';
    if (user.first_name && user.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };
  
  // Función para obtener nombre del equipo
  const getTeamName = (teamId) => {
    const team = teams.find(t => (t.id === teamId || t._id === teamId));
    return team ? team.name : 'No asignado';
  };

  return (
    <div className="content-wrapper users-management-section">
      {error && <div className="error-message">{error}</div>}
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Crear Nuevo Usuario</h2>
        </div>
        <div className="card-body">
          <form className="user-form" onSubmit={handleSubmit}>
            <div className="form-control">
              <input 
                name="username" 
                value={form.username || ''} 
                onChange={handleChange} 
                placeholder="Nombre de usuario" 
                required 
              />
            </div>
            <div className="form-control">
              <input 
                name="email" 
                type="email"
                value={form.email || ''} 
                onChange={handleChange} 
                placeholder="Correo electrónico" 
                required 
              />
            </div>
            <div className="form-control">
              <select 
                name="role" 
                value={form.role || ''} 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccionar rol</option>
                <option value="admin">Administrador</option>
                <option value="coach">Entrenador</option>
                <option value="user">Usuario</option>
              </select>
            </div>
            
            {form.role === 'coach' && (
              <div className="form-control">
                <select 
                  name="team" 
                  value={form.team || ''} 
                  onChange={handleChange} 
                  required={form.role === 'coach'}
                >
                  <option value="">Seleccionar equipo</option>
                  {teams.map(team => (
                    <option key={team.id || team._id} value={team.id || team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Usuarios Registrados</h2>
        </div>
        <div className="card-body">
          {loading && <div className="loading"><i className="fas fa-spinner"></i>Cargando usuarios...</div>}
          
          {!loading && users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-user"></i>
              </div>
              <p className="empty-state-message">No hay usuarios registrados</p>
              <p>Crea tu primer usuario utilizando el formulario de arriba.</p>
            </div>
          ) : (
            <ul className="user-list">
              {users.map(user => (
                <li key={user.id || user._id} className="user-item">
                  <div className="user-header">
                    <div className={`user-avatar role-${user.role || 'user'}`}>
                      {getUserInitials(user)}
                    </div>
                    <div className="user-header-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className={`user-role-badge role-${user.role || 'user'}`}>
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'coach' ? 'Entrenador' : 'Usuario'}
                    </div>
                  </div>
                  
                  <div className="user-details">
                    {user.first_name && user.last_name && (
                      <div className="user-detail-item">
                        <div className="detail-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Nombre completo</div>
                          <div className="detail-value">{`${user.first_name} ${user.last_name}`}</div>
                        </div>
                      </div>
                    )}
                    
                    {user.role === 'coach' && user.team && (
                      <div className="user-detail-item">
                        <div className="detail-icon">
                          <i className="fas fa-futbol"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Equipo asignado</div>
                          <div className="detail-value">{getTeamName(user.team)}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="user-detail-item">
                      <div className="detail-icon">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Permisos</div>
                        <div className="detail-value">
                          {user.role === 'admin' ? 'Acceso completo al sistema' : 
                           user.role === 'coach' ? 'Gestión de equipo y entrenamientos' : 'Acceso básico'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-actions">
                    <button 
                      className="btn-edit" 
                      title="Editar usuario"
                      onClick={() => handleEditUser(user)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn-delete delete-btn" 
                      title="Eliminar usuario"
                      onClick={() => handleDeleteUser(user.id || user._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {editingUser && (
        <EditUserModal 
          userToEdit={editingUser} 
          teams={teams} 
          onClose={closeEditModal} 
          onUserUpdated={onUserUpdated}
        />
      )}
    </div>
  );
}

export default UsersSection;