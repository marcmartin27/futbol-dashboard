// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import Sidebar from './Sidebar';
import TeamSection from './TeamSection';
import UsersSection from './UsersSection';
import '../../styles/main.scss';

function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({ name: '', city: '', founded: '' });
  const [userForm, setUserForm] = useState({ username: '', email: '', role: '' });
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState('teams');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Cargar los datos del usuario
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    
    // Cargar equipos
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/teams/', {
        headers: authHeader()
      });
      
      if (!response.ok) {
        const clonedResponse = response.clone();
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
          const textError = await clonedResponse.text();
          throw new Error(`Error ${response.status}: ${textError.substring(0, 100)}...`);
        }
      }
      
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error cargando equipos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/users/', {
        headers: authHeader()
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error cargando usuarios: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = e => {
    setTeamForm({ ...teamForm, [e.target.name]: e.target.value });
  };

  const handleUserChange = e => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };


  const handleTeamSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/teams/create/', {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamForm)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      // Limpiar el formulario y recargar equipos
      setTeamForm({ name: '', city: '', founded: '' });
      loadTeams();
    } catch (err) {
      setError("Error creando equipo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/users/', {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      // Limpiar el formulario y recargar usuarios
      setUserForm({ username: '', email: '', role: '' });
      loadUsers();
    } catch (err) {
      setError("Error creando usuario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Función para obtener las iniciales para el logo del equipo
  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        user={user} 
        sidebarCollapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        activePage={activePage}
        setActivePage={setActivePage}
      />
      
      <div className="main-content">
        <div className="top-bar">
          <h1 className="page-title">Gestión de Equipos</h1>
        </div>
        
        {activePage === 'teams' && (
          <TeamSection 
            teams={teams}
            form={teamForm}
            loading={loading}
            error={error}
            handleChange={handleTeamChange}
            handleSubmit={handleTeamSubmit}
            getInitials={getInitials}
          />
        )}
        
        {/* Aquí puedes añadir más secciones para otras páginas */}
        {activePage === 'dashboard' && (
          <div className="content-wrapper">
            <h2>Dashboard Principal</h2>
            <p>Bienvenido al panel de control</p>
          </div>
        )}
        
        {activePage === 'users' && (
          <UsersSection 
            users={users}
            form={userForm}
            loading={loading}
            error={error}
            handleChange={handleUserChange}
            handleSubmit={handleUserSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;