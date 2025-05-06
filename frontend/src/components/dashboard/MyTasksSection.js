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

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Crear Nueva Tarea</h2>
        </div>
        <div className="card-body">
          <form className="task-form" onSubmit={handleSubmit}>
            <div className="form-control">
              <input 
                name="image" 
                value={form.image} 
                onChange={handleChange} 
                placeholder="URL de la imagen" 
                required 
              />
            </div>
            <div className="form-control">
              <input 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                placeholder="Título" 
                required 
              />
            </div>
            <div className="form-control">
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                placeholder="Descripción" 
                required
              ></textarea>
            </div>
            <div className="form-control">
              <input 
                name="participants" 
                type="number"
                value={form.participants} 
                onChange={handleChange} 
                placeholder="Número de jugadores/participantes" 
                required 
              />
            </div>
            <div className="form-control">
              <input 
                name="duration" 
                type="number"
                value={form.duration} 
                onChange={handleChange} 
                placeholder="Tiempo de duración (minutos)" 
                required 
              />
            </div>
            <div className="form-control">
              <input 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                placeholder="Categoría" 
                required 
              />
            </div>
            <div className="form-control">
              <input 
                name="material" 
                value={form.material} 
                onChange={handleChange} 
                placeholder="Material necesario" 
                required 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Tarea'}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Tareas Creadas</h2>
        </div>
        <div className="card-body">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No hay tareas creadas aún.</p>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map(task => (
                <div key={task.id || task._id} className="task-card">
                  <img src={task.image} alt={task.title} />
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p>Participantes: {task.participants}</p>
                  <p>Duración: {task.duration} min</p>
                  <p>Categoría: {task.category}</p>
                  <p>Material: {task.material}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTasksSection;