import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateTeam, deleteTeam } from '../../services/TeamService';
import '../../styles/main.scss';

function TeamSection({ teams, form, loading, error, handleChange, handleSubmit, getInitials, loadTeams }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', name: '', city: '', founded: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  
  const handleViewTeam = (teamId) => {
    navigate(`/team/${teamId}`);
  };
  
  const handleEditClick = (team) => {
    setEditForm({
      id: team.id || team._id,
      name: team.name,
      city: team.city,
      founded: team.founded
    });
    setIsEditing(true);
    setEditError('');
  };
  
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    
    try {
      setEditLoading(true);
      await updateTeam(editForm.id, {
        name: editForm.name,
        city: editForm.city,
        founded: parseInt(editForm.founded)
      });
      
      // Cerrar formulario de edición y recargar equipos
      setIsEditing(false);
      loadTeams();
    } catch (err) {
      setEditError(`Error actualizando equipo: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleDeleteClick = async (teamId, teamName) => {
    if (window.confirm(`¿Estás seguro de eliminar el equipo "${teamName}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteTeam(teamId);
        // Recargar la lista de equipos
        loadTeams();
      } catch (err) {
        console.error(`Error eliminando equipo: ${err.message}`);
        alert(`Error al eliminar equipo: ${err.message}`);
      }
    }
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };
  
  return (
    <div className="content-wrapper">
      {error && <div className="error-message">{error}</div>}
      
      {/* Modal de edición */}
      {isEditing && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h2>Editar Equipo</h2>
              <button className="close-button" onClick={cancelEdit}>×</button>
            </div>
            
            {editError && <div className="error-message">{editError}</div>}
            
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-control">
                <label htmlFor="name">Nombre del equipo</label>
                <input 
                  id="name"
                  name="name" 
                  value={editForm.name} 
                  onChange={handleEditChange} 
                  placeholder="Nombre del equipo" 
                  required 
                />
              </div>
              <div className="form-control">
                <label htmlFor="city">Ciudad</label>
                <input 
                  id="city"
                  name="city" 
                  value={editForm.city} 
                  onChange={handleEditChange} 
                  placeholder="Ciudad" 
                  required 
                />
              </div>
              <div className="form-control">
                <label htmlFor="founded">Año de fundación</label>
                <input 
                  id="founded"
                  name="founded" 
                  type="number" 
                  value={editForm.founded} 
                  onChange={handleEditChange} 
                  placeholder="Año fundación" 
                  required 
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={cancelEdit}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Crear Nuevo Equipo</h2>
        </div>
        <div className="card-body">
          <form className="team-form" onSubmit={handleSubmit}>
            <div className="form-control">
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Nombre del equipo" 
                required 
              />
            </div>
            <div className="form-control">
              <input 
                name="city" 
                value={form.city} 
                onChange={handleChange} 
                placeholder="Ciudad" 
                required 
              />
            </div>
            <div className="form-control">
              <input 
                name="founded" 
                type="number" 
                value={form.founded} 
                onChange={handleChange} 
                placeholder="Año fundación" 
                required 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <i className="fas fa-plus btn-icon"></i>
              {loading ? 'Creando...' : 'Crear Equipo'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Equipos Registrados</h2>
        </div>
        <div className="card-body">
          {loading && <p className="loading">Cargando equipos...</p>}
          
          {!loading && teams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-futbol"></i>
              </div>
              <p className="empty-state-message">No hay equipos registrados</p>
              <p>Crea tu primer equipo utilizando el formulario de arriba.</p>
            </div>
          ) : (
            <ul className="team-list">
              {teams.map(team => (
                <li key={team.id || team._id} className="team-item">
                  <div className="team-logo">
                    {getInitials(team.name)}
                  </div>
                  <div className="team-info">
                    <div className="team-name">{team.name}</div>
                    <div className="team-details">
                      <span className="team-city"><i className="fas fa-map-marker-alt"></i> {team.city}</span>
                      <span className="team-founded"><i className="fas fa-calendar"></i> Fundado en {team.founded}</span>
                    </div>
                  </div>
                  <div className="team-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewTeam(team.id || team._id)}
                      title="Ver plantilla"
                    >
                      <i className="fas fa-users btn-icon"></i>
                      Plantilla
                    </button>
                    <button 
                      className="btn btn-icon-only" 
                      onClick={() => handleEditClick(team)}
                      title="Editar equipo"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn btn-icon-only delete-btn" 
                      onClick={() => handleDeleteClick(team.id || team._id, team.name)}
                      title="Eliminar equipo"
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
    </div>
  );
}

export default TeamSection;