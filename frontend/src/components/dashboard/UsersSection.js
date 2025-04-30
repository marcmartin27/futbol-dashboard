import React from 'react';
import '../../styles/main.scss';

function UsersSection({ users, form, loading, error, handleChange, handleSubmit }) {
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
              <input 
                name="role" 
                value={form.role || ''} 
                onChange={handleChange} 
                placeholder="Rol del usuario" 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <i className="fas fa-plus btn-icon"></i>
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
                  </div>
                  <div className="user-actions">
                    <button className="btn btn-icon-only" title="Editar usuario">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-icon-only" title="Eliminar usuario">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsersSection;