import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';

function AdminSessionsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);

  // Cargar entrenadores y equipos al iniciar
  useEffect(() => {
    loadTeamsAndCoaches();
  }, []);

  // Cargar sesiones cuando se selecciona un entrenador
  useEffect(() => {
    if (selectedCoach) {
      loadCoachSessions(selectedCoach);
    } else {
      loadAllSessions();
    }
  }, [selectedCoach]);

  // Función para cargar equipos y entrenadores
  const loadTeamsAndCoaches = async () => {
    try {
      setLoading(true);
      
      // Cargar equipos
      const teamsResponse = await fetch('http://localhost:8000/api/teams/', {
        headers: authHeader()
      });
      
      if (!teamsResponse.ok) {
        throw new Error(`Error ${teamsResponse.status}`);
      }
      
      const teamsData = await teamsResponse.json();
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      
      // Cargar usuarios (filtrar entrenadores)
      const usersResponse = await fetch('http://localhost:8000/api/users/', {
        headers: authHeader()
      });
      
      if (!usersResponse.ok) {
        throw new Error(`Error ${usersResponse.status}`);
      }
      
      const usersData = await usersResponse.json();
      const coachesData = usersData.filter(user => user.role === 'coach');
      setCoaches(coachesData);
      
      // Cargar todas las sesiones inicialmente
      await loadAllSessions();
      
    } catch (err) {
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar todas las sesiones
  const loadAllSessions = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8000/api/sessions/admin/', {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError(`Error al cargar sesiones: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar sesiones de un entrenador específico
  const loadCoachSessions = async (coachId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/sessions/admin/?coach=${coachId}`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError(`Error al cargar sesiones del entrenador: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar detalles de una sesión específica
  const loadSessionDetails = async (sessionId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/sessions/${sessionId}/`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setSessionDetails(data);
      
    } catch (err) {
      setError(`Error al cargar detalles de la sesión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar selección de entrenador
  const handleCoachChange = (e) => {
    const coachId = e.target.value;
    setSelectedCoach(coachId === 'all' ? null : coachId);
  };

  // Función para manejar búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Función para manejar cambios en el rango de fechas
  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  // Función para abrir modal de sesión
  const handleSessionClick = (session) => {
    setSelectedSession(session);
    loadSessionDetails(session.id || session._id);
  };

  // Filtrar sesiones por búsqueda y rango de fechas
  const filteredSessions = sessions.filter(session => {
    // Filtrar por búsqueda en tareas
    const searchMatch = !searchQuery || 
      (session.tasks_details && session.tasks_details.some(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      ));

    // Filtrar por rango de fechas
    let dateMatch = true;
    
    if (dateRange.startDate) {
      const sessionDate = new Date(session.date);
      const startDate = new Date(dateRange.startDate);
      dateMatch = dateMatch && sessionDate >= startDate;
    }
    
    if (dateRange.endDate) {
      const sessionDate = new Date(session.date);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59); // Incluir todo el día final
      dateMatch = dateMatch && sessionDate <= endDate;
    }
    
    return searchMatch && dateMatch;
  });

  // Agrupar sesiones por entrenador
  const sessionsByCoach = filteredSessions.reduce((acc, session) => {
    const coachId = session.owner;
    if (!acc[coachId]) {
      acc[coachId] = [];
    }
    acc[coachId].push(session);
    return acc;
  }, {});

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Obtener nombre del entrenador por ID
  const getCoachName = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    if (coach) {
      return coach.first_name && coach.last_name 
        ? `${coach.first_name} ${coach.last_name}` 
        : coach.username;
    }
    return 'Entrenador desconocido';
  };

  // Obtener nombre del equipo por ID
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId || t._id === teamId);
    return team ? team.name : 'Equipo no asignado';
  };

  // Obtener equipo del entrenador
  const getCoachTeam = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    if (coach && coach.team) {
      return getTeamName(coach.team);
    }
    return 'Sin equipo asignado';
  };

  // Obtener iniciales del nombre del entrenador
  const getCoachInitials = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    if (coach) {
      if (coach.first_name && coach.last_name) {
        return `${coach.first_name[0]}${coach.last_name[0]}`.toUpperCase();
      }
      return coach.username.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  // Calcular duración total de la sesión
  const calculateSessionDuration = (session) => {
    if (!session.tasks_details || !session.tasks_details.length) {
      return 0;
    }
    
    return session.tasks_details.reduce((total, task) => {
      return total + (parseInt(task.duration) || 0);
    }, 0);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setDateRange({ startDate: '', endDate: '' });
  };

  // Renderizar estado de carga
  if (loading && sessions.length === 0) {
    return (
      <div className="content-wrapper">
        <h2>Administración de Sesiones</h2>
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando sesiones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <h2>Administración de Sesiones</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-sessions-container">
        {/* Filtros y selectores */}
        <div className="sessions-filters">
          <div className="coach-selector">
            <label htmlFor="coach-select">Filtrar por Entrenador:</label>
            <select 
              id="coach-select" 
              onChange={handleCoachChange}
              value={selectedCoach || 'all'}
            >
              <option value="all">Todos los entrenadores</option>
              {coaches.map(coach => (
                <option key={coach.id || coach._id} value={coach.id || coach._id}>
                  {coach.first_name && coach.last_name 
                    ? `${coach.first_name} ${coach.last_name}` 
                    : coach.username} ({getCoachTeam(coach.id || coach._id)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="search-filters">
            <div className="search-input">
              <input
                type="text"
                placeholder="Buscar en tareas..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            <div className="date-filters">
              <div className="date-range">
                <label>Desde:</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                />
              </div>
              <div className="date-range">
                <label>Hasta:</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                />
              </div>
            </div>
            
            {(searchQuery || dateRange.startDate || dateRange.endDate) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        
        {/* Estado vacío */}
        {Object.keys(sessionsByCoach).length === 0 && (
          <div className="empty-state">
            <i className="fas fa-calendar-alt"></i>
            <p>No se encontraron sesiones con los filtros actuales</p>
            {(searchQuery || dateRange.startDate || dateRange.endDate) && (
              <button className="btn btn-secondary" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}
        
        {/* Sesiones agrupadas por entrenador */}
        {Object.keys(sessionsByCoach).map(coachId => (
          <div key={coachId} className="coach-sessions-group">
            <div className="coach-header">
              <div className="coach-avatar">
                {getCoachInitials(coachId)}
              </div>
              <div className="coach-info">
                <div className="coach-name">{getCoachName(coachId)}</div>
                <div className="coach-team">{getCoachTeam(coachId)}</div>
              </div>
              <div className="sessions-count">
                {sessionsByCoach[coachId].length} {sessionsByCoach[coachId].length === 1 ? 'sesión' : 'sesiones'}
              </div>
            </div>
            
            <div className="sessions-grid">
              {sessionsByCoach[coachId].map(session => (
                <div 
                  key={session.id || session._id} 
                  className="session-card"
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="session-header">
                    <div className="session-date">
                      <i className="fas fa-calendar"></i> {formatDate(session.date)}
                    </div>
                    <div className="session-created">
                      <i className="fas fa-clock"></i> Creada: {formatDate(session.created_at)}
                    </div>
                  </div>
                  
                  <div className="session-body">
                    <div className="session-tasks">
                      <h3>Tareas ({session.tasks_details ? session.tasks_details.length : 0})</h3>
                      <ul className="task-list">
                        {session.tasks_details && session.tasks_details.map(task => (
                          <li key={task.id || task._id} className="task-item">
                            <span className="task-title">{task.title}</span>
                            <span className="task-duration">{task.duration}min</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="session-players">
                      <h3>
                        Jugadores ({session.players_details ? session.players_details.length : 0})
                      </h3>
                      <div className="player-avatars">
                        {session.players_details && session.players_details.slice(0, 5).map(player => (
                          <div 
                            key={player.id || player._id} 
                            className="player-avatar" 
                            title={`${player.name} ${player.last_name}`}
                          >
                            {player.name[0]}{player.last_name[0]}
                          </div>
                        ))}
                        
                        {session.players_details && session.players_details.length > 5 && (
                          <div className="player-avatar more">
                            +{session.players_details.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="session-footer">
                    <div className="session-duration">
                      <i className="fas fa-hourglass-half"></i>
                      Duración total: {calculateSessionDuration(session)} min
                    </div>
                    <button className="view-details-btn">
                      <i className="fas fa-eye"></i> Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal de detalles de sesión */}
      {selectedSession && (
        <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="session-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Sesión</h2>
              <button className="close-modal" onClick={() => setSelectedSession(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {loading ? (
              <div className="modal-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Cargando detalles...</span>
              </div>
            ) : (
              <div className="modal-content">
                <div className="session-meta">
                  <div className="meta-item">
                    <i className="fas fa-calendar"></i>
                    <span>Fecha: {formatDate(selectedSession.date)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-user"></i>
                    <span>Entrenador: {getCoachName(selectedSession.owner)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-futbol"></i>
                    <span>Equipo: {getCoachTeam(selectedSession.owner)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="fas fa-clock"></i>
                    <span>Duración: {calculateSessionDuration(selectedSession)} minutos</span>
                  </div>
                </div>
                
                <div className="session-detail-sections">
                  <div className="detail-section">
                    <h3>Tareas de la Sesión</h3>
                    <div className="tasks-detail-grid">
                      {selectedSession.tasks_details && selectedSession.tasks_details.map(task => (
                        <div key={task.id || task._id} className="task-detail-card">
                          <div className="task-image">
                            <img src={task.image} alt={task.title} onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "https://via.placeholder.com/150?text=Sin+imagen"
                            }} />
                          </div>
                          <div className="task-detail-content">
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <div className="task-detail-meta">
                              <span><i className="fas fa-users"></i> {task.participants} jugadores</span>
                              <span><i className="fas fa-clock"></i> {task.duration} min</span>
                              <span><i className="fas fa-tag"></i> {task.category}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Jugadores Seleccionados</h3>
                    <div className="players-detail-grid">
                      {selectedSession.players_details && selectedSession.players_details.map(player => (
                        <div key={player.id || player._id} className="player-detail-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-detail-name">
                            {player.name} {player.last_name}
                          </div>
                          <div className="player-position">{player.position}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSession(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSessionsSection;