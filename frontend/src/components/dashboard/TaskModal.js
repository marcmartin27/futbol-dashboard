import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';

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

  // Categorías predefinidas para el formulario
  const categories = [
    'Técnica', 'Táctica', 'Físico', 'Porteros', 
    'Ataque', 'Defensa', 'Posesión', 'Finalización'
  ];

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
      const response = await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
        method: 'PUT',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
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

  const confirmDelete = () => {
    setIsDeleting(true);
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal-content">
        <button className="task-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {error && (
          <div className="task-modal-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {isDeleting ? (
          <div className="task-modal-delete-confirm">
            <div className="delete-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>¿Estás seguro de eliminar esta tarea?</h3>
            <p>Esta acción no se puede deshacer.</p>
            
            <div className="task-modal-actions">
              <button 
                className="btn-delete" 
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
                className="btn-cancel" 
                onClick={cancelDelete}
                disabled={loading}
              >
                <i className="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <div className="task-modal-edit">
            <h2>Editar Tarea</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Título</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">URL de imagen</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Categoría</label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="participants">Nº de Participantes</label>
                  <input
                    type="number"
                    id="participants"
                    name="participants"
                    value={form.participants}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duración (min)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="material">Material necesario</label>
                  <input
                    type="text"
                    id="material"
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="task-modal-actions">
                <button 
                  type="submit" 
                  className="btn-save" 
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
                  className="btn-cancel" 
                  onClick={() => setIsEditing(false)}
                >
                  <i className="fas fa-times"></i> Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="task-modal-view">
            <h2>{task.title}</h2>
            
            <div className="task-modal-image">
              <img src={task.image} alt={task.title} />
            </div>
            
            <div className="task-modal-details">
              <div className="task-category-badge">{task.category}</div>
              
              <div className="task-property-group">
                <div className="task-property">
                  <i className="fas fa-users"></i>
                  <span>{task.participants} jugadores</span>
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
              
              <div className="task-modal-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i> Editar
                </button>
                <button 
                  className="btn-delete" 
                  onClick={confirmDelete}
                >
                  <i className="fas fa-trash-alt"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskModal;