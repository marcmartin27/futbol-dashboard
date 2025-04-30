// src/components/dashboard/TeamSection.js
import React from 'react';
import '../../styles/main.scss';

function TeamSection({ teams, form, loading, error, handleChange, handleSubmit, getInitials }) {
  return (
    <div className="content-wrapper">
      {error && <div className="error-message">{error}</div>}
      
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
                    <button className="btn btn-icon-only" title="Editar equipo">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-icon-only" title="Eliminar equipo">
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