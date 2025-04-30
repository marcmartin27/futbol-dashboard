// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import Sidebar from './Sidebar';
import TeamSection from './TeamSection';
import UsersSection from './UsersSection';
import '../../styles/main.scss';

function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ name: '', city: '', founded: '' });
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
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
        body: JSON.stringify(form)
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
      
      // Limpiar el formulario y recargar los equipos
      setForm({ name: '', city: '', founded: '' });
      loadTeams();
    } catch (err) {
      setError("Error creando equipo: " + err.message);
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
            form={form}
            loading={loading}
            error={error}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
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
        
        {activePage === 'players' && (
          <UsersSection 
            users={users}
            form={form}
            loading={loading}
            error={error}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;