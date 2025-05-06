import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import '../../styles/_minutes.scss';

function MinutesSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [playerMinutes, setPlayerMinutes] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [currentMatch, setCurrentMatch] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
  });

  // Obtener usuario desde localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if (user && user.team) {
      loadPlayerData();
    }
  }, []);
  
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
      
      // Cargar lista de partidos existentes (se podría implementar)
      loadMatchList();
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMatchList = async () => {
    try {
      // Podría implementarse para cargar partidos existentes
      // Por ahora, dejamos un array vacío
      setMatches([]);
    } catch (err) {
      console.error(`Error cargando partidos: ${err.message}`);
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
      
      // Obtener el registro actual
      const currentRecord = playerMinutes.find(m => m.id === minuteId);
      
      // Preparar datos para la actualización
      const updateData = {
        id: minuteId,
        [field]: field === 'is_starter' ? value : parseInt(value)
      };
      
      // Calcular automáticamente los minutos jugados
      if (field === 'entry_minute' || field === 'exit_minute') {
        let entryMin = field === 'entry_minute' 
          ? parseInt(value) 
          : (currentRecord.entry_minute || 0);
        
        let exitMin = field === 'exit_minute' 
          ? parseInt(value) 
          : (currentRecord.exit_minute || 90);
        
        // Si es titular, la entrada es siempre 0
        if (currentRecord.is_starter) {
          entryMin = 0;
        }
        
        // Calcular minutos jugados
        const minutesPlayed = Math.max(0, exitMin - entryMin);
        updateData.minutes_played = minutesPlayed;
      }
      
      // Si se cambia is_starter a true, establecer entry_minute a 0
      if (field === 'is_starter' && value === true) {
        updateData.entry_minute = 0;
      }
      
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/minutes/`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
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
      
      <div className="match-selector">
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