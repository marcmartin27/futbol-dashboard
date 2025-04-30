// src/components/dashboard/Sidebar.js
import React from 'react';
import { logout } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.scss';

function Sidebar({ user, sidebarCollapsed, toggleSidebar, activePage, setActivePage }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            className={`nav-link ${activePage === 'players' ? 'active' : ''}`}
            onClick={() => setActivePage('players')}
          >
            <span className="nav-icon"><i className="fas fa-users"></i></span>
            <span className="nav-text">Gestión de Usuarios</span>
          </a>
        </li>
        <li className="nav-item">
          <a 
            href="#" 
            className={`nav-link ${activePage === 'competitions' ? 'active' : ''}`}
            onClick={() => setActivePage('competitions')}
          >
            <span className="nav-icon"><i className="fas fa-trophy"></i></span>
            <span className="nav-text">Competiciones</span>
          </a>
        </li>
        <li className="nav-item">
          <a 
            href="#" 
            className={`nav-link ${activePage === 'stats' ? 'active' : ''}`}
            onClick={() => setActivePage('stats')}
          >
            <span className="nav-icon"><i className="fas fa-chart-line"></i></span>
            <span className="nav-text">Estadísticas</span>
          </a>
        </li>
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
      
      <div className="sidebar-footer">
        <div className="user-avatar">
          <i className="fas fa-user"></i>
        </div>
        <div className="user-info">
          <div className="user-name">{user?.user?.username || 'Usuario'}</div>
          <div className="user-role">Administrador</div>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Cerrar Sesión">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;