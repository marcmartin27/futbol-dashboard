import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import '../../styles/_session.scss';

function MySessions() {
  // Estados para datos
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Estados para el formulario
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    tasks: [],
    selectedPlayers: []
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  
  // Usuario actual
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Cargar datos iniciales
  useEffect(() => {
    loadSessions();
    loadTasks();
    loadPlayers();
  }, []);
  
  // Efecto para filtrar tareas por categoría
  useEffect(() => {
    if (selectedCategory) {
      setFilteredTasks(tasks.filter(task => task.category === selectedCategory));
    } else {
      setFilteredTasks(tasks);
    }
  }, [selectedCategory, tasks]);
  
  // Efecto para extraer categorías únicas de las tareas
  useEffect(() => {
    if (tasks.length > 0) {
      const uniqueCategories = [...new Set(tasks.map(task => task.category))];
      setCategories(uniqueCategories);
    }
  }, [tasks]);
  
  // Cargar sesiones del usuario
  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/sessions/', {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar las sesiones`);
      }
      
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar tareas disponibles
  const loadTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks/', {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar las tareas`);
      }
      
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
      setFilteredTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Error cargando tareas: ${err.message}`);
    }
  };
  
  // Cargar jugadores del equipo
  const loadPlayers = async () => {
    try {
      if (!user || !user.team) return;
      
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/players/`, {
        headers: authHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar los jugadores`);
      }
      
      const data = await response.json();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Error cargando jugadores: ${err.message}`);
    }
  };
  
  // Manejar cambio de categoría
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  // Manejar selección de fecha
  const handleDateChange = (e) => {
    setSessionForm({
      ...sessionForm,
      date: e.target.value
    });
  };
  
  // Añadir tarea a la sesión
  const handleAddTask = (task) => {
    if (sessionForm.tasks.length >= 4) {
      setError("Solo se pueden añadir 4 tareas por sesión");
      return;
    }
    
    // Verificar si la tarea ya está añadida
    if (sessionForm.tasks.some(t => t.id === task.id)) {
      setError("Esta tarea ya está añadida a la sesión");
      return;
    }
    
    setSessionForm({
      ...sessionForm,
      tasks: [...sessionForm.tasks, task]
    });
    setError('');
  };
  
  // Eliminar tarea de la sesión
  const handleRemoveTask = (taskId) => {
    setSessionForm({
      ...sessionForm,
      tasks: sessionForm.tasks.filter(task => task.id !== taskId)
    });
  };
  
  // Manejar selección de jugadores
  const handlePlayerToggle = (playerId) => {
    const isSelected = sessionForm.selectedPlayers.includes(playerId);
    
    if (isSelected) {
      setSessionForm({
        ...sessionForm,
        selectedPlayers: sessionForm.selectedPlayers.filter(id => id !== playerId)
      });
    } else {
      setSessionForm({
        ...sessionForm,
        selectedPlayers: [...sessionForm.selectedPlayers, playerId]
      });
    }
  };
  
  // Enviar formulario de sesión
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (sessionForm.tasks.length !== 4) {
      setError("Debes añadir exactamente 4 tareas a la sesión");
      return;
    }
    
    if (sessionForm.selectedPlayers.length === 0) {
      setError("Debes seleccionar al menos un jugador para la sesión");
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        date: sessionForm.date,
        tasks: sessionForm.tasks.map(task => task.id || task._id),
        players: sessionForm.selectedPlayers,
      };
      
      const response = await fetch('http://localhost:8000/api/sessions/', {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo crear la sesión`);
      }
      
      // Resetear formulario
      setSessionForm({
        date: new Date().toISOString().split('T')[0],
        tasks: [],
        selectedPlayers: []
      });
      
      // Recargar sesiones
      loadSessions();
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="content-wrapper">
      <h2>Sesiones de Entrenamiento</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="sessions-layout">
        {/* Columna izquierda: Formulario de creación */}
        <div className="sessions-form-column">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Crear Nueva Sesión</h2>
            </div>
            <div className="card-body">
              <form className="session-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Fecha de la sesión</label>
                  <input 
                    type="date" 
                    value={sessionForm.date}
                    onChange={handleDateChange}
                    required
                  />
                </div>
                
                <div className="players-section">
                  <h3>Jugadores Participantes <span className="player-count">({sessionForm.selectedPlayers.length} seleccionados)</span></h3>
                  
                  <div className="players-grid">
                    {players.map(player => (
                      <div 
                        key={player.id || player._id} 
                        className={`player-item ${sessionForm.selectedPlayers.includes(player.id || player._id) ? 'selected' : ''}`}
                        onClick={() => handlePlayerToggle(player.id || player._id)}
                      >
                        <div className="player-number">{player.number}</div>
                        <div className="player-info">
                          <div className="player-name">{player.name} {player.last_name}</div>
                          <div className="player-position">{player.position_display}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="tasks-section">
                  <h3>Tareas para la sesión <span className="task-count">({sessionForm.tasks.length}/4)</span></h3>
                  
                  <div className="selected-tasks">
                    {sessionForm.tasks.map(task => (
                      <div key={task.id || task._id} className="selected-task">
                        <div className="task-title">{task.title}</div>
                        <div className="task-details">
                          <span className="task-category">{task.category}</span>
                          <span className="task-duration">{task.duration} min</span>
                        </div>
                        <button 
                          type="button" 
                          className="remove-task-btn"
                          onClick={() => handleRemoveTask(task.id || task._id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                    
                    {[...Array(4 - sessionForm.tasks.length)].map((_, index) => (
                      <div key={`empty-${index}`} className="selected-task empty">
                        <div className="task-placeholder">
                          <i className="fas fa-plus"></i>
                          <span>Selecciona una tarea</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="task-filter">
                    <label>Filtrar por categoría:</label>
                    <select value={selectedCategory} onChange={handleCategoryChange}>
                      <option value="">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="available-tasks">
                    <h4>Tareas disponibles</h4>
                    <div className="tasks-grid">
                      {filteredTasks.map(task => (
                        <div 
                          key={task.id || task._id} 
                          className="task-card-mini"
                          onClick={() => handleAddTask(task)}
                        >
                          <div className="task-image">
                            <img src={task.image} alt={task.title} />
                          </div>
                          <div className="task-content">
                            <h4>{task.title}</h4>
                            <div className="task-meta">
                              <span className="task-category">{task.category}</span>
                              <span className="task-duration"><i className="fas fa-clock"></i> {task.duration} min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary create-session-btn"
                  disabled={loading || sessionForm.tasks.length !== 4 || sessionForm.selectedPlayers.length === 0}
                >
                  <i className="fas fa-save"></i>
                  {loading ? 'Creando...' : 'Crear Sesión'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Columna derecha: Listado de sesiones */}
        <div className="sessions-list-column">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Mis Sesiones</h2>
            </div>
            <div className="card-body">
              {loading && sessions.length === 0 ? (
                <div className="loading-indicator">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Cargando sesiones...</span>
                </div>
              ) : sessions.length > 0 ? (
                <div className="sessions-list">
                  {sessions.map(session => (
                    <div key={session.id || session._id} className="session-card">
                      <div className="session-header">
                        <div className="session-date">
                          <i className="far fa-calendar"></i>
                          {formatDate(session.date || session.created_at)}
                        </div>
                        <div className="session-actions">
                          <button className="btn-icon" title="Exportar a PDF">
                            <i className="fas fa-file-pdf"></i>
                          </button>
                          <button className="btn-icon" title="Imprimir">
                            <i className="fas fa-print"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="session-content">
                        <div className="session-tasks">
                          <h4>Tareas <span>({session.tasks?.length || 0})</span></h4>
                          <div className="session-tasks-grid">
                            {session.tasks?.map((taskId, index) => {
                              const task = tasks.find(t => (t.id || t._id) === taskId);
                              return task ? (
                                <div key={index} className="session-task-item">
                                  <div className="task-order">{index + 1}</div>
                                  <div className="task-info">
                                    <div className="task-title">{task.title}</div>
                                    <div className="task-meta">
                                      <span className="task-category">{task.category}</span>
                                      <span className="task-duration">{task.duration} min</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div key={index} className="session-task-item not-found">
                                  <div className="task-order">{index + 1}</div>
                                  <div className="task-info">Tarea no encontrada</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="session-players">
                          <h4>Jugadores <span>({session.players?.length || 0})</span></h4>
                          <div className="player-tags">
                            {session.players?.map((playerId, index) => {
                              const player = players.find(p => (p.id || p._id) === playerId);
                              return player ? (
                                <div key={index} className="player-tag">
                                  <span className="player-number">{player.number}</span>
                                  <span className="player-name">{player.name}</span>
                                </div>
                              ) : (
                                <div key={index} className="player-tag not-found">
                                  Jugador no encontrado
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="session-footer">
                        <div className="session-duration">
                          <i className="fas fa-clock"></i>
                          Duración total: {calculateSessionDuration(session, tasks)} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <p className="empty-state-message">No hay sesiones creadas</p>
                  <p>Utiliza el formulario para crear tu primera sesión de entrenamiento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función auxiliar para calcular la duración total de la sesión
function calculateSessionDuration(session, allTasks) {
  if (!session.tasks || !allTasks.length) return 0;
  
  return session.tasks.reduce((total, taskId) => {
    const task = allTasks.find(t => (t.id || t._id) === taskId);
    return total + (task ? task.duration : 0);
  }, 0);
}

export default MySessions;