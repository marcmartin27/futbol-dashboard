// src/components/auth/Login.js
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
      console.log("Enviando solicitud de login a:", 'http://localhost:8000/api/login/');
      
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });
      
      // Mostrar información sobre la respuesta para diagnosticar
      console.log("Respuesta:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });
      
      // Verificar el tipo de contenido
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // Continuar con el procesamiento JSON normal
        if (response.ok) {
          const data = await response.json();
          
          // Información de depuración
          console.log("Datos de respuesta:", data);
          
          const userData = {
            ...data.user,
            token: data.token,
            role: data.user.role || 'user' 
          };
          
          setAuth(userData);
          console.log("Usuario autenticado con rol:", userData.role);
          navigate('/dashboard');
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Credenciales inválidas");
        }
      } else {
        // Si no es JSON, capturar el texto para depuración
        const text = await response.text();
        console.error("Respuesta HTML (primeros 150 caracteres):", text.substring(0, 150));
        throw new Error("El servidor no devolvió JSON. Posiblemente hay un error en el backend.");
      }
    } catch (err) {
      console.error("Error detallado:", err);
      setError("Error de conexión con el servidor. Verifica que el backend esté funcionando.");
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

export default Login;