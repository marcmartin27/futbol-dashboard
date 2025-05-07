//// filepath: /home/daw2/Escriptori/futbol-dashboard/frontend/src/components/dashboard/UsersSection.js
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
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      refreshUsers(); // función pasada desde Dashboard para recargar la lista de usuarios
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

  return (
    <div className="content-wrapper">
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
                    <option key={team.id} value={team.id}>
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
          {loading && <p className="loading">Cargando usuarios...</p>}
          
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
                  <div className="user-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-role">{user.role || 'Sin rol'}</div>
                    {user.role === 'coach' && user.team && (
                      <div className="user-team">
                        Equipo asignado: {
                          (() => {
                            const assignedTeam = teams.find(
                              team => team.id === user.team || team._id === user.team
                            );
                            return assignedTeam ? assignedTeam.name : user.team;
                          })()
                        }
                      </div>
                    )}
                  </div>
                  <div className="user-actions">
                    <button 
                      className="btn btn-icon-only" 
                      title="Editar usuario"
                      onClick={() => handleEditUser(user)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn btn-icon-only" 
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