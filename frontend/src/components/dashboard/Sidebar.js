import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth';

function Sidebar({ user, sidebarCollapsed, toggleSidebar, activePage, setActivePage }) {
  const navigate = useNavigate();
  
  // Depuración para verificar el usuario y su rol
  console.log("Usuario en sidebar:", user);
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Determinar roles con verificación estricta
  const isAdmin = user && user.role === 'admin';
  const isCoach = user && user.role === 'coach';
  const isUser = user && (user.role === 'user' || !user.role);
  
  // Mostrar en consola para depuración
  console.log(`Roles: Admin=${isAdmin}, Coach=${isCoach}, User=${isUser}`);

  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-logo">
          <i className="fas fa-futbol"></i>
        </div>
        <div className="brand-text">Futbol Dashboard</div>
        
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </div>
      </div>
      
      <ul className="nav-menu">
        <li className="nav-item">
          <a 
            href="#" 
            className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <span className="nav-icon"><i className="fas fa-tachometer-alt"></i></span>
            <span className="nav-text">Dashboard</span>
          </a>
        </li>
        
        {/* Opciones solo para administradores */}
        {isAdmin && (
          <>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'teams' ? 'active' : ''}`}
                onClick={() => setActivePage('teams')}
              >
                <span className="nav-icon"><i className="fas fa-futbol"></i></span>
                <span className="nav-text">Equipos</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'users' ? 'active' : ''}`}
                onClick={() => setActivePage('users')}
              >
                <span className="nav-icon"><i className="fas fa-users"></i></span>
                <span className="nav-text">Gestión de Usuarios</span>
              </a>
            </li>
          </>
        )}
        
        {isCoach && (
          <>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'myteam' ? 'active' : ''}`}
                onClick={() => setActivePage('myteam')}
              >
                <span className="nav-icon"><i className="fas fa-users"></i></span>
                <span className="nav-text">Mi Equipo</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'trainings' ? 'active' : ''}`}
                onClick={() => setActivePage('trainings')}
              >
                <span className="nav-icon"><i className="fas fa-running"></i></span>
                <span className="nav-text">Entrenamientos</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'attendance' ? 'active' : ''}`}
                onClick={() => setActivePage('attendance')}
              >
                <span className="nav-icon"><i className="fas fa-clipboard-check"></i></span>
                <span className="nav-text">Control de Asistencia</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#"
                className={`nav-link ${activePage === 'minutes' ? 'active' : ''}`}
                onClick={() => setActivePage('minutes')}
              >
                <span className="nav-icon"><i className="fas fa-stopwatch"></i></span>
                <span className="nav-text">Minutaje</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#"
                className={`nav-link ${activePage === 'tasks' ? 'active' : ''}`}
                onClick={() => setActivePage('tasks')}
              >
                <span className="nav-icon"><i className="fas fa-tasks"></i></span>
                <span className="nav-text">Mis Tareas</span>
              </a>
            </li>

            <li className="nav-item">
              <a 
                href="#"
                className={`nav-link ${activePage === 'sessions' ? 'active' : ''}`}
                onClick={() => setActivePage('sessions')}
              >
                <span className="nav-icon"><i className="fas fa-stream"></i></span>
                <span className="nav-text">Sesiones</span>
              </a>
            </li>

          </>
        )}
        
        {/* Opciones para usuarios regulares */}
        {isUser && (
          <li className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activePage === 'matches' ? 'active' : ''}`}
              onClick={() => setActivePage('matches')}
            >
              <span className="nav-icon"><i className="fas fa-trophy"></i></span>
              <span className="nav-text">Partidos</span>
            </a>
          </li>
        )}
        
        <li className="nav-item">
          <a 
            href="#" 
            className={`nav-link ${activePage === 'settings' ? 'active' : ''}`}
            onClick={() => setActivePage('settings')}
          >
            <span className="nav-icon"><i className="fas fa-cog"></i></span>
            <span className="nav-text">Configuración</span>
          </a>
        </li>
      </ul>
      
      <div className="user-panel">
        <div className="user-avatar">
          <i className="fas fa-user"></i>
        </div>
        <div className="user-info">
          <div className="user-name">{user?.first_name || user?.username}</div>
          <div className="user-role">
            {user?.role === 'admin' ? 'Administrador' : 
            user?.role === 'coach' ? 'Entrenador' : 'Usuario'}
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;