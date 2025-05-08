import React, { useState } from 'react';
import { authHeader } from '../../services/auth';

function EditUserModal({ userToEdit, teams, onClose, onUserUpdated }) {
  const [form, setForm] = useState({ ...userToEdit });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Añadir estado loading

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userToEdit.id}/`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form) // Cambiar formData a form
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
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label>Nombre de usuario</label>
            <input 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-control">
            <label>Correo electrónico</label>
            <input 
              name="email" 
              type="email"
              value={form.email} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-control">
            <label>Rol</label>
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
              <label>Equipo asignado</label>
              <select 
                name="team" 
                value={form.team || ''} 
                onChange={handleChange} 
                required
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
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;