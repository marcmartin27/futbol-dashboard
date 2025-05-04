import React, { useState, useEffect } from 'react';
import { updatePlayer } from '../../services/playerService';
import '../../styles/_playerModal.scss';

const POSITIONS = [
  { value: 'POR', label: 'Portero' },
  { value: 'DEF', label: 'Defensa Central' },
  { value: 'LTD', label: 'Lateral Derecho' },
  { value: 'LTI', label: 'Lateral Izquierdo' },
  { value: 'MCD', label: 'Mediocentro Defensivo' },
  { value: 'MC', label: 'Mediocentro' },
  { value: 'MCO', label: 'Mediocentro Ofensivo' },
  { value: 'ED', label: 'Extremo Derecho' },
  { value: 'EI', label: 'Extremo Izquierdo' },
  { value: 'SD', label: 'Segunda Punta' },
  { value: 'DEL', label: 'Delantero' }
];

const PlayerDetailModal = ({ player, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (player) {
      setEditForm({
        name: player.name || '',
        last_name: player.last_name || '',
        number: player.number || '',
        position: player.position || '',
        age: player.age || '',
        nationality: player.nationality || '',
        height: player.height || '',
        weight: player.weight || '',
        photo_url: player.photo_url || ''
      });
    }
  }, [player]);

  if (!player) return null;

  const getPositionName = (code) => {
    const position = POSITIONS.find(p => p.value === code);
    return position ? position.label : code;
  };

  const getPositionColor = (position) => {
    const colors = {
      'POR': '#f1c40f',
      'DEF': '#3498db',
      'LTD': '#2980b9',
      'LTI': '#2980b9',
      'MCD': '#27ae60',
      'MC': '#27ae60',
      'MCO': '#16a085',
      'ED': '#e74c3c',
      'EI': '#e74c3c',
      'SD': '#c0392b',
      'DEL': '#c0392b'
    };
    return colors[position] || '#666';
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      // Convertir campos numéricos
      const playerData = {
        ...editForm,
        number: parseInt(editForm.number),
        age: parseInt(editForm.age),
        height: editForm.height ? parseInt(editForm.height) : undefined,
        weight: editForm.weight ? parseInt(editForm.weight) : undefined
      };
      
      await updatePlayer(player.id, playerData);
      
      // Llamar al callback para actualizar la vista principal
      onUpdate();
      setIsEditing(false);
    } catch (err) {
      setError(`Error al actualizar jugador: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calcula la edad basada en el año actual
  const calculateAge = (age) => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    return `${age} años (${birthYear})`;
  };

  // Calcula el IMC (Índice de Masa Corporal) si hay altura y peso
  const calculateBMI = () => {
    if (player.height && player.weight) {
      const heightInMeters = player.height / 100;
      const bmi = player.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();
  
  // Determinar la categoría del IMC
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: '#3498db' };
    if (bmi < 25) return { label: 'Peso normal', color: '#2ecc71' };
    if (bmi < 30) return { label: 'Sobrepeso', color: '#f39c12' };
    return { label: 'Obesidad', color: '#e74c3c' };
  };

  const renderEditForm = () => (
    <form className="player-edit-form" onSubmit={handleUpdate}>
      <div className="edit-section">
        <h3>Información básica</h3>
        <div className="form-row">
          <div className="form-control">
            <label htmlFor="name">Nombre</label>
            <input 
              id="name"
              name="name" 
              value={editForm.name} 
              onChange={handleEditChange} 
              required 
            />
          </div>
          <div className="form-control">
            <label htmlFor="last_name">Apellido</label>
            <input 
              id="last_name"
              name="last_name" 
              value={editForm.last_name} 
              onChange={handleEditChange} 
              required 
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-control">
            <label htmlFor="number">Dorsal</label>
            <input 
              id="number"
              name="number" 
              type="number" 
              min="1"
              max="99"
              value={editForm.number} 
              onChange={handleEditChange} 
              required 
            />
          </div>
          <div className="form-control">
            <label htmlFor="position">Posición</label>
            <select 
              id="position"
              name="position" 
              value={editForm.position} 
              onChange={handleEditChange} 
              required
            >
              <option value="">Seleccionar posición</option>
              {POSITIONS.map(pos => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="edit-section">
        <h3>Datos personales</h3>
        <div className="form-row">
          <div className="form-control">
            <label htmlFor="age">Edad</label>
            <input 
              id="age"
              name="age" 
              type="number" 
              min="16"
              max="50"
              value={editForm.age} 
              onChange={handleEditChange} 
              required 
            />
          </div>
          <div className="form-control">
            <label htmlFor="nationality">Nacionalidad</label>
            <input 
              id="nationality"
              name="nationality" 
              value={editForm.nationality} 
              onChange={handleEditChange} 
              required 
            />
          </div>
        </div>
      </div>
      
      <div className="edit-section">
        <h3>Características físicas</h3>
        <div className="form-row">
          <div className="form-control">
            <label htmlFor="height">Altura (cm)</label>
            <input 
              id="height"
              name="height" 
              type="number" 
              min="150"
              max="220"
              value={editForm.height} 
              onChange={handleEditChange} 
            />
          </div>
          <div className="form-control">
            <label htmlFor="weight">Peso (kg)</label>
            <input 
              id="weight"
              name="weight" 
              type="number"
              min="50"
              max="120" 
              value={editForm.weight} 
              onChange={handleEditChange} 
            />
          </div>
        </div>
      </div>
      
      <div className="edit-section">
        <h3>Imagen</h3>
        <div className="form-row">
          <div className="form-control full-width">
            <label htmlFor="photo_url">URL de la foto</label>
            <input 
              id="photo_url"
              name="photo_url" 
              type="url"
              value={editForm.photo_url} 
              onChange={handleEditChange} 
              placeholder="https://ejemplo.com/foto.jpg" 
            />
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => setIsEditing(false)}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );

  const renderPlayerDetails = () => (
    <>
      <div className="player-detail-tabs">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <i className="fas fa-user"></i> General
        </button>
        <button 
          className={`tab-button ${activeTab === 'physical' ? 'active' : ''}`}
          onClick={() => setActiveTab('physical')}
        >
          <i className="fas fa-dumbbell"></i> Físico
        </button>
        <button 
          className={`tab-button ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          <i className="fas fa-futbol"></i> Técnica
        </button>
      </div>
      
      <div className="player-detail-content">
        {activeTab === 'general' && (
          <div className="player-detail-tab-content">
            <div className="detail-row">
              <div className="detail-label">Nombre completo</div>
              <div className="detail-value">{player.name} {player.last_name}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Dorsal</div>
              <div className="detail-value">
                <span className="detail-badge">{player.number}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Posición</div>
              <div className="detail-value">
                <span 
                  className="position-badge" 
                  style={{backgroundColor: getPositionColor(player.position)}}
                >
                  {getPositionName(player.position)}
                </span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Edad</div>
              <div className="detail-value">{calculateAge(player.age)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Nacionalidad</div>
              <div className="detail-value">{player.nationality}</div>
            </div>
          </div>
        )}
        
        {activeTab === 'physical' && (
          <div className="player-detail-tab-content">
            <div className="detail-row">
              <div className="detail-label">Altura</div>
              <div className="detail-value">
                {player.height ? `${player.height} cm` : 'No especificado'}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Peso</div>
              <div className="detail-value">
                {player.weight ? `${player.weight} kg` : 'No especificado'}
              </div>
            </div>
            
            {bmi && (
              <>
                <div className="detail-row">
                  <div className="detail-label">IMC</div>
                  <div className="detail-value">{bmi}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Categoría de peso</div>
                  <div className="detail-value">
                    <span 
                      className="bmi-badge" 
                      style={{backgroundColor: getBMICategory(bmi).color}}
                    >
                      {getBMICategory(bmi).label}
                    </span>
                  </div>
                </div>
              </>
            )}
            
            <div className="physical-stats">
              <div className="stat-item">
                <div className="stat-value">
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="stat-label">Velocidad</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.random() * 60 + 40}%`}}></div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  <i className="fas fa-running"></i>
                </div>
                <div className="stat-label">Resistencia</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.random() * 60 + 40}%`}}></div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  <i className="fas fa-fist-raised"></i>
                </div>
                <div className="stat-label">Fuerza</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.random() * 60 + 40}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'technical' && (
          <div className="player-detail-tab-content">
            <div className="technical-stats">
              <div className="stat-item">
                <div className="stat-value">
                  <i className="fas fa-futbol"></i>
                </div>
                <div className="stat-label">Control</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.random() * 60 + 40}%`}}></div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  <i className="fas fa-arrows-alt"></i>
                </div>
                <div className="stat-label">Pases</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.random() * 60 + 40}%`}}></div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  <i className="fas fa-bullseye"></i>
                </div>
                <div className="stat-label">Precisión</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.random() * 60 + 40}%`}}></div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  <i className="fas fa-rocket"></i>
                </div>
                <div className="stat-label">Disparo</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.random() * 60 + 40}%`}}></div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="stat-label">Inteligencia</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.random() * 60 + 40}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="player-modal-backdrop">
      <div className="player-modal">
        <div className="player-modal-header">
          <h2>{isEditing ? 'Editar Jugador' : 'Detalles del Jugador'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="player-modal-body">
          <div className="player-profile">
            <div className="player-profile-photo">
              {player.photo_url ? (
                <img src={player.photo_url} alt={`${player.name} ${player.last_name}`} />
              ) : (
                <div className="player-profile-photo-placeholder">
                  <i className="fas fa-user"></i>
                  <span>{player.name[0]}{player.last_name[0]}</span>
                </div>
              )}
            </div>
            
            <div className="player-profile-info">
              <h3 className="player-profile-name">{player.name} {player.last_name}</h3>
              <div className="player-profile-meta">
                <div className="player-profile-number">
                  <div className="profile-badge" style={{backgroundColor: getPositionColor(player.position)}}>
                    {player.number}
                  </div>
                </div>
                <div className="player-profile-position">
                  {getPositionName(player.position)}
                </div>
              </div>
            </div>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-player-button"
              >
                <i className="fas fa-edit"></i> Editar
              </button>
            )}
          </div>
          
          <div className="player-modal-content">
            {isEditing ? renderEditForm() : renderPlayerDetails()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailModal;