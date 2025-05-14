import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth';

function Sidebar({ user, sidebarCollapsed, toggleSidebar, activePage, setActivePage }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Determinar roles
  const isAdmin = user && user.role === 'admin';
  const isCoach = user && user.role === 'coach';
  const isUser = user && (user.role === 'user' || !user.role);
  
  return (
    <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-logo">
          <img src={require('../../assets/images/logo-small.png')} alt="Logo"/>
        </div>
        <span className="brand-text">Team Manager</span>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
        </div>
      </div>
      
      <ul className="nav-menu">
        {/* Elementos comunes para todos los usuarios */}
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
        
        {/* Elementos solo para admin */}
        {isAdmin && (
          <>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'teams' ? 'active' : ''}`}
                onClick={() => setActivePage('teams')}
              >
                <span className="nav-icon"><i className="fas fa-users"></i></span>
                <span className="nav-text">Gestion Equipos</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'users' ? 'active' : ''}`}
                onClick={() => setActivePage('users')}
              >
                <span className="nav-icon"><i className="fas fa-user-cog"></i></span>
                <span className="nav-text">Gestion Usuarios</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'admin-tasks' ? 'active' : ''}`}
                onClick={() => setActivePage('admin-tasks')}
              >
                <span className="nav-icon"><i className="fas fa-tasks"></i></span>
                <span className="nav-text">Gestion Tareas</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'admin-sessions' ? 'active' : ''}`}
                onClick={() => setActivePage('admin-sessions')}
              >
                <span className="nav-icon"><i className="fas fa-calendar-alt"></i></span>
                <span className="nav-text">Gestion Sesiones</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'admin-minutes' ? 'active' : ''}`}
                onClick={() => setActivePage('admin-minutes')}
              >
                <span className="nav-icon"><i className="fas fa-stopwatch"></i></span>
                <span className="nav-text">Control Minutaje</span>
              </a>
            </li>
            
            {/* Nueva opción para administrador - Control de Asistencia */}
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'admin-attendance' ? 'active' : ''}`}
                onClick={() => setActivePage('admin-attendance')}
              >
                <span className="nav-icon"><i className="fas fa-clipboard-check"></i></span>
                <span className="nav-text">Control Asistencia</span>
              </a>
            </li>
          </>
        )}
        
        {/* Elementos solo para entrenadores */}
        {isCoach && (
          <>
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'myteam' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('myteam');
                  navigate(`/dashboard`);
                }}
              >
                <span className="nav-icon"><i className="fas fa-users"></i></span>
                <span className="nav-text">Mi Equipo</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'attendance' ? 'active' : ''}`}
                onClick={() => setActivePage('attendance')}
              >
                <span className="nav-icon"><i className="fas fa-clipboard-check"></i></span>
                <span className="nav-text">Asistencia</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'tasks' ? 'active' : ''}`}
                onClick={() => setActivePage('tasks')}
              >
                <span className="nav-icon"><i className="fas fa-clipboard-list"></i></span>
                <span className="nav-text">Mis Tareas</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'sessions' ? 'active' : ''}`}
                onClick={() => setActivePage('sessions')}
              >
                <span className="nav-icon"><i className="fas fa-calendar-alt"></i></span>
                <span className="nav-text">Sesiones</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activePage === 'minutes' ? 'active' : ''}`}
                onClick={() => setActivePage('minutes')}
              >
                <span className="nav-icon"><i className="fas fa-stopwatch"></i></span>
                <span className="nav-text">Control de Minutaje</span>
              </a>
            </li>
          </>
        )}
        
        {/* Elementos para configuración (todos los usuarios) */}
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
          <div className="user-name">{user?.username}</div>
          <div className="user-role">
            {user?.role === 'admin' && 'Administrador'}
            {user?.role === 'coach' && 'Entrenador'}
            {(user?.role === 'user' || !user?.role) && 'Usuario'}
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;