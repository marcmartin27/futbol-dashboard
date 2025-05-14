import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import AdminTaskViewModal from './AdminTaskViewModal'; // Importar el nuevo modal


function AdminTasksSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasksByCoach, setTasksByCoach] = useState({});
  const [coaches, setCoaches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Estado para el modal de visualización
  const [selectedTaskForView, setSelectedTaskForView] = useState(null);

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = authHeader();
      // Primero, obtener todos los usuarios para identificar a los entrenadores
      const usersResponse = await fetch('http://localhost:8000/api/users/', { headers });
      if (!usersResponse.ok) throw new Error('Error al cargar usuarios');
      const allUsers = await usersResponse.json();
      const coachUsers = allUsers.filter(user => user.role === 'coach');
      setCoaches(coachUsers);

      // Luego, obtener todas las tareas
      const tasksResponse = await fetch('http://localhost:8000/api/tasks/all', { headers });
      if (!tasksResponse.ok) throw new Error('Error al cargar tareas');
      const allTasks = await tasksResponse.json();
      
      // Extraer categorías únicas de todas las tareas
      const uniqueCategories = [...new Set(allTasks.map(task => task.category).filter(Boolean))];
      setCategories(uniqueCategories.sort());

      // Agrupar tareas por el ID del propietario (entrenador)
      const tasksGrouped = allTasks.reduce((acc, task) => {
        const ownerId = task.owner; // Asumiendo que 'owner' es el ID del coach
        if (!acc[ownerId]) {
          acc[ownerId] = [];
        }
        acc[ownerId].push(task);
        return acc;
      }, {});
      setTasksByCoach(tasksGrouped);

    } catch (err) {
      console.error("Error loading tasks or coaches:", err);
      setError(`No se pudieron cargar los datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getCoachName = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    if (coach) {
      return `${coach.first_name || ''} ${coach.last_name || ''}`.trim() || coach.username;
    }
    return "Entrenador desconocido";
  };

  const getCoachTeam = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    return coach?.team_name || "Sin equipo asignado";
  };

  const getInitials = (coachId) => {
    const coachName = getCoachName(coachId);
    if (coachName === "Entrenador desconocido") return "??";
    return coachName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filterTasks = (tasks) => {
    if (!tasks) return [];
    let filtered = tasks;
    if (filterCategory) {
      filtered = filtered.filter(task => task.category === filterCategory);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(lowerSearchTerm) ||
        task.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return filtered;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
  };

  // Funciones para el modal de visualización
  const openViewModal = (task) => {
    setSelectedTaskForView(task);
  };

  const closeViewModal = () => {
    setSelectedTaskForView(null);
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <h2>Tareas por Entrenador</h2>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin spinner"></i>
          <span>Cargando tareas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <h2>Tareas por Entrenador</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="admin-tasks-container">
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="search">Buscar tareas</label>
            <input
              id="search"
              type="text"
              placeholder="Buscar por título o descripción"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="category">Filtrar por categoría</label>
            <select
              id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-actions">
            <button className="btn-secondary" onClick={handleClearFilters}>
              <i className="fas fa-times"></i>
              Limpiar filtros
            </button>
          </div>
        </div>

        {Object.keys(tasksByCoach).length === 0 && !loading && (
          <div className="admin-empty-state">
            <i className="fas fa-folder-open icon"></i>
            <p className="title">No hay tareas creadas</p>
            <p className="description">Los entrenadores aún no han creado tareas en el sistema.</p>
          </div>
        )}

        {Object.keys(tasksByCoach).map(coachId => {
          const tasksForCurrentCoach = tasksByCoach[coachId];
          const filteredTasks = filterTasks(tasksForCurrentCoach);
          
          if (filteredTasks.length === 0) return null;

          return (
            <div key={coachId} className="coach-tasks-group">
              <div className="coach-header">
                <div className="coach-avatar">{getInitials(coachId)}</div>
                <div className="coach-info">
                  <div className="coach-name">{getCoachName(coachId)}</div>
                  <div className="coach-team">{getCoachTeam(coachId)}</div>
                </div>
                <div className="tasks-count">
                  {filteredTasks.length} Tarea{filteredTasks.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="tasks-grid">
                {filteredTasks.map(task => (
                  <div key={task.id || task._id} className="task-card-admin" onClick={() => openViewModal(task)}> {/* Añadido onClick */}
                    {task.image && <img src={task.image} alt={task.title} className="task-image-admin" />}
                    <div className="task-content-admin">
                      <h3 className="task-title-admin">{task.title}</h3>
                      <p className="task-category-admin">{task.category}</p>
                      <div className="task-meta-admin">
                        <span><i className="fas fa-users"></i> {task.participants}</span>
                        <span><i className="fas fa-clock"></i> {task.duration} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Renderizar el modal de visualización */}
      {selectedTaskForView && (
        <AdminTaskViewModal task={selectedTaskForView} onClose={closeViewModal} />
      )}
    </div>
  );
}

export default AdminTasksSection;