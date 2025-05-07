import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/main.scss';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }
      
      setSuccess('Registro exitoso. Redirigiendo...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      {/* Columna izquierda con imagen */}
      <div className="auth-image-column">
        <div className="image-content">
          <div className="brand-logo">
            <i className="fas fa-futbol"></i>
          </div>
          <h1 className="brand-tagline">Únete a la comunidad de entrenadores</h1>
          <p className="brand-description">
            Registra tu cuenta y comienza a gestionar equipos de forma profesional.
          </p>
        </div>
      </div>
      
      {/* Columna derecha con formulario */}
      <div className="auth-form-column">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1 className="app-title">Team Manager</h1>
            <p className="app-subtitle">Crear una cuenta nueva</p>
          </div>
          
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

export default Register;