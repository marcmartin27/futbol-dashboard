import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import AttendanceModal from './AttendanceModal';

function AdminAttendanceSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Cargar equipos al iniciar
  useEffect(() => {
    loadTeams();
  }, []);

  // Cargar asistencia cuando se selecciona un equipo
  useEffect(() => {
    if (selectedTeam) {
      loadPlayers(selectedTeam.id);
      loadAttendance(selectedTeam.id, currentWeek);
    }
  }, [selectedTeam, currentWeek]);

  // Función para cargar todos los equipos
  const loadTeams = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8000/api/teams/', {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
      
      // Si hay equipos, seleccionar el primero automáticamente
      if (data.length > 0) {
        setSelectedTeam(data[0]);
      }
      
    } catch (err) {
      setError(`Error al cargar equipos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los jugadores de un equipo
  const loadPlayers = async (teamId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/teams/${teamId}/players/`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setPlayers(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError(`Error al cargar jugadores: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar asistencia de una semana específica
  const loadAttendance = async (teamId, week) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/teams/${teamId}/attendance/?week=${week}`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setWeeklyAttendance(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError(`Error al cargar asistencia: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar selección de equipo
  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    const team = teams.find(t => t.id === teamId || t._id === teamId);
    setSelectedTeam(team);
    setCurrentWeek(1); // Resetear semana al cambiar de equipo
  };

  // Función para cambiar la semana
  const handleWeekChange = (change) => {
    const newWeek = currentWeek + change;
    if (newWeek > 0) {
      setCurrentWeek(newWeek);
    }
  };

  // Función para cargar historial de asistencia de un jugador específico
  const loadPlayerAttendanceHistory = async (playerId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/teams/${selectedTeam.id}/attendance/?player=${playerId}`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
      
    } catch (err) {
      setError(`Error al cargar historial de asistencia: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar modal con historial de asistencia
  const handlePlayerSelect = async (player) => {
    const history = await loadPlayerAttendanceHistory(player.id);
    setAttendanceHistory(history);
    setSelectedPlayer(player);
  };

  // Función para filtrar jugadores por búsqueda
  const filteredAttendanceRecords = searchQuery 
    ? weeklyAttendance.filter(record => {
        // Buscar el jugador correspondiente
        const player = players.find(p => p.id === record.player || p._id === record.player);
        if (!player) return false;
        
        return player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               player.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               player.number.toString().includes(searchQuery);
      })
    : weeklyAttendance;

  // Función para obtener información del jugador
  const getPlayerInfo = (playerId) => {
    return players.find(p => p.id === playerId || p._id === playerId) || {};
  };

  // Estado de carga inicial
  if (loading && teams.length === 0) {
    return (
      <div className="content-wrapper">
        <h2>Control de Asistencia por Equipos</h2>
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando equipos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <h2>Control de Asistencia por Equipos</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-attendance-container">
        {/* Selector de equipo */}
        <div className="team-selector">
          <label htmlFor="team-select">Seleccionar Equipo:</label>
          <select 
            id="team-select" 
            onChange={handleTeamChange}
            value={selectedTeam ? selectedTeam.id || selectedTeam._id : ''}
          >
            {teams.map(team => (
              <option key={team.id || team._id} value={team.id || team._id}>
                {team.name} ({team.city})
              </option>
            ))}
          </select>
        </div>
        
        {/* Selector de semana */}
        <div className="week-selector">
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={() => handleWeekChange(-1)}
            disabled={currentWeek === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="week-display">Semana {currentWeek}</span>
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={() => handleWeekChange(1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        {/* Buscador */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        
        {/* Tabla de asistencia */}
        <div className="attendance-table-container">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Cargando datos de asistencia...</span>
            </div>
          ) : weeklyAttendance.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-list"></i>
              <p>No hay registros de asistencia para esta semana</p>
            </div>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th className="player-column">Jugador</th>
                  <th>Entrenamiento 1</th>
                  <th>Entrenamiento 2</th>
                  <th>Entrenamiento 3</th>
                  <th>Partido</th>
                  <th>Estado General</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendanceRecords.map(record => {
                  const player = getPlayerInfo(record.player);
                  // Calcular asistencia total
                  const attendedSessions = [record.training1, record.training2, record.training3, record.match].filter(Boolean).length;
                  const totalSessions = 4; // 3 entrenamientos + 1 partido
                  const attendancePercentage = Math.round((attendedSessions / totalSessions) * 100);
                  
                  // Determinar clase de estado
                  let statusClass = 'status-neutral';
                  if (attendancePercentage >= 75) statusClass = 'status-good';
                  else if (attendancePercentage >= 50) statusClass = 'status-warning';
                  else statusClass = 'status-bad';
                  
                  return (
                    <tr 
                      key={record.id || record._id}
                      onClick={() => handlePlayerSelect(player)}
                      className="clickable-row"
                    >
                      <td className="player-column">
                        <div className="player-info">
                          <div className="player-number">{player.number || '?'}</div>
                          <div className="player-name">
                            {player.name || ''} {player.last_name || ''}
                          </div>
                        </div>
                      </td>
                      <td className={record.training1 ? 'present' : 'absent'}>
                        <i className={`fas fa-${record.training1 ? 'check' : 'times'}`}></i>
                      </td>
                      <td className={record.training2 ? 'present' : 'absent'}>
                        <i className={`fas fa-${record.training2 ? 'check' : 'times'}`}></i>
                      </td>
                      <td className={record.training3 ? 'present' : 'absent'}>
                        <i className={`fas fa-${record.training3 ? 'check' : 'times'}`}></i>
                      </td>
                      <td className={record.match ? 'present' : 'absent'}>
                        <i className={`fas fa-${record.match ? 'check' : 'times'}`}></i>
                      </td>
                      <td>
                        <div className={`attendance-status ${statusClass}`}>
                          {attendancePercentage}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Estadísticas de asistencia */}
        {weeklyAttendance.length > 0 && (
          <div className="attendance-stats-container">
            <div className="stats-card">
              <div className="stats-title">Entrenamiento 1</div>
              <div className="stats-value">
                {Math.round(weeklyAttendance.filter(a => a.training1).length / weeklyAttendance.length * 100)}%
              </div>
              <div className="stats-detail">
                {weeklyAttendance.filter(a => a.training1).length} de {weeklyAttendance.length} jugadores
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-title">Entrenamiento 2</div>
              <div className="stats-value">
                {Math.round(weeklyAttendance.filter(a => a.training2).length / weeklyAttendance.length * 100)}%
              </div>
              <div className="stats-detail">
                {weeklyAttendance.filter(a => a.training2).length} de {weeklyAttendance.length} jugadores
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-title">Entrenamiento 3</div>
              <div className="stats-value">
                {Math.round(weeklyAttendance.filter(a => a.training3).length / weeklyAttendance.length * 100)}%
              </div>
              <div className="stats-detail">
                {weeklyAttendance.filter(a => a.training3).length} de {weeklyAttendance.length} jugadores
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-title">Partido</div>
              <div className="stats-value">
                {Math.round(weeklyAttendance.filter(a => a.match).length / weeklyAttendance.length * 100)}%
              </div>
              <div className="stats-detail">
                {weeklyAttendance.filter(a => a.match).length} de {weeklyAttendance.length} jugadores
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de historial de asistencia */}
      {selectedPlayer && (
        <AttendanceModal
          player={selectedPlayer}
          attendanceRecords={attendanceHistory}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}

export default AdminAttendanceSection;