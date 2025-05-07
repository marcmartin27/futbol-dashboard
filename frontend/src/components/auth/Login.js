import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuth } from '../../services/auth';
import '../../styles/main.scss';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });
      
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        if (response.ok) {
          const data = await response.json();
          
          const userData = {
            ...data.user,
            token: data.token,
            role: data.user.role || 'user' 
          };
          
          setAuth(userData);
          navigate('/dashboard');
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Credenciales inválidas");
        }
      } else {
        const text = await response.text();
        throw new Error("El servidor no devolvió JSON. Posiblemente hay un error en el backend.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor. Verifica que el backend esté funcionando.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      {/* Columna izquierda con imagen */}
      <div className="auth-image-column">
        <div className="logo-container">
          <img src={require('../../assets/images/logo.png')} alt="Team Manager" className="logo-large" />
        </div>
        <div className="image-content">
          <h1 className="brand-tagline">Gestiona tu equipo al siguiente nivel</h1>
          <p className="brand-description">
            La plataforma integral para entrenadores, jugadores y directivos de fútbol.
          </p>
        </div>
      </div>
      
      {/* Columna derecha con formulario */}
      <div className="auth-form-column">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1 className="app-title">Team Manager</h1>
            <p className="app-subtitle">Inicia sesión en tu cuenta</p>
          </div>
          
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

export default Login;