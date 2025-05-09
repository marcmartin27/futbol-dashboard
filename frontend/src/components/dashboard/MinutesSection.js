import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';

function MinutesSection() {
  // Estados para datos y UI
  const [loading, setLoading] = useState(true);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [loadingMinutes, setLoadingMinutes] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [minuteRecords, setMinuteRecords] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [formChanged, setFormChanged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showMatchResults, setShowMatchResults] = useState(false);

  // Añade esta función para filtrar partidos
  const filterMatches = () => {
    let results = [...matches];
    
    // Filtrar por nombre de equipo rival
    if (searchQuery.trim()) {
      results = results.filter(match => 
        match.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrar por fecha de inicio
    if (dateRange.startDate) {
      results = results.filter(match => 
        new Date(match.date) >= new Date(dateRange.startDate)
      );
    }
    
    // Filtrar por fecha final
    if (dateRange.endDate) {
      results = results.filter(match => 
        new Date(match.date) <= new Date(dateRange.endDate)
      );
    }
    
    setFilteredMatches(results);
    setShowMatchResults(true);
  };

  // Añade esta función para manejar cambios en el rango de fechas
  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  // Añade esta función para limpiar la búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setDateRange({ startDate: '', endDate: '' });
    setShowMatchResults(false);
  };
  
  // Estados para formulario
  const [newMatch, setNewMatch] = useState({
    date: new Date().toISOString().split('T')[0],
    name: ''
  });
  
  // Obtener usuario desde localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Cargar lista de partidos al inicio
  useEffect(() => {
    if (user && user.team) {
      loadMatches();
    }
  }, []);

  // Cargar minutaje cuando se selecciona un partido
  useEffect(() => {
    if (selectedMatch) {
      loadMinutesForMatch();
    }
  }, [selectedMatch]);

  // Cargar lista de partidos
  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/minutes/?matches=true`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setMatches(data);
    } catch (err) {
      setError(`Error al cargar partidos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar minutaje para un partido específico
  const loadMinutesForMatch = async () => {
    try {
      setLoadingMinutes(true);
      
      // Cargar jugadores si no están cargados
      if (players.length === 0) {
        await loadPlayers();
      }
      
      const response = await fetch(
        `http://localhost:8000/api/teams/${user.team}/minutes/?match_date=${selectedMatch.date}&match_name=${selectedMatch.name}&auto_create=true`,
        { headers: authHeader() }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setMinuteRecords(data);
      setFormChanged(false);
    } catch (err) {
      setError(`Error al cargar minutaje: ${err.message}`);
    } finally {
      setLoadingMinutes(false);
    }
  };

  // Cargar lista de jugadores
  const loadPlayers = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/players/`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(`Error al cargar jugadores: ${err.message}`);
    }
  };

  // Crear nuevo partido
  const handleCreateMatch = async (e) => {
    e.preventDefault();
    
    if (!newMatch.name || !newMatch.date) {
      setError("Por favor, complete todos los campos");
      return;
    }
    
    try {
      setCreatingMatch(true);
      
      // Comprobar si el partido ya existe
      const exists = matches.some(
        match => match.date === newMatch.date && match.name === newMatch.name
      );
      
      if (exists) {
        setError("Ya existe un partido con esa fecha y nombre");
        return;
      }
      
      // Crear el partido - Esto en realidad creará los registros cuando accedamos
      setSelectedMatch({
        date: newMatch.date,
        name: newMatch.name,
        player_count: 0
      });
      
      // Recargar la lista de partidos
      await loadMatches();
      
      // Limpiar formulario
      setNewMatch({
        date: new Date().toISOString().split('T')[0],
        name: ''
      });
      
    } catch (err) {
      setError(`Error al crear partido: ${err.message}`);
    } finally {
      setCreatingMatch(false);
    }
  };

  // Manejar cambios en el formulario de nuevo partido
  const handleNewMatchChange = (e) => {
    setNewMatch({
      ...newMatch,
      [e.target.name]: e.target.value
    });
  };

  // Alternar si un jugador es titular
  const handleToggleStarter = async (recordId, isStarter) => {
    try {
      const record = minuteRecords.find(r => r.id === recordId);
      if (!record) return;
      
      // Actualizar la UI inmediatamente
      setMinuteRecords(prevRecords => 
        prevRecords.map(r => 
          r.id === recordId ? { 
            ...r, 
            is_starter: isStarter,
            // Si es titular, entrada es 0
            entry_minute: isStarter ? 0 : r.entry_minute
          } : r
        )
      );
      
      setFormChanged(true);
      
      // Enviar al servidor
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/minutes/`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: recordId,
          is_starter: isStarter
        })
      });
      
      if (!response.ok) {
        // Si hay error, revertir la UI
        loadMinutesForMatch();
        throw new Error(`Error ${response.status}`);
      }
      
    } catch (err) {
      setError(`Error al actualizar registro: ${err.message}`);
    }
  };

  // Actualizar minutos de entrada/salida
  const handleMinuteChange = async (recordId, field, value) => {
    try {
      // Permitir valores vacíos durante la edición
      // Importante: valor puede ser string vacío temporalmente
      setMinuteRecords(prevRecords => 
        prevRecords.map(r => 
          r.id === recordId ? { ...r, [field]: value } : r
        )
      );
      
      setFormChanged(true);
      
      // Solo enviar al servidor cuando el valor sea un número válido o el usuario haya dejado de escribir
      const debounceTimeout = setTimeout(async () => {
        // Convertir a número solo al guardar, permitiendo un valor temporal vacío para edición
        const numValue = value === '' ? 0 : parseInt(value);
        
        // Validaciones
        if (numValue < 0 || numValue > 120) {
          return; // No permitir valores fuera de rango
        }
        
        const response = await fetch(`http://localhost:8000/api/teams/${user.team}/minutes/`, {
          method: 'PUT',
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: recordId,
            [field]: numValue
          })
        });
        
        if (!response.ok) {
          // Si hay error, revertir la UI
          loadMinutesForMatch();
          throw new Error(`Error ${response.status}`);
        }
        
        // Actualizar con la respuesta del servidor
        const data = await response.json();
        
        // Actualizar solo ese registro
        setMinuteRecords(prevRecords => 
          prevRecords.map(r => 
            r.id === recordId ? data : r
          )
        );
        
      }, 800); // Aumentar el tiempo de espera para dar más tiempo para editar
      
      // Limpiar timeout si cambia de nuevo
      return () => clearTimeout(debounceTimeout);
      
    } catch (err) {
      setError(`Error al actualizar minutos: ${err.message}`);
    }
  };

  // Guardar todos los cambios pendientes
  const handleSaveAll = async () => {
    try {
      setLoading(true);
      
      // Recargar datos del servidor para asegurarnos que todo está sincronizado
      await loadMinutesForMatch();
      
      setFormChanged(false);
    } catch (err) {
      setError(`Error al guardar cambios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = () => {
    if (!minuteRecords.length) return null;
    
    const totalPlayers = minuteRecords.length;
    const starters = minuteRecords.filter(r => r.is_starter).length;
    let totalMinutes = 0;
    const playersWithMinutes = minuteRecords.filter(r => r.minutes_played > 0).length;
    
    minuteRecords.forEach(record => {
      totalMinutes += record.minutes_played || 0;
    });
    
    const avgMinutes = playersWithMinutes ? Math.round(totalMinutes / playersWithMinutes) : 0;
    
    return {
      totalPlayers,
      starters,
      totalMinutes,
      playersWithMinutes,
      avgMinutes
    };
  };

  // Obtener iniciales del jugador
  const getPlayerInitials = (player) => {
    const name = player?.player_name || '';
    const lastName = player?.player_last_name || '';
    
    if (name && lastName) {
      return `${name[0]}${lastName[0]}`.toUpperCase();
    } else if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return '??';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
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

  // Renderizar estado de carga
  if (loading && !selectedMatch) {
    return (
      <div className="content-wrapper">
        <div className="minutes-container">
          <div className="minutes-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  // Estadísticas del partido seleccionado
  const stats = calculateStats();

  return (
    <div className="content-wrapper">
      <div className="minutes-container">
        <div className="section-title">
          <h2>Control de Minutaje</h2>
          {matches.length > 0 && (
            <span className="match-counter">{matches.length} partidos</span>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* Panel de control superior */}
        <div className="control-panel">
          <div className="panel-header">
            <h3><i className="fas fa-stopwatch"></i> Gestión de Partidos</h3>
          </div>
          <div className="panel-body">
            <div className="match-controls">
              {/* Filtros y selección de partido */}
              <div className="match-filter">
                <h4 className="filter-title">Buscar Partidos</h4>
                <div className="search-form">
                  <div className="search-input-group">
                    <label>Nombre del rival</label>
                    <div className="search-input-wrapper">
                      <input 
                        type="text"
                        placeholder="ej: vs Real Madrid"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <i className="fas fa-search search-icon"></i>
                    </div>
                  </div>
                  
                  <div className="date-range-group">
                    <div className="date-input">
                      <label>Desde</label>
                      <input 
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateRangeChange}
                      />
                    </div>
                    <div className="date-input">
                      <label>Hasta</label>
                      <input 
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateRangeChange}
                      />
                    </div>
                  </div>
                  
                  <div className="search-actions">
                    <button 
                      className="btn-primary search-btn" 
                      onClick={filterMatches}
                      disabled={!searchQuery && !dateRange.startDate && !dateRange.endDate}
                    >
                      <i className="fas fa-search"></i>
                      Buscar Partidos
                    </button>
                    <button 
                      className="btn-light" 
                      onClick={clearSearch}
                    >
                      <i className="fas fa-times"></i>
                      Limpiar
                    </button>
                  </div>
                </div>
                
                {/* Resultados de búsqueda */}
                {showMatchResults && (
                  <div className="search-results">
                    <div className="results-header">
                      <h5>Resultados ({filteredMatches.length} partidos encontrados)</h5>
                      {filteredMatches.length > 0 && (
                        <button className="close-results" onClick={() => setShowMatchResults(false)}>
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                    
                    {filteredMatches.length > 0 ? (
                      <div className="results-list">
                        {filteredMatches.map((match, index) => (
                          <div 
                            key={index} 
                            className={`result-item ${selectedMatch && selectedMatch.date === match.date && selectedMatch.name === match.name ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedMatch(match);
                              setShowMatchResults(false);
                            }}
                          >
                            <div className="result-date">
                              <i className="fas fa-calendar-alt"></i>
                              {formatDate(match.date)}
                            </div>
                            <div className="result-name">{match.name}</div>
                            <div className="result-count">
                              <i className="fas fa-users"></i>
                              {match.player_count} jugadores
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-results">
                        <i className="fas fa-search"></i>
                        <p>No se encontraron partidos con los criterios especificados</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Si hay un partido seleccionado, mostrar información */}
              {selectedMatch && (
                <div className="selected-match-info">
                  <div className="match-badge">
                    <i className="fas fa-flag"></i>
                  </div>
                  <div className="match-details">
                    <span className="match-name">{selectedMatch.name}</span>
                    <span className="match-date">{formatDate(selectedMatch.date)}</span>
                  </div>
                  <button 
                    className="change-match-btn"
                    onClick={() => setShowMatchResults(true)}
                  >
                    <i className="fas fa-exchange-alt"></i>
                    Cambiar partido
                  </button>
                </div>
              )}
              
              {/* Creación de nuevo partido */}
              <div className="match-create">
                <h4 className="create-title">Crear Nuevo Partido</h4>
                <form className="create-form" onSubmit={handleCreateMatch}>
                  <div className="form-group">
                    <label>Fecha del partido</label>
                    <input
                      type="date"
                      name="date"
                      value={newMatch.date}
                      onChange={handleNewMatchChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Nombre del partido</label>
                    <input
                      type="text"
                      name="name"
                      value={newMatch.name}
                      onChange={handleNewMatchChange}
                      placeholder="Ej: vs Real Madrid"
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="create-button"
                    disabled={creatingMatch}
                  >
                    <i className="fas fa-plus"></i>
                    {creatingMatch ? 'Creando...' : 'Crear Partido'}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Lista de partidos recientes */}
            {matches.length > 0 && (
              <div className="matches-list">
                <h4 className="filter-title">Partidos Recientes</h4>
                <div className="matches-grid">
                  {matches.slice(0, 4).map((match, index) => (
                    <div 
                      key={index} 
                      className={`match-card ${selectedMatch && selectedMatch.date === match.date && selectedMatch.name === match.name ? 'active' : ''}`}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="match-header">
                        <div className="match-date">
                          <i className="fas fa-calendar-alt"></i>
                          {formatDate(match.date)}
                        </div>
                        <div className="match-title">{match.name}</div>
                      </div>
                      <div className="match-details">
                        <div className="player-stats">
                          <div className="stat-item">
                            <div className="stat-value">{match.player_count}</div>
                            <div className="stat-label">Jugadores</div>
                          </div>
                        </div>
                      </div>
                      <div className="match-actions">
                        <button className="btn-small btn-light">
                          <i className="fas fa-stopwatch"></i>
                          Gestionar minutaje
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Si no hay partidos */}
        {!loading && matches.length === 0 && !selectedMatch && (
          <div className="minutes-empty-state">
            <div className="icon">
              <i className="fas fa-stopwatch"></i>
            </div>
            <h3 className="title">No hay partidos registrados</h3>
            <p className="description">
              Para comenzar a registrar minutaje, crea tu primer partido usando el formulario superior.
            </p>
          </div>
        )}
        
        {/* Tabla de minutaje para el partido seleccionado */}
        {selectedMatch && (
          <div className="minutes-detail">
            <div className="detail-header">
              <div className="match-info">
                <h3>{selectedMatch.name}</h3>
                <div className="match-meta">
                  <span><i className="fas fa-calendar-alt"></i> {formatDate(selectedMatch.date)}</span>
                  {stats && <span><i className="fas fa-users"></i> {stats.totalPlayers} jugadores</span>}
                </div>
              </div>
              
              {stats && (
                <div className="match-summary">
                  <div className="summary-item">
                    <i className="fas fa-running"></i>
                    {stats.starters} titulares
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-clock"></i>
                    {stats.totalMinutes} min. totales
                  </div>
                </div>
              )}
            </div>
            
            {/* Tabla de minutaje */}
            {loadingMinutes ? (
              <div className="minutes-loading">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="minutes-table-container">
                <table className="minutes-table">
                  <thead>
                    <tr>
                      <th className="player-column">Jugador</th>
                      <th>Titular</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Minutos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {minuteRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="player-column">
                          <div className="player-info">
                            <div className="player-avatar">
                              {getPlayerInitials(record)}
                            </div>
                            <div className="player-data">
                              <div className="player-name">{record.player_name} {record.player_last_name}</div>
                              <div className="player-position">
                                <span className="player-number">{record.player_number}</span>
                                {formatPosition(record.player_position)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="minutes-toggle">
                            <input 
                              type="checkbox" 
                              checked={record.is_starter} 
                              onChange={(e) => handleToggleStarter(record.id, e.target.checked)}
                              id={`starter-${record.id}`}
                            />
                            <label className="toggle-slider" htmlFor={`starter-${record.id}`}></label>
                          </div>
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="minutes-input" 
                            value={record.entry_minute === 0 && !record.is_starter ? '' : record.entry_minute || ''}
                            onChange={(e) => handleMinuteChange(record.id, 'entry_minute', e.target.value)}
                            min="0"
                            max="120"
                            disabled={record.is_starter}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="minutes-input" 
                            value={record.exit_minute || ''}
                            onChange={(e) => handleMinuteChange(record.id, 'exit_minute', e.target.value)}
                            min="0"
                            max="120"
                          />
                        </td>
                        <td>
                          <div className="minutes-total">{record.minutes_played} min</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="minutes-footer">
              <div className="footer-info">
                <span><i className="fas fa-info-circle"></i> Los cambios se guardan automáticamente</span>
                {formChanged && <span><i className="fas fa-sync-alt"></i> Hay cambios pendientes de sincronizar</span>}
              </div>
              
              <div className="footer-actions">
                <button 
                  className="btn-primary" 
                  onClick={handleSaveAll}
                  disabled={loading || !formChanged}
                >
                  <i className="fas fa-cloud-upload-alt"></i>
                  {loading ? 'Guardando...' : 'Sincronizar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Estadísticas detalladas */}
        {selectedMatch && stats && (
          <div className="minutes-stats">
            <div className="section-title">
              <h2>Estadísticas del Partido</h2>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <h4><i className="fas fa-users"></i> Jugadores Convocados</h4>
                </div>
                <div className="stat-body">
                  <div className="stat-value">{stats.totalPlayers}</div>
                  <div className="stat-label">jugadores</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <h4><i className="fas fa-running"></i> Jugadores Titulares</h4>
                </div>
                <div className="stat-body">
                  <div className="stat-value">{stats.starters}</div>
                  <div className="stat-label">titulares</div>
                  
                  <div className="progress-container">
                    <div className="progress-label">
                      <span>Porcentaje de titulares</span>
                      <span>{Math.round((stats.starters / stats.totalPlayers) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${Math.round((stats.starters / stats.totalPlayers) * 100)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <h4><i className="fas fa-stopwatch"></i> Minutos Totales</h4>
                </div>
                <div className="stat-body">
                  <div className="stat-value">{stats.totalMinutes}</div>
                  <div className="stat-label">minutos jugados</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <h4><i className="fas fa-tachometer-alt"></i> Promedio</h4>
                </div>
                <div className="stat-body">
                  <div className="stat-value">{stats.avgMinutes}</div>
                  <div className="stat-label">minutos por jugador</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MinutesSection;