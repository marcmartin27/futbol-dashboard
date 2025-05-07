import React, { useState } from 'react';
import { authHeader } from '../../services/auth';

function EditUserModal({ userToEdit, teams, onClose, onUserUpdated }) {
  const [form, setForm] = useState({ ...userToEdit });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userToEdit.id || userToEdit._id}`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        let errMsg = '';
        try {
          const errorData = await response.clone().json();
          errMsg = errorData.error || `Error ${response.status}`;
        } catch (err) {
          errMsg = await response.clone().text();
        }
        throw new Error(errMsg);
      }
      let updatedUser = {};
      try {
        updatedUser = await response.json();
      } catch (err) {
        updatedUser = form;
      }
      onUserUpdated(updatedUser);
      onClose();
    } catch (err) {
      alert("Error actualizando usuario: " + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Editar Usuario</h2>
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
            <button type="submit" className="btn btn-primary">Guardar</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;