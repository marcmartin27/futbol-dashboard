import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth';
import teamManagerLogo from '../../assets/images/logo-small.png'; 


function Sidebar({ user, sidebarCollapsed, toggleSidebar, activePage, setActivePage }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAdmin = user && user.role === 'admin';
  const isCoach = user && user.role === 'coach';

  const menuItems = [
    // Común para todos
    { id: 'dashboard', label: 'Inicio', icon: 'fa-home', roles: ['admin', 'coach'] },
    
    // Admin
    { id: 'teams', label: 'Equipos', icon: 'fa-shield-alt', roles: ['admin'] },
    { id: 'users', label: 'Usuarios', icon: 'fa-users-cog', roles: ['admin'] },
    { id: 'admin-tasks', label: 'Tareas (Admin)', icon: 'fa-tasks', roles: ['admin'] },
    { id: 'admin-sessions', label: 'Sesiones (Admin)', icon: 'fa-calendar-alt', roles: ['admin'] },
    { id: 'admin-minutes', label: 'Minutos (Admin)', icon: 'fa-stopwatch', roles: ['admin'] },
    { id: 'admin-attendance', label: 'Asistencia (Admin)', icon: 'fa-user-check', roles: ['admin'] },

    // Coach
    { id: 'myteam', label: 'Mi Equipo', icon: 'fa-users', roles: ['coach'] },
    { id: 'tasks', label: 'Mis Tareas', icon: 'fa-clipboard-list', roles: ['coach'] },
    { id: 'sessions', label: 'Mis Sesiones', icon: 'fa-calendar-plus', roles: ['coach'] },
    { id: 'attendance', label: 'Asistencia', icon: 'fa-user-check', roles: ['coach'] },
    { id: 'minutes', label: 'Minutos Jugados', icon: 'fa-running', roles: ['coach'] },
    
    // Común para todos al final
    { id: 'settings', label: 'Configuración', icon: 'fa-cog', roles: ['admin', 'coach'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-logo">
          {/* Asegúrate que la ruta al logo sea correcta o usa un ícono */}
          <img src={teamManagerLogo} alt="Team Manager Logo" />
        </div>
        {!sidebarCollapsed && <span className="brand-text">Team Manager</span>}
      </div>

      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
      </button>

      <ul className="nav-menu">
        {filteredMenuItems.map(item => (
          <li key={item.id} className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activePage === item.id ? 'active' : ''}`} 
              onClick={(e) => {
                e.preventDefault();
                setActivePage(item.id);
              }}
              title={sidebarCollapsed ? item.label : ''}
            >
              <i className={`nav-icon fas ${item.icon}`}></i>
              {!sidebarCollapsed && <span className="nav-text">{item.label}</span>}
            </a>
          </li>
        ))}
      </ul>

      <div className="user-panel">
        <div className="user-avatar">
          <i className="fas fa-user"></i>
        </div>
        {!sidebarCollapsed && (
          <div className="user-info">
            <div className="user-name">{user?.first_name || user?.username}</div>
            <div className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Entrenador'}</div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Cerrar Sesión">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;