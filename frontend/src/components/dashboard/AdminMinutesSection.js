import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';

function AdminMinutesSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [minuteRecords, setMinuteRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar equipos al iniciar
  useEffect(() => {
    loadTeams();
  }, []);

  // Cargar partidos cuando se selecciona un equipo
  useEffect(() => {
    if (selectedTeam) {
      loadMatches(selectedTeam.id);
      setSelectedMatch(null); // Resetear partido seleccionado al cambiar de equipo
    }
  }, [selectedTeam]);

  // Cargar minutaje cuando se selecciona un partido
  useEffect(() => {
    if (selectedTeam && selectedMatch) {
      loadMinutesForMatch(selectedTeam.id, selectedMatch.date, selectedMatch.name);
    }
  }, [selectedMatch]);

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

  // Función para cargar los partidos de un equipo
  const loadMatches = async (teamId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api/teams/${teamId}/minutes/?matches=true`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setMatches(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError(`Error al cargar partidos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar minutaje de un partido específico
  const loadMinutesForMatch = async (teamId, matchDate, matchName) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost:8000/api/teams/${teamId}/minutes/?match_date=${matchDate}&match_name=${encodeURIComponent(matchName)}`, 
        {
          headers: authHeader()
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setMinuteRecords(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError(`Error al cargar minutaje: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar jugadores en el mintuaje por búsqueda
  const filteredMinuteRecords = searchQuery 
    ? minuteRecords.filter(record => 
        record.player_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        record.player_last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.player_number.toString().includes(searchQuery))
    : minuteRecords;

  // Función para manejar selección de equipo
  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    const team = teams.find(t => t.id === teamId || t._id === teamId);
    setSelectedTeam(team);
  };

  // Función para manejar selección de partido
  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Obtener posición formateada
  const formatPosition = (pos) => {
    const positions = {
      'POR': 'Portero',
      'DEF': 'Defensa Central',
      'LTD': 'Lateral Derecho',
      'LTI': 'Lateral Izquierdo',
      'MCD': 'Mediocentro Defensivo',
      'MC': 'Mediocentro',
      'MCO': 'Mediocentro Ofensivo',
      'ED': 'Extremo Derecho',
      'EI': 'Extremo Izquierdo',
      'SD': 'Segunda Punta',
      'DEL': 'Delantero'
    };
    return positions[pos] || pos;
  };

  // Estado de carga inicial
  if (loading && teams.length === 0) {
    return (
      <div className="content-wrapper">
        <h2>Minutaje por Equipos</h2>
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando equipos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <h2>Minutaje por Equipos</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-minutes-container">
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
        
        {/* Contenedor principal */}
        <div className="minutes-content">
          {/* Lista de partidos */}
          <div className="matches-list-container">
            <h3>Partidos</h3>
            {matches.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-times"></i>
                <p>No hay partidos registrados para este equipo</p>
              </div>
            ) : (
              <ul className="matches-list">
                {matches.map((match, index) => (
                  <li 
                    key={index} 
                    className={`match-item ${selectedMatch && selectedMatch.date === match.date && selectedMatch.name === match.name ? 'active' : ''}`}
                    onClick={() => handleMatchSelect(match)}
                  >
                    <div className="match-date">{formatDate(match.date)}</div>
                    <div className="match-name">{match.name}</div>
                    <div className="match-players">
                      <i className="fas fa-users"></i> {match.player_count} jugadores
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Detalles del minutaje */}
          <div className="minutes-details-container">
            {selectedMatch ? (
              <>
                <div className="minutes-header">
                  <h3>
                    Minutaje: {selectedMatch.name} ({formatDate(selectedMatch.date)})
                  </h3>
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
                </div>
                
                {loading ? (
                  <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Cargando minutaje...</span>
                  </div>
                ) : (
                  <>
                    {filteredMinuteRecords.length === 0 ? (
                      <div className="empty-state">
                        <i className="fas fa-user-slash"></i>
                        <p>No se encontraron registros de minutaje</p>
                      </div>
                    ) : (
                      <div className="minutes-table">
                        <table>
                          <thead>
                            <tr>
                              <th className="player-column">Jugador</th>
                              <th>Posición</th>
                              <th>Titular</th>
                              <th>Entrada</th>
                              <th>Salida</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMinuteRecords.map(record => (
                              <tr key={record.id || record._id}>
                                <td className="player-column">
                                  <div className="player-info">
                                    <div className="player-number">{record.player_number}</div>
                                    <div className="player-name">
                                      {record.player_name} {record.player_last_name}
                                    </div>
                                  </div>
                                </td>
                                <td>{formatPosition(record.player_position)}</td>
                                <td>
                                  <span className={`status-badge ${record.is_starter ? 'success' : 'neutral'}`}>
                                    {record.is_starter ? 'Sí' : 'No'}
                                  </span>
                                </td>
                                <td>{record.entry_minute !== null ? record.entry_minute : '-'}</td>
                                <td>{record.exit_minute !== null ? record.exit_minute : '-'}</td>
                                <td>
                                  <span className="minutes-badge">
                                    {record.minutes_played} min
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Estadísticas del partido */}
                    <div className="match-stats">
                      <div className="stat-card">
                        <div className="stat-title">Titulares</div>
                        <div className="stat-value">
                          {minuteRecords.filter(r => r.is_starter).length}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Suplentes Utilizados</div>
                        <div className="stat-value">
                          {minuteRecords.filter(r => !r.is_starter && r.minutes_played > 0).length}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Sin Participación</div>
                        <div className="stat-value">
                          {minuteRecords.filter(r => r.minutes_played === 0).length}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Promedio Minutos</div>
                        <div className="stat-value">
                          {Math.round(minuteRecords.reduce((acc, r) => acc + r.minutes_played, 0) / 
                            minuteRecords.filter(r => r.minutes_played > 0).length || 0)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="empty-state central">
                <i className="fas fa-hand-point-left"></i>
                <p>Selecciona un partido para ver el minutaje</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMinutesSection;