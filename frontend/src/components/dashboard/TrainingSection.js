import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';

function TrainingSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  
  return (
    <div className="content-wrapper">
      <h2>Gestión de Entrenamientos</h2>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Programar Nuevo Entrenamiento</h2>
        </div>
        <div className="card-body">
          <form className="training-form">
            <div className="form-row">
              <div className="form-control">
                <label>Título</label>
                <input 
                  type="text"
                  placeholder="Título del entrenamiento" 
                  required 
                />
              </div>
              
              <div className="form-control">
                <label>Fecha</label>
                <input 
                  type="date"
                  required 
                />
              </div>
              
              <div className="form-control">
                <label>Duración (minutos)</label>
                <input 
                  type="number"
                  min="15"
                  step="15"
                  placeholder="90" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-control">
              <label>Descripción</label>
              <textarea 
                rows="4"
                placeholder="Detalles del entrenamiento..."
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-plus btn-icon"></i>
              Añadir Entrenamiento
            </button>
          </form>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Próximos Entrenamientos</h2>
        </div>
        <div className="card-body">
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <p className="empty-state-message">No hay entrenamientos programados</p>
            <p>Utiliza el formulario de arriba para programar un nuevo entrenamiento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainingSection;