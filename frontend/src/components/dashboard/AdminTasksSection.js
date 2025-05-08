import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';

function AdminTasksSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasksByCoach, setTasksByCoach] = useState({});
  const [coaches, setCoaches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadAllTasks();
  }, []);

  // Cargar todas las tareas y agruparlas por entrenador
  const loadAllTasks = async () => {
    try {
      setLoading(true);
      
      // Obtener lista de entrenadores
      const coachesResponse = await fetch('http://localhost:8000/api/users/', {
        headers: authHeader()
      });
      
      if (!coachesResponse.ok) {
        throw new Error(`Error ${coachesResponse.status}`);
      }
      
      const coachesData = await coachesResponse.json();
      const coachesList = coachesData.filter(user => user.role === 'coach');
      setCoaches(coachesList);
      
      // Obtener todas las tareas (API modificada para admins)
      const tasksResponse = await fetch('http://localhost:8000/api/tasks/all/', {
        headers: authHeader()
      });
      
      if (!tasksResponse.ok) {
        throw new Error(`Error ${tasksResponse.status}`);
      }
      
      const tasksData = await tasksResponse.json();
      
      // Extraer categorías únicas
      const uniqueCategories = [...new Set(tasksData.map(task => task.category))];
      setCategories(uniqueCategories);
      
      // Agrupar tareas por entrenador
      const taskGroups = {};
      
      tasksData.forEach(task => {
        const coachId = task.owner;
        if (!taskGroups[coachId]) {
          taskGroups[coachId] = [];
        }
        taskGroups[coachId].push(task);
      });
      
      setTasksByCoach(taskGroups);
      
    } catch (err) {
      setError(`Error al cargar las tareas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombre completo del entrenador por ID
  const getCoachName = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    if (coach) {
      if (coach.first_name && coach.last_name) {
        return `${coach.first_name} ${coach.last_name}`;
      }
      return coach.username;
    }
    return "Entrenador desconocido";
  };

  // Obtener equipo del entrenador por ID
  const getCoachTeam = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    return coach?.team_name || "Sin equipo asignado";
  };

  // Obtener iniciales del nombre
  const getInitials = (coachId) => {
    const coach = coaches.find(c => c.id === coachId || c._id === coachId);
    if (coach) {
      if (coach.first_name && coach.last_name) {
        return `${coach.first_name[0]}${coach.last_name[0]}`.toUpperCase();
      }
      return coach.username.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  // Filtrar tareas basado en búsqueda y categoría
  const filterTasks = (tasks) => {
    if (!searchTerm && !filterCategory) return tasks;
    
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || task.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Resetear filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <h2>Tareas por Entrenador</h2>
        <div className="admin-loading">
          <i className="fas fa-spinner spinner"></i>
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
        {/* Filtros */}
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

        {/* Si no hay tareas */}
        {Object.keys(tasksByCoach).length === 0 && (
          <div className="admin-empty-state">
            <i className="fas fa-tasks icon"></i>
            <p className="title">No hay tareas creadas</p>
            <p className="description">Los entrenadores aún no han creado tareas en el sistema.</p>
          </div>
        )}

        {/* Lista de entrenadores con sus tareas */}
        {Object.keys(tasksByCoach).map(coachId => {
          const tasks = tasksByCoach[coachId];
          const filteredTasks = filterTasks(tasks);
          
          // No mostrar secciones vacías después del filtrado
          if (filteredTasks.length === 0) return null;
          
          return (
            <div key={coachId} className="coach-section">
              <div className="coach-header">
                <div className="coach-avatar">
                  {getInitials(coachId)}
                </div>
                <div className="coach-info">
                  <div className="coach-name">{getCoachName(coachId)}</div>
                  <div className="coach-team">
                    <i className="fas fa-futbol"></i>
                    {getCoachTeam(coachId)}
                  </div>
                </div>
                <div className="task-count">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
                </div>
              </div>
              
              <div className="coach-tasks">
                {filteredTasks.map(task => (
                  <div key={task.id || task._id} className="admin-task-card">
                    <img 
                      src={task.image} 
                      alt={task.title} 
                      className="task-image" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x180?text=Imagen+no+disponible';
                      }}
                    />
                    <div className="task-content">
                      <div className="task-header">
                        <h3 className="task-title">{task.title}</h3>
                        <span className="task-category">{task.category}</span>
                      </div>
                      <p className="task-description">
                        {task.description.length > 100 
                          ? `${task.description.substring(0, 100)}...` 
                          : task.description
                        }
                      </p>
                      <div className="task-details">
                        <div className="task-detail">
                          <i className="fas fa-users"></i>
                          {task.participants} participantes
                        </div>
                        <div className="task-detail">
                          <i className="fas fa-clock"></i>
                          {task.duration} min
                        </div>
                        <div className="task-detail">
                          <i className="fas fa-toolbox"></i>
                          {task.material}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminTasksSection;