// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import Sidebar from './Sidebar';
import TeamSection from './TeamSection';
import UsersSection from './UsersSection';
import CoachTeamSection from './CoachTeamSection';
import TrainingSection from './TrainingSection';
import AttendanceSection from './AttendanceSection';
import MyTasksSection from './MyTasksSection'; // Agrega esta línea
import '../../styles/main.scss';
import MinutesSection from './MinutesSection';
import MySessions from './MySessions'; // Agrega esta línea junto a las demás importaciones



function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({ name: '', city: '', founded: '' });
  const [userForm, setUserForm] = useState({ username: '', email: '', role: '' });
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [users, setUsers] = useState([]);

  // Función para cargar usuarios
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

  // Cargar datos iniciales
  useEffect(() => {
    // Cargar datos del usuario
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    
    if (userData) {
      if (userData.role === 'admin') {
        setActivePage('teams');
        loadUsers();  // Si es admin, cargar usuarios al inicio
      } else if (userData.role === 'coach') {
        setActivePage('myteam');
      } else {
        setActivePage('dashboard');
      }
    }
    
    // Cargar equipos
    loadTeams();
  }, []);

  // Asegurarse de recargar usuarios cada vez que se active la sección de gestión de usuarios
  useEffect(() => {
    if (activePage === 'users') {
      loadUsers();
    }
  }, [activePage]);

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
      
      // Validaciones para el rol de entrenador
      if (userForm.role === 'coach' && !userForm.team) {
        setError("Los entrenadores deben tener un equipo asignado");
        setLoading(false);
        return;
      }
      
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
      setUserForm({ username: '', email: '', role: '', team: '' });
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
          <h1 className="page-title">
            {user?.role === 'admin' ? 'Panel de Administración' : 'Panel de Entrenador'}
          </h1>
        </div>
        
        {/* Secciones para administradores */}
        {user?.role === 'admin' && (
          <>
            {activePage === 'dashboard' && (
              <div className="content-wrapper">
                <h2>Dashboard Principal</h2>
                <p>Bienvenido al panel de control de administrador</p>
              </div>
            )}
            
            {activePage === 'teams' && (
              <TeamSection 
                teams={teams}
                form={teamForm}
                loading={loading}
                error={error}
                handleChange={handleTeamChange}
                handleSubmit={handleTeamSubmit}
                getInitials={getInitials}
                loadTeams={loadTeams}
              />
            )}
            
            {activePage === 'users' && (
              <UsersSection 
                users={users}
                form={userForm}
                loading={loading}
                error={error}
                handleChange={handleUserChange}
                handleSubmit={handleUserSubmit}
                refreshUsers={loadUsers}
              />
            )}
          </>
        )}
        
        {/* Secciones para entrenadores */}
        {user?.role === 'coach' && (
          <>
            {activePage === 'dashboard' && (
              <div className="content-wrapper">
                <h2>Dashboard de Entrenador</h2>
                <p>Bienvenido al panel de control de entrenador</p>
              </div>
            )}
            
            {activePage === 'myteam' && (
              <CoachTeamSection />
            )}
            
            {activePage === 'trainings' && (
              <TrainingSection />
            )}

            {activePage === 'attendance' && (
              <AttendanceSection />
            )}

            {activePage === 'tasks' && (
              <MyTasksSection />
            )}

            {activePage === 'sessions' && (
              <MySessions />
            )}

            {activePage === 'minutes' && (
              <MinutesSection />
            )}

          </>
        )}
        
        {/* Sección común para todos los usuarios */}
        {activePage === 'settings' && (
          <div className="content-wrapper">
            <h2>Configuración</h2>
            <p>Aquí podrás cambiar tus ajustes personales</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;