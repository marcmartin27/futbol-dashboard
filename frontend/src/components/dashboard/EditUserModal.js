import React, { useState } from 'react';
import { authHeader } from '../../services/auth';

function EditUserModal({ userToEdit, teams, onClose, onUserUpdated }) {
  const [form, setForm] = useState({ ...userToEdit });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userToEdit.id || userToEdit._id}/`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      const updatedUser = await response.json();
      onUserUpdated(updatedUser);
      onClose();
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Editar Usuario</h2>
        
        {error && (
          <div className="error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label htmlFor="username">Nombre de usuario</label>
            <input 
              id="username"
              name="username" 
              value={form.username || ''} 
              onChange={handleChange} 
              required
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="email">Correo electrónico</label>
            <input 
              id="email"
              name="email" 
              type="email"
              value={form.email || ''} 
              onChange={handleChange} 
              required
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="first_name">Nombre</label>
            <input 
              id="first_name"
              name="first_name" 
              value={form.first_name || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="last_name">Apellido</label>
            <input 
              id="last_name"
              name="last_name" 
              value={form.last_name || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="role">Rol</label>
            <select 
              id="role"
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
              <label htmlFor="team">Equipo asignado</label>
              <select 
                id="team"
                name="team" 
                value={form.team || ''} 
                onChange={handleChange} 
                required
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
          
          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Guardar Cambios
                </>
              )}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              <i className="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;