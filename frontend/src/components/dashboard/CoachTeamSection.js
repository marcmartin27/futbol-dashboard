import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHeader } from '../../services/auth';

function CoachTeamSection() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  
  // Obtener usuario desde localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    loadTeamData();
  }, []);
  
  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      if (!user.team) {
        setError('No tienes un equipo asignado');
        setLoading(false);
        return;
      }
      
      // Cargar datos del equipo
      const teamResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/`, {
        headers: authHeader()
      });
      
      if (!teamResponse.ok) {
        throw new Error(`Error ${teamResponse.status}: No se pudo cargar el equipo`);
      }
      
      const teamData = await teamResponse.json();
      setTeam(teamData);
      
      // Cargar jugadores del equipo
      const playersResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/players/`, {
        headers: authHeader()
      });
      
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        setPlayerCount(Array.isArray(playersData) ? playersData.length : 0);
      }
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewPlantilla = () => {
    navigate(`/team/${user.team}`);
  };
  
  if (loading) {
    return <div className="content-wrapper loading">Cargando datos del equipo...</div>;
  }
  
  return (
    <div className="content-wrapper">
      {error && <div className="error-message">{error}</div>}
      
      {team ? (
        <div className="coach-team-section">
          <div className="team-header">
            <div className="team-badge">
              {team.name.split(' ').map(word => word[0]).join('').toUpperCase()}
            </div>
            <div className="team-title">
              <h1>{team.name}</h1>
              <div className="team-meta">
                <span><i className="fas fa-map-marker-alt"></i> {team.city}</span>
                <span><i className="fas fa-calendar"></i> Fundado en {team.founded}</span>
              </div>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn btn-primary" 
              onClick={handleViewPlantilla}
            >
              <i className="fas fa-users btn-icon"></i>
              Gestionar Plantilla
            </button>
          </div>
          
          <div className="team-summary">
            <h2>Resumen del Equipo</h2>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="summary-data">
                  <div className="summary-value">{playerCount}</div>
                  <div className="summary-label">Jugadores</div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">
                  <i className="fas fa-running"></i>
                </div>
                <div className="summary-data">
                  <div className="summary-value">0</div>
                  <div className="summary-label">Entrenamientos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <p className="empty-state-message">No tienes un equipo asignado</p>
          <p>Contacta con un administrador para que te asigne un equipo.</p>
        </div>
      )}
    </div>
  );
}

export default CoachTeamSection;