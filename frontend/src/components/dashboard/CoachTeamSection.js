import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHeader } from '../../services/auth';
// Los estilos se importan desde main.scss o directamente si es necesario
import '../../styles/_coachTeamSection.scss'; 
  
function CoachTeamSection({ setActivePage }) {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stats
  const [playerCount, setPlayerCount] = useState(0);
  const [totalSessionsCount, setTotalSessionsCount] = useState(0); // Total de sesiones del coach
  const [nextSessionDate, setNextSessionDate] = useState(null);
  const [lastSessionDate, setLastSessionDate] = useState(null);

  // Data for cards
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [spotlightPlayer, setSpotlightPlayer] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]); // Para seleccionar el spotlight

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    //Ajustar por zona horaria si es necesario, o usar UTC
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    }).toUpperCase();
  };


  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user || !user.team) {
        setError('No tienes un equipo asignado o no estás logueado.');
        setLoading(false);
        return;
      }

      // 1. Fetch team details
      const teamResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/`, {
        headers: authHeader()
      });
      if (!teamResponse.ok) throw new Error(`Error ${teamResponse.status}: No se pudo cargar el equipo`);
      const teamData = await teamResponse.json();
      setTeam(teamData);

      // 2. Fetch players for the team
      const playersResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/players/`, {
        headers: authHeader()
      });
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        setAllPlayers(Array.isArray(playersData) ? playersData : []);
        setPlayerCount(Array.isArray(playersData) ? playersData.length : 0);
        if (Array.isArray(playersData) && playersData.length > 0) {
          // Seleccionar un jugador para el spotlight (ej. el primero)
          setSpotlightPlayer(playersData[0]);
        }
      } else {
        console.warn("No se pudo obtener la lista de jugadores.");
      }

      // 3. Fetch sessions for the coach
      const sessionsResponse = await fetch('http://localhost:8000/api/sessions/', {
        headers: authHeader()
      });
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        const coachSessions = Array.isArray(sessionsData) ? sessionsData : [];
        setTotalSessionsCount(coachSessions.length);

        if (coachSessions.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Para comparar solo fechas

          // Ordenar sesiones por fecha (más reciente primero por defecto desde el backend, si no, ordenar aquí)
          coachSessions.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
          
          // Última sesión (la más reciente en general)
          setLastSessionDate(coachSessions[0].date || coachSessions[0].created_at);

          // Próximas sesiones (futuras o de hoy)
          const futureSessions = coachSessions
            .filter(s => new Date(s.date || s.created_at) >= today)
            .sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at)); // más cercana primero
          
          if (futureSessions.length > 0) {
            setNextSessionDate(futureSessions[0].date || futureSessions[0].created_at);
            setUpcomingSessions(futureSessions.slice(0, 3)); // Tomar las próximas 3
          } else {
            setNextSessionDate(null); // No hay sesiones futuras
          }
          
          // Sesiones recientes (pasadas, las 3 más recientes)
          const pastSessions = coachSessions
            .filter(s => new Date(s.date || s.created_at) < today)
            .slice(0, 3); // Ya están ordenadas de más reciente a más antigua
          setRecentSessions(pastSessions);
        }
      } else {
         console.warn("No se pudo obtener la lista de sesiones.");
      }

    } catch (err) {
      setError(`Error cargando datos del dashboard: ${err.message}`);
      console.error("Error en loadDashboardData:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (pageKeyOrPath) => {
    if (['sessions', 'tasks', 'attendance', 'minutes'].includes(pageKeyOrPath)) {
      if (setActivePage) {
        setActivePage(pageKeyOrPath);
      } else {
        navigate('/dashboard'); 
      }
    } else if (pageKeyOrPath === 'team-management') {
      navigate(`/team/${user.team}`);
    } else if (pageKeyOrPath.startsWith('/')) {
      navigate(pageKeyOrPath);
    } else {
      if (setActivePage) {
        setActivePage(pageKeyOrPath);
      } else {
        navigate('/dashboard');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="content-wrapper coach-dashboard-overview-page is-loading">
        <div className="loading-spinner-container">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando datos del equipo...</span>
        </div>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="content-wrapper coach-dashboard-overview-page has-error">
        <div className="error-message-fullpage">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error al Cargar Datos</h2>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="btn btn-primary">Reintentar</button>
        </div>
      </div>
    );
  }
  
  if (!team) {
     return (
      <div className="content-wrapper coach-dashboard-overview-page no-team-assigned">
        <div className="empty-state-fullpage">
          <i className="fas fa-shield-alt"></i>
          <h2>No hay Equipo Asignado</h2>
          <p>{error || 'Parece que no tienes un equipo asignado. Contacta con un administrador.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper coach-dashboard-overview-page">
      {error && <div className="error-banner">{error}</div>}

      <section className="team-hero-header">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="team-crest-large">
            {team.name.split(' ').map(word => word[0]).join('').toUpperCase()}
          </div>
          <div className="team-info-main">
            <h1>{team.name}</h1>
            <p><i className="fas fa-map-marker-alt"></i> {team.city || 'N/A'} &nbsp;&nbsp;&nbsp; <i className="fas fa-calendar-alt"></i> Fundado en {team.founded || 'N/A'}</p>
          </div>
        </div>
      </section>

      <section className="quick-stats-bar">
        <div className="stat-item-large">
          <i className="fas fa-users stat-icon"></i>
          <div className="stat-value">{playerCount}</div>
          <div className="stat-label">Jugadores Activos</div>
        </div>
        <div className="stat-item-large">
          <i className="fas fa-running stat-icon"></i>
          <div className="stat-value">{totalSessionsCount}</div>
          <div className="stat-label">Sesiones Totales</div>
        </div>
        <div className="stat-item-large">
          <i className="fas fa-calendar-check stat-icon"></i>
          <div className="stat-value">{formatShortDate(nextSessionDate)}</div>
          <div className="stat-label">Próxima Sesión</div>
        </div>
        <div className="stat-item-large">
          <i className="fas fa-history stat-icon"></i>
          <div className="stat-value">{formatShortDate(lastSessionDate)}</div>
          <div className="stat-label">Última Sesión</div>
        </div>
      </section>

      <section className="main-content-grid-coach">
        <div className="key-actions-column">
          <h2>Acciones Rápidas</h2>
          <div className="action-buttons-grid">
            <button className="btn btn-primary-gradient large-action" onClick={() => handleNavigate('team-management')}>
              <i className="fas fa-users-cog"></i> Gestionar Plantilla
            </button>
            <button className="btn btn-secondary-gradient large-action" onClick={() => handleNavigate('sessions')}>
              <i className="fas fa-calendar-plus"></i> Planificar Sesión
            </button>
             <button className="btn btn-outline-gradient large-action" onClick={() => handleNavigate('tasks')}>
              <i className="fas fa-clipboard-list"></i> Ver Mis Tareas
            </button>
            <button className="btn btn-outline-gradient large-action" onClick={() => handleNavigate('attendance')}>
              <i className="fas fa-user-check"></i> Control Asistencia
            </button>
          </div>

          <div className="info-card upcoming-events-card">
            <h3><i className="fas fa-bell"></i> Próximas Sesiones</h3>
            {upcomingSessions.length > 0 ? (
              <ul>
                {upcomingSessions.map(session => (
                  <li key={session.id || session._id} className="event-training"> {/* Usar clase genérica o específica */}
                    <i className={`fas fa-running event-icon`}></i>
                    <div className="event-details">
                      <strong>Sesión del {formatDate(session.date || session.created_at)}</strong>
                      <span>{session.tasks_details && session.tasks_details.length > 0 ? session.tasks_details[0].title : 'Entrenamiento General'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data-message">No hay sesiones futuras planificadas.</p>
            )}
          </div>
        </div>

        <div className="team-insights-column">
           <div className="info-card team-activity-card">
            <h3><i className="fas fa-history"></i> Últimas Sesiones Registradas</h3>
            {recentSessions.length > 0 ? (
              <ul>
                {recentSessions.map(session => (
                  <li key={session.id || session._id}>
                    <i className={`fas fa-calendar-alt activity-icon`}></i>
                    <div className="activity-details">
                      <p>Sesión del {formatDate(session.date || session.created_at)}</p>
                      <span>{session.tasks_details?.length || 0} tareas, {session.players_details?.length || 0} jugadores.</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data-message">No hay sesiones recientes registradas.</p>
            )}
          </div>

          <div className="info-card player-spotlight-card">
            <h3><i className="fas fa-star"></i> Jugador del Equipo</h3>
            {spotlightPlayer ? (
              <>
                <div className="spotlight-content">
                  <div className="player-photo-placeholder">
                    {spotlightPlayer.photo_url ? 
                      <img src={spotlightPlayer.photo_url} alt={`${spotlightPlayer.name} ${spotlightPlayer.last_name}`} onError={(e) => e.target.style.display='none'}/> 
                      : <i className="fas fa-user"></i>}
                  </div>
                  <div className="spotlight-info">
                    <h4>{spotlightPlayer.name} {spotlightPlayer.last_name} (#{spotlightPlayer.number})</h4>
                    <p>Posición: {spotlightPlayer.position_display || spotlightPlayer.position}</p>
                    <p>Edad: {spotlightPlayer.age} años</p>
                    <p>Nacionalidad: {spotlightPlayer.nationality}</p>
                  </div>
                </div>
                <button className="btn btn-tertiary small-action" onClick={() => handleNavigate('team-management')}>Ver Plantilla Completa</button>
              </>
            ) : (
              <p className="no-data-message">No hay jugadores en el equipo para mostrar.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CoachTeamSection;