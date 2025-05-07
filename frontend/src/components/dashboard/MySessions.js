import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import '../../styles/main.scss';

function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]); // Todas las tareas creadas para elegir
  const [selectedTasks, setSelectedTasks] = useState([]); // Almacena los IDs de las tareas seleccionadas
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar sesiones del usuario
  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/sessions/', {
        headers: authHeader()
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar todas las tareas disponibles (puedes filtrar solo las tuyas si lo requieres)
  const loadTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks/', {
        headers: authHeader()
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSessions();
    loadTasks();
  }, []);

  // Manejar la selección de tareas: se usa un checkbox para cada tarea
  const handleTaskSelect = (e) => {
    const taskId = e.target.value;
    let newSelected = [...selectedTasks];
    if (newSelected.includes(taskId)) {
      newSelected = newSelected.filter(id => id !== taskId);
    } else {
      newSelected.push(taskId);
    }
    // Limitar la selección a 4 tareas
    if (newSelected.length > 4) {
      newSelected = newSelected.slice(0, 4);
    }
    setSelectedTasks(newSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTasks.length !== 4) {
      setError("Debe seleccionar exactamente 4 tareas");
      return;
    }
    try {
      setLoading(true);
      const payload = { tasks: selectedTasks };
      const response = await fetch('http://localhost:8000/api/sessions/', {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      setSelectedTasks([]);
      loadSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <h2>Mis Sesiones</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Crear Nueva Sesión</h2>
        </div>
        <div className="card-body">
          <form className="session-form" onSubmit={handleSubmit}>
            <div className="form-control">
              <p>Seleccione 4 tareas:</p>
              <div className="task-options">
                {tasks.map(task => (
                  <div key={task.id || task._id}>
                    <input 
                      type="checkbox" 
                      value={task.id || task._id} 
                      checked={selectedTasks.includes(task.id || task._id)} 
                      onChange={handleTaskSelect} 
                    />
                    <label>{task.title}</label>
                  </div>
                ))}
              </div>
            </div>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Sesión'}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Sesiones Creadas</h2>
        </div>
        <div className="card-body">
          {loading && <p className="loading">Cargando sesiones...</p>}
          {!loading && sessions.length === 0 ? (
            <div className="empty-state">
              <p>No hay sesiones creadas aún.</p>
            </div>
          ) : (
            <div className="session-grid">
              {sessions.map(session => (
                <div key={session.id || session._id} className="session-card">
                  <p>Sesión creada el: {new Date(session.created_at).toLocaleString()}</p>
                  <ul>
                    {session.tasks.map(task => (
                      <li key={task.id || task._id}>{task.title}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MySessions;