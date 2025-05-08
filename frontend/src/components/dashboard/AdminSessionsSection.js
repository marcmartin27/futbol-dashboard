import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';

function AdminSessionsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionsByCoach, setSessionsByCoach] = useState({});
  const [coaches, setCoaches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadAllSessions();
  }, []);

  // Cargar todas las sesiones y agruparlas por entrenador
  const loadAllSessions = async () => {
    try {
      setLoading(true);
      
      // Obtener lista de entrenadores
      const coachesResponse = await fetch('http://localhost:8000/api/users/', {
        headers: authHeader()
      });
      
      if (!coachesResponse.ok) {
        throw new Error(`Error ${coachesResponse.status}`);
      }
      
      const coachesData = await coachesResponse.json();
      const coachesList = coachesData.filter(user => user.role === 'coach');
      setCoaches(coachesList);
      
      // Obtener todas las sesiones (API modificada para admins)
      const sessionsResponse = await fetch('http://localhost:8000/api/sessions/all/', {
        headers: authHeader()
      });
      
      if (!sessionsResponse.ok) {
        throw new Error(`Error ${sessionsResponse.status}`);
      }
      
      const sessionsData = await sessionsResponse.json();
      
      // Agrupar sesiones por entrenador
      const sessionGroups = {};
      
      sessionsData.forEach(session => {
        const coachId = session.owner;
        if (!sessionGroups[coachId]) {
          sessionGroups[coachId] = [];
        }
        sessionGroups[coachId].push(session);
      });
      
      setSessionsByCoach(sessionGroups);
      
    } catch (err) {
      setError(`Error al cargar las sesiones: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombre completo del entrenador por ID
  const getCoachName = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    if (coach) {
      if (coach.first_name && coach.last_name) {
        return `${coach.first_name} ${coach.last_name}`;
      }
      return coach.username;
    }
    return "Entrenador desconocido";
  };

  // Obtener equipo del entrenador por ID
  const getCoachTeam = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    return coach?.team_name || "Sin equipo asignado";
  };

  // Obtener iniciales del nombre
  const getInitials = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    if (coach) {
      if (coach.first_name && coach.last_name) {
        return `${coach.first_name[0]}${coach.last_name[0]}`.toUpperCase();
      }
      return coach.username.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  // Obtener iniciales del jugador
  const getPlayerInitials = (player) => {
    if (player.name && player.last_name) {
      return `${player.name[0]}${player.last_name[0]}`.toUpperCase();
    }
    return "??";
  };

  // Filtrar sesiones basado en búsqueda y fecha
  const filterSessions = (sessions) => {
    if (!searchTerm && !filterDate) return sessions;
    
    return sessions.filter(session => {
      // Buscar en nombres de tareas
      const taskNames = session.tasks_details.map(task => task.title.toLowerCase());
      const matchesSearch = !searchTerm || 
        taskNames.some(title => title.includes(searchTerm.toLowerCase()));
      
      // Filtrar por fecha
      const matchesDate = !filterDate || session.date.substring(0, 10) === filterDate;
      
      return matchesSearch && matchesDate;
    });
  };

  // Calcular duración total de la sesión
  const calculateSessionDuration = (session) => {
    if (!session.tasks_details || !session.tasks_details.length) return 0;
    
    return session.tasks_details.reduce((total, task) => {
      return total + (parseInt(task.duration) || 0);
    }, 0);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', options);
    } catch (e) {
      return dateString;
    }
  };

  // Resetear filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <h2>Sesiones por Entrenador</h2>
        <div className="admin-loading">
          <i className="fas fa-spinner spinner"></i>
          <span>Cargando sesiones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <h2>Sesiones por Entrenador</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="admin-sessions-container">
        {/* Filtros */}
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="search">Buscar sesiones</label>
            <input
              id="search"
              type="text"
              placeholder="Buscar por nombre de tarea"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="date">Filtrar por fecha</label>
            <input
              id="date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          
          <div className="filter-actions">
            <button className="btn-secondary" onClick={handleClearFilters}>
              <i className="fas fa-times"></i>
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Si no hay sesiones */}
        {Object.keys(sessionsByCoach).length === 0 && (
          <div className="admin-empty-state">
            <i className="fas fa-calendar-alt icon"></i>
            <p className="title">No hay sesiones creadas</p>
            <p className="description">Los entrenadores aún no han creado sesiones en el sistema.</p>
          </div>
        )}

        {/* Lista de entrenadores con sus sesiones */}
        {Object.keys(sessionsByCoach).map(coachId => {
          const sessions = sessionsByCoach[coachId];
          const filteredSessions = filterSessions(sessions);
          
          // No mostrar secciones vacías después del filtrado
          if (filteredSessions.length === 0) return null;
          
          return (
            <div key={coachId} className="coach-section">
              <div className="coach-header">
                <div className="coach-avatar">
                  {getInitials(coachId)}
                </div>
                <div className="coach-info">
                  <div className="coach-name">{getCoachName(coachId)}</div>
                  <div className="coach-team">
                    <i className="fas fa-futbol"></i>
                    {getCoachTeam(coachId)}
                  </div>
                </div>
                <div className="session-count">
                  {filteredSessions.length} {filteredSessions.length === 1 ? 'sesión' : 'sesiones'}
                </div>
              </div>
              
              <div className="coach-sessions">
                {filteredSessions.map(session => (
                  <div key={session.id || session._id} className="admin-session-card">
                    <div className="session-header">
                      <div className="session-date">
                        <i className="fas fa-calendar"></i>
                        {formatDate(session.date)}
                      </div>
                      <div className="session-duration">
                        <i className="fas fa-clock"></i>
                        {calculateSessionDuration(session)} min
                      </div>
                    </div>
                    
                    <div className="session-content">
                      <div className="session-tasks">
                        <h3>
                          <i className="fas fa-clipboard-list"></i>
                          Tareas
                        </h3>
                        <div className="tasks-grid">
                          {session.tasks_details && session.tasks_details.map((task, index) => (
                            <div key={index} className="task-item">
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="session-players">
                        <h3>
                          <i className="fas fa-users"></i>
                          Jugadores
                          <span className="player-count">
                            ({session.players_details ? session.players_details.length : 0})
                          </span>
                        </h3>
                        
                        <div className="players-preview">
                          {session.players_details && session.players_details.slice(0, 8).map((player, index) => (
                            <div key={index} className="player-avatar" title={`${player.name} ${player.last_name}`}>
                              {getPlayerInitials(player)}
                            </div>
                          ))}
                          
                          {session.players_details && session.players_details.length > 8 && (
                            <div className="more-players">
                              +{session.players_details.length - 8}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="session-footer">
                      <div className="session-info">
                        <i className="fas fa-layer-group"></i>
                        {session.tasks_details ? session.tasks_details.length : 0} tareas
                      </div>
                      <div className="session-info">
                        <i className="fas fa-calendar-alt"></i>
                        Creada el {formatDate(session.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminSessionsSection;