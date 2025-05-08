import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import AttendanceModal from './AttendanceModal';
import '../../styles/_attendance.scss';

function AttendanceSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [week, setWeek] = useState(1);
  const [playerData, setPlayerData] = useState({});
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Obtener usuario desde localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if (user && user.team) {
      loadAttendanceData();
    }
  }, [week]);
  
  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Obtener asistencias de la semana actual
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/attendance/?week=${week}`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar las asistencias`);
      }
      
      const data = await response.json();
      setAttendances(data);
      
      // Obtener información de los jugadores
      const playersResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/players/`, {
        headers: authHeader()
      });
      
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        // Crear un mapa de jugadores para mostrar más información
        const playerMap = {};
        playersData.forEach(player => {
          playerMap[player.id] = player;
        });
        setPlayerData(playerMap);
      }
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAttendanceChange = async (attendanceId, field, value) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/attendance/`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: attendanceId,
          [field]: value
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo actualizar la asistencia`);
      }
      
      // Actualizar el estado local
      setAttendances(attendances.map(att => 
        att.id === attendanceId ? { ...att, [field]: value } : att
      ));
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Abre el modal filtrando registros de asistencia del jugador seleccionado
  const handleOpenAttendanceModal = (playerId) => {
    const records = attendances.filter(att => att.player === playerId);
    const player = playerData[playerId] || { name: 'Jugador', last_name: '' };
    setSelectedAttendance({ player, records });
  };
  
  const handleWeekChange = (newWeek) => {
    if (newWeek > 0) {
      setWeek(newWeek);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && attendances.length === 0) {
    return <div className="content-wrapper loading">Cargando datos de asistencia...</div>;
  }
  
  return (
    <div className="content-wrapper">
      <h2>Control de Asistencia</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="week-selector">
        <button 
          className="btn btn-small" 
          onClick={() => handleWeekChange(week - 1)}
          disabled={week === 1}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <span className="week-display">Semana {week}</span>
        <button 
          className="btn btn-small" 
          onClick={() => handleWeekChange(week + 1)}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Asistencia de Jugadores</h2>
        </div>
        <div className="card-body">
          {loading && <p className="loading">Actualizando datos...</p>}
          
          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th className="player-column">Jugador</th>
                  <th>Entrenamiento 1</th>
                  <th>Entrenamiento 2</th>
                  <th>Entrenamiento 3</th>
                  <th>Partido</th>
                </tr>
              </thead>
              <tbody>
                  {attendances.map(attendance => {
                    const player = playerData[attendance.player];
                    return (
                      <tr key={attendance.id}>
                        <td 
                          className="player-column" 
                          onClick={() => handleOpenAttendanceModal(attendance.player)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="player-info">
                            <div className="player-name">
                              {player 
                                ? `${player.name} ${player.last_name}` 
                                : `${attendance.player_name} ${attendance.player_last_name}`
                              }
                            </div>
                            {player && (
                              <div className="player-details">
                                <span className="player-number">{player.number}</span>
                                <span className="player-position">{player.position_display}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      <td>
                        <label className="attendance-checkbox">
                          <input 
                            type="checkbox" 
                            checked={attendance.training1}
                            onChange={() => handleAttendanceChange(attendance.id, 'training1', !attendance.training1)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td>
                        <label className="attendance-checkbox">
                          <input 
                            type="checkbox" 
                            checked={attendance.training2}
                            onChange={() => handleAttendanceChange(attendance.id, 'training2', !attendance.training2)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td>
                        <label className="attendance-checkbox">
                          <input 
                            type="checkbox" 
                            checked={attendance.training3}
                            onChange={() => handleAttendanceChange(attendance.id, 'training3', !attendance.training3)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td>
                        <label className="attendance-checkbox">
                          <input 
                            type="checkbox" 
                            checked={attendance.match}
                            onChange={() => handleAttendanceChange(attendance.id, 'match', !attendance.match)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {attendances.length > 0 && (
        <div className="attendance-stats">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Estadísticas de Asistencia</h2>
            </div>
            <div className="card-body">
              <div className="stats-summary">
                <div className="stat-item">
                  <div className="stat-value">
                    {Math.round(attendances.filter(a => a.training1).length / attendances.length * 100)}%
                  </div>
                  <div className="stat-label">Entrenamiento 1</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {Math.round(attendances.filter(a => a.training2).length / attendances.length * 100)}%
                  </div>
                  <div className="stat-label">Entrenamiento 2</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {Math.round(attendances.filter(a => a.training3).length / attendances.length * 100)}%
                  </div>
                  <div className="stat-label">Entrenamiento 3</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {Math.round(attendances.filter(a => a.match).length / attendances.length * 100)}%
                  </div>
                  <div className="stat-label">Partido</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAttendance && (
        <AttendanceModal 
          player={selectedAttendance.player} 
          attendanceRecords={selectedAttendance.records} 
          onClose={() => setSelectedAttendance(null)} 
        />
      )}
    </div>
  );
}

export default AttendanceSection;