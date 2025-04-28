import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setAuth, getAuth, isAuthenticated, authHeader, logout } from './services/auth';
import { getUser } from './services/userService';


import './App.scss';


// Reemplaza la función Login actual con esta versión mejorada
function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      
      // Usar el servicio de autenticación
      setAuth(data);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <div className="logo">
            <i className="fas fa-futbol fa-2x"></i>
          </div>
          <h1>Futbol Dashboard</h1>
        </div>
        
        <div className="auth-body">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
          
          <div className="auth-link">
            <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reemplaza la función Register actual con esta versión mejorada
function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(Object.values(data).flat().join(' '));
      }
      
      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <div className="logo">
            <i className="fas fa-futbol fa-2x"></i>
          </div>
          <h1>Crear Nueva Cuenta</h1>
        </div>
        
        <div className="auth-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="first_name">Nombre</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Apellido</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
          
          <div className="auth-link">
            <p>¿Ya tienes cuenta? <a href="/login">Iniciar Sesión</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reemplazar la función Dashboard actual con esta versión mejorada
function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ name: '', city: '', founded: '' });
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  
    // Cargar equipos al iniciar
    loadTeams();
  }, []); // Array vacío para que solo se ejecute una vez

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/teams/', {
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
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
      console.error("Error cargando equipos:", err);
      setError("Error cargando los equipos: " + err.message);
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
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          city: form.city,
          founded: parseInt(form.founded, 10)
        })
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
      setForm({ name: '', city: '', founded: '' });
      loadTeams(); // Recargar la lista de equipos
    } catch (err) {
      console.error("Error creando equipo:", err);
      setError("Error creando equipo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
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
      {/* Sidebar */}
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
            <a href="#" className="nav-link active">
              <span className="nav-icon"><i className="fas fa-tachometer-alt"></i></span>
              <span className="nav-text">Dashboard</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon"><i className="fas fa-futbol"></i></span>
              <span className="nav-text">Equipos</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon"><i className="fas fa-users"></i></span>
              <span className="nav-text">Jugadores</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon"><i className="fas fa-trophy"></i></span>
              <span className="nav-text">Competiciones</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon"><i className="fas fa-chart-line"></i></span>
              <span className="nav-text">Estadísticas</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
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
      
      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <h1 className="page-title">Gestión de Equipos</h1>
        </div>
        
        <div className="content-wrapper">
          {error && <div className="error-message">{error}</div>}
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Crear Nuevo Equipo</h2>
            </div>
            <div className="card-body">
              <form className="team-form" onSubmit={handleSubmit}>
                <div className="form-control">
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="Nombre del equipo" 
                    required 
                  />
                </div>
                <div className="form-control">
                  <input 
                    name="city" 
                    value={form.city} 
                    onChange={handleChange} 
                    placeholder="Ciudad" 
                    required 
                  />
                </div>
                <div className="form-control">
                  <input 
                    name="founded" 
                    type="number" 
                    value={form.founded} 
                    onChange={handleChange} 
                    placeholder="Año fundación" 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <i className="fas fa-plus btn-icon"></i>
                  {loading ? 'Creando...' : 'Crear Equipo'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Equipos Registrados</h2>
            </div>
            <div className="card-body">
              {loading && <p className="loading">Cargando equipos...</p>}
              
              {!loading && teams.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="fas fa-futbol"></i>
                  </div>
                  <p className="empty-state-message">No hay equipos registrados</p>
                  <p>Crea tu primer equipo utilizando el formulario de arriba.</p>
                </div>
              ) : (
                <ul className="team-list">
                  {teams.map(team => (
                    <li key={team.id || team._id} className="team-item">
                      <div className="team-logo">
                        {getInitials(team.name)}
                      </div>
                      <div className="team-info">
                        <div className="team-name">{team.name}</div>
                        <div className="team-details">
                          <span className="team-city"><i className="fas fa-map-marker-alt"></i> {team.city}</span>
                          <span className="team-founded"><i className="fas fa-calendar"></i> Fundado en {team.founded}</span>
                        </div>
                      </div>
                      <div className="team-actions">
                        <button className="btn btn-icon-only" title="Editar equipo">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-icon-only" title="Eliminar equipo">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// Componente principal App
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated() ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;