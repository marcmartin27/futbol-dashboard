import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHeader } from '../../services/auth';

function CoachInicio() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtener usuario desde localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (!user.team) {
        setError('No tienes un equipo asignado');
        setLoading(false);
        return;
      }

      // Cargar datos del equipo
      await loadTeamData();
      
      // Cargar tareas recientes
      await loadRecentTasks();
      
      // Cargar próximas sesiones
      await loadUpcomingSessions();
      
      // Cargar estadísticas de asistencia
      await loadAttendanceStats();
      
    } catch (err) {
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamData = async () => {
    try {
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
    } catch (error) {
      console.error("Error cargando equipo:", error);
      throw error;
    }
  };

  const loadRecentTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks/', {
        headers: authHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        // Ordenar por fecha y tomar las 3 más recientes
        const sortedTasks = Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())).slice(0, 3)
          : [];
        setRecentTasks(sortedTasks);
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  const loadUpcomingSessions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/sessions/', {
        headers: authHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar sesiones futuras y ordenar por fecha
        const now = new Date();
        const upcoming = Array.isArray(data)
          ? data
              .filter(session => new Date(session.date) >= now)
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 2)
          : [];
        setUpcomingSessions(upcoming);
      }
    } catch (error) {
      console.error("Error cargando sesiones:", error);
    }
  };

  const loadAttendanceStats = async () => {
    try {
      const currentWeek = Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000 / 7);
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/attendance/?week=${currentWeek}`, {
        headers: authHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Calcular porcentajes de asistencia
          const stats = {
            totalPlayers: data.length,
            training1Percent: Math.round(data.filter(a => a.training1).length / data.length * 100),
            training2Percent: Math.round(data.filter(a => a.training2).length / data.length * 100),
            training3Percent: Math.round(data.filter(a => a.training3).length / data.length * 100),
            matchPercent: Math.round(data.filter(a => a.match).length / data.length * 100)
          };
          setAttendanceStats(stats);
        }
      }
    } catch (error) {
      console.error("Error cargando estadísticas de asistencia:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Navegación rápida a diferentes secciones
  const navigateTo = (section) => {
    navigate(`/dashboard`);
    // Esta función debería llamar a setActivePage que viene como prop del Dashboard
    // O puedes usar eventos o un contexto global para comunicarte con Dashboard
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="dashboard-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando información del dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="coach-dashboard">
        {/* Bienvenida y resumen del equipo */}
        <div className="dashboard-welcome">
          <div className="welcome-header">
            <h2>¡Bienvenido al Dashboard, {user.first_name || user.username}!</h2>
            <p className="date-display">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          {team && (
            <div className="team-preview">
              <div className="team-avatar">
                {team.name.split(' ').map(word => word[0]).join('').toUpperCase()}
              </div>
              <div className="team-info">
                <h3>{team.name}</h3>
                <p>{team.city} - Fundado en {team.founded}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>{playerCount}</h3>
              <p>Jugadores en plantilla</p>
            </div>
            <div className="stat-action" onClick={() => navigate(`/team/${user.team}`)}>
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div className="stat-content">
              <h3>{recentTasks.length}</h3>
              <p>Tareas recientes</p>
            </div>
            <div className="stat-action" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stat-content">
              <h3>{upcomingSessions.length}</h3>
              <p>Sesiones programadas</p>
            </div>
            <div className="stat-action" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-stopwatch"></i>
            </div>
            <div className="stat-content">
              <h3>Control</h3>
              <p>Minutaje de partidos</p>
            </div>
            <div className="stat-action" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>

        {/* Secciones principales */}
        <div className="dashboard-sections">
          {/* Próximas sesiones */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3><i className="fas fa-calendar-day"></i> Próximas Sesiones</h3>
              <button className="view-all-btn" onClick={() => navigate('/dashboard')}>
                Ver todas
              </button>
            </div>
            
            <div className="section-content">
              {upcomingSessions.length > 0 ? (
                <div className="sessions-preview">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="session-card-mini">
                      <div className="session-date">
                        <i className="fas fa-calendar"></i> {formatDate(session.date)}
                      </div>
                      <div className="session-details">
                        <div className="session-tasks">
                          <i className="fas fa-clipboard-list"></i> 
                          {session.tasks_details?.length || 4} tareas
                        </div>
                        <div className="session-players">
                          <i className="fas fa-users"></i> 
                          {session.players_details?.length || 'N/A'} jugadores
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-preview">
                  <i className="fas fa-calendar-times"></i>
                  <p>No tienes sesiones programadas próximamente</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Tareas recientes */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3><i className="fas fa-tasks"></i> Tareas Recientes</h3>
              <button className="view-all-btn" onClick={() => navigate('/dashboard')}>
                Ver todas
              </button>
            </div>
            
            <div className="section-content">
              {recentTasks.length > 0 ? (
                <div className="tasks-preview">
                  {recentTasks.map((task, index) => (
                    <div key={index} className="task-card-mini">
                      <div className="task-image">
                        <img src={task.image} alt={task.title} />
                      </div>
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        <div className="task-meta">
                          <span className="task-category">{task.category}</span>
                          <span className="task-duration"><i className="fas fa-clock"></i> {task.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-preview">
                  <i className="fas fa-clipboard"></i>
                  <p>No has creado tareas recientemente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas de asistencia */}
        {attendanceStats && (
          <div className="dashboard-section full-width">
            <div className="section-header">
              <h3><i className="fas fa-clipboard-check"></i> Asistencia Semanal</h3>
              <button className="view-all-btn" onClick={() => navigate('/dashboard')}>
                Gestionar
              </button>
            </div>
            
            <div className="section-content">
              <div className="attendance-preview">
                <div className="attendance-card">
                  <div className="attendance-percent">{attendanceStats.training1Percent}%</div>
                  <div className="attendance-label">Entrenamiento 1</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${attendanceStats.training1Percent}%`}}></div>
                  </div>
                </div>
                
                <div className="attendance-card">
                  <div className="attendance-percent">{attendanceStats.training2Percent}%</div>
                  <div className="attendance-label">Entrenamiento 2</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${attendanceStats.training2Percent}%`}}></div>
                  </div>
                </div>
                
                <div className="attendance-card">
                  <div className="attendance-percent">{attendanceStats.training3Percent}%</div>
                  <div className="attendance-label">Entrenamiento 3</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${attendanceStats.training3Percent}%`}}></div>
                  </div>
                </div>
                
                <div className="attendance-card">
                  <div className="attendance-percent">{attendanceStats.matchPercent}%</div>
                  <div className="attendance-label">Partido</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${attendanceStats.matchPercent}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoachInicio;