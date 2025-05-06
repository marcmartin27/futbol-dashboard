import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import '../../styles/main.scss';

function MyTasksSection() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    image: '',
    title: '',
    description: '',
    participants: '',
    duration: '',
    category: '',
    material: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    loadTasks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Asegurar que los campos numéricos tienen un valor válido
      const payload = {
        ...form,
        participants: Number(form.participants),
        duration: Number(form.duration)
      };
      console.log("Enviando payload:", payload);
      
      const response = await fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        // Opción: puedes capturar y loguear los errores devueltos por el backend para depuración
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
      }
      setForm({
        image: '',
        title: '',
        description: '',
        participants: '',
        duration: '',
        category: '',
        material: ''
      });
      loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <h2>Mis Tareas</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="tasks-layout">
        {/* Columna del formulario (izquierda) */}
        <div className="tasks-form-column">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Crear Nueva Tarea</h2>
            </div>
            <div className="card-body">
              <form className="task-form" onSubmit={handleSubmit}>
                <div className="form-control">
                  <label>URL de imagen</label>
                  <input 
                    name="image" 
                    value={form.image} 
                    onChange={handleChange} 
                    placeholder="URL de la imagen" 
                    required 
                  />
                </div>
                
                <div className="form-control">
                  <label>Título</label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    placeholder="Título de la tarea" 
                    required 
                  />
                </div>
                
                <div className="form-control">
                  <label>Descripción</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    placeholder="Descripción detallada..." 
                    required
                  ></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-control half-width">
                    <label>Participantes</label>
                    <input 
                      name="participants" 
                      type="number"
                      value={form.participants} 
                      onChange={handleChange} 
                      placeholder="Número de jugadores" 
                      required 
                    />
                  </div>
                  <div className="form-control half-width">
                    <label>Duración (min)</label>
                    <input 
                      name="duration" 
                      type="number"
                      value={form.duration} 
                      onChange={handleChange} 
                      placeholder="90" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-control half-width">
                    <label>Categoría</label>
                    <input 
                      name="category" 
                      value={form.category} 
                      onChange={handleChange} 
                      placeholder="Ej: Técnica, Táctica..." 
                      required 
                    />
                  </div>
                  <div className="form-control half-width">
                    <label>Material</label>
                    <input 
                      name="material" 
                      value={form.material} 
                      onChange={handleChange} 
                      placeholder="Material necesario" 
                      required 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <i className="fas fa-plus mr-2"></i>
                  {loading ? 'Creando...' : 'Crear Tarea'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Columna de tareas (derecha) */}
        <div className="tasks-list-column">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Tareas Creadas</h2>
            </div>
            <div className="card-body">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <p className="empty-state-message">No hay tareas creadas aún</p>
                  <p>Utiliza el formulario para crear tu primera tarea</p>
                </div>
              ) : (
                <div className="task-grid">
                  {tasks.map(task => (
                    <div key={task.id || task._id} className="task-card">
                      <img src={task.image} alt={task.title} />
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                      
                      <div className="task-properties">
                        <div className="task-property">
                          <i className="fas fa-users"></i> {task.participants} participantes
                        </div>
                        <div className="task-property">
                          <i className="fas fa-clock"></i> {task.duration} min
                        </div>
                        <span className="task-category">{task.category}</span>
                      </div>
                      
                      <div className="task-material">
                        <i className="fas fa-toolbox"></i> Material: {task.material}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyTasksSection;