import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import '../../styles/_minutes.scss';

function MinutesSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerMinutes, setPlayerMinutes] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [currentMatch, setCurrentMatch] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
  });

  // Nuevos estados para el historial de partidos
  const [matches, setMatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [filteredMatches, setFilteredMatches] = useState([]);

  // Obtener usuario desde localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if (user && user.team) {
      loadPlayerData();
      loadMatches(); // Cargar partidos al inicio
    }
  }, []);
  
  // Filtrar partidos cuando cambian los criterios
  useEffect(() => {
    if (matches.length > 0) {
      let result = [...matches];
      
      // Filtrar por texto
      if (searchQuery) {
        result = result.filter(match => 
          match.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Filtrar por fecha inicial
      if (dateRange.start) {
        result = result.filter(match => match.date >= dateRange.start);
      }
      
      // Filtrar por fecha final
      if (dateRange.end) {
        result = result.filter(match => match.date <= dateRange.end);
      }
      
      setFilteredMatches(result);
    }
  }, [matches, searchQuery, dateRange]);
  
  const loadPlayerData = async () => {
    try {
      setLoading(true);
      
      // Cargar jugadores del equipo
      const playersResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/players/`, {
        headers: authHeader()
      });
      
      if (!playersResponse.ok) {
        throw new Error(`Error ${playersResponse.status}: No se pudieron cargar los jugadores`);
      }
      
      const playersData = await playersResponse.json();
      
      // Crear un mapa de jugadores para mostrar información
      const playerMap = {};
      playersData.forEach(player => {
        playerMap[player.id] = player;
      });
      setPlayerData(playerMap);
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Nueva función para cargar partidos
  const loadMatches = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost:8000/api/teams/${user.team}/minutes/?matches=true`, 
        { headers: authHeader() }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar los partidos`);
      }
      
      const data = await response.json();
      setMatches(data);
      setFilteredMatches(data);
      
    } catch (err) {
      setError(`Error cargando partidos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPlayerMinutes = async (date, name) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost:8000/api/teams/${user.team}/minutes/?match_date=${date}&match_name=${name}&auto_create=true`, 
        { headers: authHeader() }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar los minutos de los jugadores`);
      }
      
      const data = await response.json();
      setPlayerMinutes(data);
      
      // Actualizar currentMatch
      setCurrentMatch({
        date: date,
        name: name
      });
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMatchChange = (e) => {
    const { name, value } = e.target;
    setCurrentMatch(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectMatch = (match) => {
    loadPlayerMinutes(match.date, match.name);
  };
  
  const handleSearchMatch = (e) => {
    e.preventDefault();
    if (currentMatch.date && currentMatch.name) {
      loadPlayerMinutes(currentMatch.date, currentMatch.name);
    } else {
      setError("Se requiere la fecha y el nombre del partido");
    }
  };
  
  const handleMinuteChange = async (minuteId, field, value) => {
    try {
      setLoading(true);
      
      // Validar los valores de minutos
      if ((field === 'entry_minute' || field === 'exit_minute') && 
          (value < 0 || value > 120)) {
        throw new Error("Los minutos deben estar entre 0 y 120");
      }
      
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/minutes/`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: minuteId,
          [field]: field === 'is_starter' ? value : parseInt(value)
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo actualizar el registro`);
      }
      
      const updatedMinute = await response.json();
      
      // Actualizar el estado local
      setPlayerMinutes(playerMinutes.map(minute => 
        minute.id === minuteId ? updatedMinute : minute
      ));
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && playerMinutes.length === 0) {
    return <div className="content-wrapper loading">Cargando datos...</div>;
  }
  
  return (
    <div className="content-wrapper">
      <h2>Control de Minutaje</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Sección para crear/buscar partido específico */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Crear Nuevo Partido</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearchMatch} className="match-form">
            <div className="form-group">
              <label>Fecha del partido</label>
              <input 
                type="date" 
                name="date"
                value={currentMatch.date}
                onChange={handleMatchChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Nombre del partido (Rival)</label>
              <input 
                type="text" 
                name="name"
                value={currentMatch.name}
                onChange={handleMatchChange}
                placeholder="Ej: vs. Real Madrid"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-search"></i> Buscar/Crear
            </button>
          </form>
        </div>
      </div>
      
      {/* Nueva sección para el historial de partidos */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Historial de Partidos</h2>
        </div>
        <div className="card-body">
          <div className="matches-filters">
            <div className="filter-section">
              <div className="filter-group">
                <label>Buscar partido</label>
                <input 
                  type="text" 
                  placeholder="Nombre del rival..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="filter-dates">
                <div className="filter-group">
                  <label>Desde</label>
                  <input 
                    type="date" 
                    name="start"
                    value={dateRange.start}
                    onChange={handleDateChange}
                  />
                </div>
                <div className="filter-group">
                  <label>Hasta</label>
                  <input 
                    type="date" 
                    name="end"
                    value={dateRange.end}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {filteredMatches.length > 0 ? (
            <div className="matches-list">
              {filteredMatches.map((match, index) => (
                <div 
                  key={index} 
                  className="match-item"
                  onClick={() => handleSelectMatch(match)}
                >
                  <div className="match-date">
                    {new Date(match.date).toLocaleDateString()}
                  </div>
                  <div className="match-name">{match.name}</div>
                  <div className="match-players">
                    <i className="fas fa-users"></i> {match.player_count} jugadores
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-calendar"></i>
              </div>
              <p className="empty-state-message">No hay partidos registrados</p>
              <p>Utiliza el formulario para crear tu primer registro de partido.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Sección de minutaje */}
      {playerMinutes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              Minutaje: {currentMatch.name} ({currentMatch.date})
            </h2>
          </div>
          <div className="card-body">
            {loading && <p className="loading">Actualizando datos...</p>}
            
            <div className="minutes-table">
              <table>
                <thead>
                  <tr>
                    <th className="player-column">Jugador</th>
                    <th>Titular</th>
                    <th>Min. Jugados</th>
                    <th>Min. Entrada</th>
                    <th>Min. Salida</th>
                  </tr>
                </thead>
                <tbody>
                  {playerMinutes.map(minute => {
                    const player = playerData[minute.player];
                    return (
                      <tr key={minute.id}>
                        <td className="player-column">
                          <div className="player-info">
                            <div className="player-name">
                              {player ? `${player.name} ${player.last_name}` : 
                                `${minute.player_name} ${minute.player_last_name}`}
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
                          <label className="minutes-checkbox">
                            <input 
                              type="checkbox" 
                              checked={minute.is_starter}
                              onChange={() => handleMinuteChange(minute.id, 'is_starter', !minute.is_starter)}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </td>
                        <td>
                          <span className="minutes-display">
                            {minute.is_starter 
                              ? (minute.exit_minute > 0 ? minute.exit_minute : 90) 
                              : (minute.entry_minute > 0 && minute.exit_minute > 0 
                                  ? (minute.exit_minute - minute.entry_minute) 
                                  : 0)}
                          </span>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="minutes-input"
                            value={minute.entry_minute > 0 ? minute.entry_minute : ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                              handleMinuteChange(minute.id, 'entry_minute', value);
                            }}
                            min="0"
                            max="120"
                            disabled={minute.is_starter}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="minutes-input"
                            value={minute.exit_minute > 0 ? minute.exit_minute : ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                              handleMinuteChange(minute.id, 'exit_minute', value);
                            }}
                            min="0"
                            max="120"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Resumen estadístico */}
      {playerMinutes.length > 0 && (
        <div className="minutes-stats">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Resumen del Partido</h2>
            </div>
            <div className="card-body">
              <div className="stats-summary">
                <div className="stat-item">
                  <div className="stat-value">
                    {playerMinutes.filter(m => m.is_starter).length}
                  </div>
                  <div className="stat-label">Titulares</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {playerMinutes.filter(m => !m.is_starter && m.minutes_played > 0).length}
                  </div>
                  <div className="stat-label">Suplentes utilizados</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {playerMinutes.filter(m => m.minutes_played > 0).length > 0 ? 
                      Math.round(playerMinutes.reduce((sum, m) => sum + (m.minutes_played || 0), 0) / 
                      playerMinutes.filter(m => m.minutes_played > 0).length) : 0}
                  </div>
                  <div className="stat-label">Media de minutos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MinutesSection;