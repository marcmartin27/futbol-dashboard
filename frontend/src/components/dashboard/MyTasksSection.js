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
  // const [isDeleting, setIsDeleting] = useState(false); // Esta variable no se usa en tu JSX, la comento. Si la necesitas, descomenta y ajusta.
  const [modalLoading, setModalLoading] = useState(false); // Renombrado para evitar conflicto con 'loading' de MyTasksSection
  const [modalError, setModalError] = useState(''); // Renombrado para evitar conflicto con 'error' de MyTasksSection
  
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
      setIsEditing(false); // Siempre empezar en modo vista
      setModalError('');
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
    setModalError('');
    setModalLoading(true);

    try {
      const payload = {
        ...form,
        participants: Number(form.participants),
        duration: Number(form.duration)
      };

      // Aquí deberías tener tu llamada real al servicio de actualización
      // Ejemplo: const updatedTask = await updateTaskService(task.id, payload);
      // Simulando la llamada:
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedTask = { ...task, ...payload }; // Simula la respuesta

      onTaskUpdated(updatedTask);
      setIsEditing(false);
    } catch (err) {
      setModalError(`Error al actualizar tarea: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    // Confirmación antes de borrar
    if (!window.confirm(`¿Estás seguro de eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      // Aquí deberías tener tu llamada real al servicio de eliminación
      // Ejemplo: await deleteTaskService(task.id);
      // Simulando la llamada:
      await fetch(`http://localhost:8000/api/tasks/${task.id || task._id}/`, {
        method: 'DELETE',
        headers: authHeader()
      });

      onTaskDeleted(task.id || task._id); // Usa task.id o task._id según tu modelo
      onClose();
    } catch (err) {
      setModalError(`Error al eliminar tarea: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  if (!task) return null; // No renderizar nada si no hay tarea seleccionada

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal-header">
          <h2>
            {isEditing ? <><i className="fas fa-edit"></i> Editar Tarea</> : <><i className="fas fa-clipboard-check"></i> Detalles de la Tarea</>}
          </h2>
          <button className="task-modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="task-modal-body">
          {modalError && (
            <div className="error-message" style={{ marginBottom: '20px' }}> {/* Estilo en línea para margen o usa clase */}
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i> {modalError}
            </div>
          )}

          {isEditing ? (
            // MODO EDICIÓN
            <form className="task-modal-edit-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="task-title-edit">Título</label>
                <input id="task-title-edit" type="text" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="task-image-edit">URL de imagen</label>
                <input id="task-image-edit" type="url" name="image" value={form.image} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" />
              </div>
              <div className="form-group">
                <label htmlFor="task-description-edit">Descripción</label>
                <textarea id="task-description-edit" name="description" value={form.description} onChange={handleChange} required></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-participants-edit">Participantes</label>
                  <input id="task-participants-edit" type="number" name="participants" value={form.participants} onChange={handleChange} min="1" required />
                </div>
                <div className="form-group">
                  <label htmlFor="task-duration-edit">Duración (min)</label>
                  <input id="task-duration-edit" type="number" name="duration" value={form.duration} onChange={handleChange} min="1" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-category-edit">Categoría</label>
                  <input id="task-category-edit" type="text" name="category" value={form.category} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="task-material-edit">Material</label>
                  <input id="task-material-edit" type="text" name="material" value={form.material} onChange={handleChange} required />
                </div>
              </div>
              {/* Los botones de acción para el formulario de edición están en task-modal-actions abajo */}
            </form>
          ) : (
            // MODO VISTA
            <div className="task-modal-view-details">
              {form.image && <img src={form.image} alt={form.title} className="task-image-display" onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }} />}
              <h3 className="task-title-display">{form.title}</h3>
              <p className="task-description-display">{form.description}</p>
              
              <h4 className="details-subtitle"><i className="fas fa-info-circle"></i>Detalles Adicionales:</h4>
              <div className="task-meta-grid">
                <div className="task-meta-item">
                  <i className="fas fa-users"></i><strong>Participantes:</strong> <span className="meta-value">{form.participants}</span>
                </div>
                <div className="task-meta-item">
                  <i className="fas fa-clock"></i><strong>Duración:</strong> <span className="meta-value">{form.duration} min</span>
                </div>
                <div className="task-meta-item">
                  <i className="fas fa-tags"></i><strong>Categoría:</strong> <span className="meta-value">{form.category}</span>
                </div>
                <div className="task-meta-item">
                  <i className="fas fa-tools"></i><strong>Material:</strong> <span className="meta-value">{form.material}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="task-modal-actions">
          <button className="btn btn-danger" onClick={handleDelete} disabled={modalLoading}>
            <i className="fas fa-trash-alt"></i> Eliminar
          </button>
          {isEditing ? (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={modalLoading}>
                <i className="fas fa-times"></i> Cancelar
              </button>
              <button type="button" className="btn btn-success" onClick={handleSubmit} disabled={modalLoading}> {/* Cambiado a type="button" y onClick llama a handleSubmit */}
                <i className={`fas ${modalLoading ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {modalLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <i className="fas fa-edit"></i> Editar Tarea
            </button>
          )}
           {/* El botón de cerrar ya está en el header, si quieres uno aquí también, puedes añadirlo:
           {!isEditing && (
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="fas fa-times"></i> Cerrar
            </button>
           )}
          */}
        </div>
      </div>
    </div>
  );
}

export default MyTasksSection;