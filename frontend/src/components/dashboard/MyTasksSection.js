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
  // Estado para manejar el modal
  const [selectedTask, setSelectedTask] = useState(null);

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

  // Funciones para manejar el modal
  const openTaskModal = (task) => {
    setSelectedTask(task);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
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
                    <div 
                      key={task.id || task._id} 
                      className="task-card"
                      onClick={() => openTaskModal(task)}
                    >
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

      {/* Modal para ver, editar y eliminar tareas */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={closeTaskModal}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}

// Componente del Modal
function TaskModal({ task, onClose, onTaskUpdated, onTaskDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    image: '',
    title: '',
    description: '',
    participants: '',
    duration: '',
    category: '',
    material: ''
  });

  useEffect(() => {
    if (task) {
      setForm({
        image: task.image || '',
        title: task.title || '',
        description: task.description || '',
        participants: task.participants || '',
        duration: task.duration || '',
        category: task.category || '',
        material: task.material || ''
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        participants: Number(form.participants),
        duration: Number(form.duration)
      };

      const response = await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
        method: 'PUT',
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

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
      setIsEditing(false);
    } catch (err) {
      setError(`Error al actualizar tarea: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
        method: 'DELETE',
        headers: authHeader()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      onTaskDeleted(task.id);
      onClose();
    } catch (err) {
      setError(`Error al eliminar tarea: ${err.message}`);
      setIsDeleting(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {error && (
          <div className="modal-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {isDeleting ? (
          <div className="delete-confirmation">
            <div className="delete-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>¿Estás seguro de eliminar esta tarea?</h3>
            <p>Esta acción no se puede deshacer.</p>
            
            <div className="modal-actions">
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Eliminando...</>
                ) : (
                  <><i className="fas fa-trash-alt"></i> Eliminar definitivamente</>
                )}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsDeleting(false)}
                disabled={loading}
              >
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <div className="modal-edit">
            <h2>Editar Tarea</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label>Título</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label>URL de imagen</label>
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-control half-width">
                  <label>Categoría</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-control half-width">
                  <label>Participantes</label>
                  <input
                    type="number"
                    name="participants"
                    value={form.participants}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-control half-width">
                  <label>Duración (min)</label>
                  <input
                    type="number"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-control half-width">
                  <label>Material</label>
                  <input
                    type="text"
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                >
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                  ) : (
                    <><i className="fas fa-save"></i> Guardar cambios</>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsEditing(false)}
                >
                  <i className="fas fa-times"></i> Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="modal-view">
            <h2>{task.title}</h2>
            
            <div className="modal-image">
              <img src={task.image} alt={task.title} />
            </div>
            
            <div className="modal-details">
              <div className="task-category">{task.category}</div>
              
              <div className="task-properties">
                <div className="task-property">
                  <i className="fas fa-users"></i>
                  <span>{task.participants} participantes</span>
                </div>
                <div className="task-property">
                  <i className="fas fa-clock"></i>
                  <span>{task.duration} minutos</span>
                </div>
                <div className="task-property">
                  <i className="fas fa-toolbox"></i>
                  <span>Material: {task.material}</span>
                </div>
              </div>
              
              <div className="task-description">
                <h3>Descripción</h3>
                <p>{task.description}</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i> Editar
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setIsDeleting(true)}
                >
                  <i className="fas fa-trash-alt"></i> Eliminar
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={onClose}
                >
                  <i className="fas fa-times"></i> Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTasksSection;