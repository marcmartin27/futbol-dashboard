import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authHeader } from '../../services/auth';
import { getTeamPlayers, createPlayer, deletePlayer } from '../../services/playerService';
import '../../styles/_players.scss';

const POSITIONS = [
  { value: 'POR', label: 'Portero', color: '#f1c40f' },
  { value: 'DEF', label: 'Defensa Central', color: '#3498db' },
  { value: 'LTD', label: 'Lateral Derecho', color: '#2980b9' },
  { value: 'LTI', label: 'Lateral Izquierdo', color: '#2980b9' },
  { value: 'MCD', label: 'Mediocentro Defensivo', color: '#27ae60' },
  { value: 'MC', label: 'Mediocentro', color: '#27ae60' },
  { value: 'MCO', label: 'Mediocentro Ofensivo', color: '#16a085' },
  { value: 'ED', label: 'Extremo Derecho', color: '#e74c3c' },
  { value: 'EI', label: 'Extremo Izquierdo', color: '#e74c3c' },
  { value: 'SD', label: 'Segunda Punta', color: '#c0392b' },
  { value: 'DEL', label: 'Delantero', color: '#c0392b' }
];

function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerForm, setPlayerForm] = useState({
    name: '',
    last_name: '',
    number: '',
    position: '',
    age: '',
    nationality: '',
    height: '',
    weight: '',
    photo_url: ''
  });

  // Organizar jugadores por posición para visualización
  const groupedPlayers = players.reduce((groups, player) => {
    const position = player.position;
    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(player);
    return groups;
  }, {});

  // Cargar datos del equipo y jugadores
  useEffect(() => {
    const loadTeamDetails = async () => {
      try {
        setLoading(true);
        
        // Cargar detalles del equipo
        const teamResponse = await fetch(`http://localhost:8000/api/teams/${teamId}/`, {
          headers: authHeader()
        });
        
        if (!teamResponse.ok) {
          throw new Error(`Error ${teamResponse.status}: No se pudo cargar el equipo`);
        }
        
        const teamData = await teamResponse.json();
        setTeam(teamData);
        
        // Cargar jugadores del equipo
        const playersData = await getTeamPlayers(teamId);
        setPlayers(playersData);
        
      } catch (err) {
        setError(`Error: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamDetails();
  }, [teamId]);

  const handlePlayerChange = e => {
    const { name, value } = e.target;
    setPlayerForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePlayerSubmit = async e => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      // Convertir campos numéricos
      const playerData = {
        ...playerForm,
        number: parseInt(playerForm.number),
        age: parseInt(playerForm.age),
        height: playerForm.height ? parseInt(playerForm.height) : undefined,
        weight: playerForm.weight ? parseInt(playerForm.weight) : undefined
      };
      
      await createPlayer(teamId, playerData);
      
      // Limpiar formulario
      setPlayerForm({
        name: '',
        last_name: '',
        number: '',
        position: '',
        age: '',
        nationality: '',
        height: '',
        weight: '',
        photo_url: ''
      });
      
      // Recargar lista de jugadores
      const updatedPlayers = await getTeamPlayers(teamId);
      setPlayers(updatedPlayers);
      
    } catch (err) {
      setError(`Error al crear jugador: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('¿Estás seguro de eliminar este jugador?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deletePlayer(playerId);
      
      // Actualizar la lista de jugadores después de eliminar
      const updatedPlayers = await getTeamPlayers(teamId);
      setPlayers(updatedPlayers);
      
    } catch (err) {
      setError(`Error al eliminar jugador: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (positionCode) => {
    const position = POSITIONS.find(p => p.value === positionCode);
    return position ? position.color : '#666';
  };

  const getPositionLabel = (positionCode) => {
    const position = POSITIONS.find(p => p.value === positionCode);
    return position ? position.label : positionCode;
  };

  if (loading && !team) {
    return <div className="content-wrapper loading">Cargando datos del equipo...</div>;
  }

  return (
    <div className="content-wrapper">
      <div className="team-header">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left btn-icon"></i>
          Volver a Equipos
        </button>
        
        {team && (
          <div className="team-title">
            <div className="team-badge">
              {team.name.split(' ').map(word => word[0]).join('').toUpperCase()}
            </div>
            <h1>{team.name}</h1>
            <div className="team-meta">
              <span><i className="fas fa-map-marker-alt"></i> {team.city}</span>
              <span><i className="fas fa-calendar"></i> Fundado en {team.founded}</span>
            </div>
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="team-dashboard">
        <div className="card player-form-card">
          <div className="card-header">
            <h2 className="card-title">Añadir Jugador</h2>
          </div>
          <div className="card-body">
            <form className="player-form" onSubmit={handlePlayerSubmit}>
              <div className="form-row">
                <div className="form-control">
                  <label>Nombre</label>
                  <input 
                    name="name" 
                    value={playerForm.name} 
                    onChange={handlePlayerChange} 
                    placeholder="Nombre" 
                    required 
                  />
                </div>
                
                <div className="form-control">
                  <label>Apellido</label>
                  <input 
                    name="last_name" 
                    value={playerForm.last_name} 
                    onChange={handlePlayerChange} 
                    placeholder="Apellido" 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-control">
                  <label>Dorsal</label>
                  <input 
                    name="number" 
                    type="number" 
                    min="1"
                    max="99"
                    value={playerForm.number} 
                    onChange={handlePlayerChange} 
                    placeholder="Ej: 10" 
                    required 
                  />
                </div>
                
                <div className="form-control">
                  <label>Posición</label>
                  <select 
                    name="position" 
                    value={playerForm.position} 
                    onChange={handlePlayerChange} 
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
                
                <div className="form-control">
                  <label>Edad</label>
                  <input 
                    name="age" 
                    type="number" 
                    min="16"
                    max="50"
                    value={playerForm.age} 
                    onChange={handlePlayerChange} 
                    placeholder="Edad" 
                    required 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-control">
                  <label>Nacionalidad</label>
                  <input 
                    name="nationality" 
                    value={playerForm.nationality} 
                    onChange={handlePlayerChange} 
                    placeholder="Ej: España" 
                    required 
                  />
                </div>
                
                <div className="form-control">
                  <label>Altura (cm)</label>
                  <input 
                    name="height" 
                    type="number" 
                    value={playerForm.height} 
                    onChange={handlePlayerChange} 
                    placeholder="Ej: 180" 
                  />
                </div>
                
                <div className="form-control">
                  <label>Peso (kg)</label>
                  <input 
                    name="weight" 
                    type="number" 
                    value={playerForm.weight} 
                    onChange={handlePlayerChange} 
                    placeholder="Ej: 75" 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-control">
                  <label>URL Foto (opcional)</label>
                  <input 
                    name="photo_url" 
                    value={playerForm.photo_url} 
                    onChange={handlePlayerChange} 
                    placeholder="https://ejemplo.com/foto.jpg" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <i className="fas fa-plus btn-icon"></i>
                  {loading ? 'Añadiendo...' : 'Añadir Jugador'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="card roster-card">
          <div className="card-header">
            <h2 className="card-title">Plantilla del Equipo</h2>
            <span className="card-subtitle">
              Total: {players.length} jugadores
            </span>
          </div>
          
          <div className="card-body">
            {loading && <p className="loading">Actualizando plantilla...</p>}
            
            {!loading && players.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-user-slash"></i>
                </div>
                <p className="empty-state-message">Este equipo no tiene jugadores</p>
                <p>Añade tu primer jugador utilizando el formulario.</p>
              </div>
            ) : (
              <div className="player-roster">
                {/* Porteros */}
                {groupedPlayers['POR'] && (
                  <div className="position-group">
                    <div className="position-header" style={{ backgroundColor: getPositionColor('POR') }}>
                      <i className="fas fa-hands"></i> Porteros
                    </div>
                    <div className="position-players">
                      {groupedPlayers['POR'].map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Defensas */}
                {(groupedPlayers['DEF'] || groupedPlayers['LTD'] || groupedPlayers['LTI']) && (
                  <div className="position-group">
                    <div className="position-header" style={{ backgroundColor: getPositionColor('DEF') }}>
                      <i className="fas fa-shield-alt"></i> Defensas
                    </div>
                    <div className="position-players">
                      {groupedPlayers['LTD']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">LTD</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      
                      {groupedPlayers['DEF']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">DC</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      
                      {groupedPlayers['LTI']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">LTI</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Centrocampistas */}
                {(groupedPlayers['MCD'] || groupedPlayers['MC'] || groupedPlayers['MCO']) && (
                  <div className="position-group">
                    <div className="position-header" style={{ backgroundColor: getPositionColor('MC') }}>
                      <i className="fas fa-cog"></i> Centrocampistas
                    </div>
                    <div className="position-players">
                      {groupedPlayers['MCD']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">MCD</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      
                      {groupedPlayers['MC']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">MC</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      
                      {groupedPlayers['MCO']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">MCO</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Atacantes */}
                {(groupedPlayers['ED'] || groupedPlayers['EI'] || groupedPlayers['SD'] || groupedPlayers['DEL']) && (
                  <div className="position-group">
                    <div className="position-header" style={{ backgroundColor: getPositionColor('DEL') }}>
                      <i className="fas fa-futbol"></i> Atacantes
                    </div>
                    <div className="position-players">
                      {groupedPlayers['ED']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">ED</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      
                      {groupedPlayers['EI']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">EI</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      
                      {groupedPlayers['SD']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">SD</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      
                      {groupedPlayers['DEL']?.map(player => (
                        <div key={player.id} className="player-card">
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">DEL</div>
                          <div className="player-photo">
                            {player.photo_url ? 
                              <img src={player.photo_url} alt={player.name} /> : 
                              <i className="fas fa-user"></i>
                            }
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <span className="player-age">{player.age} años</span>
                              <span className="player-nationality">{player.nationality}</span>
                            </div>
                          </div>
                          <button className="btn-icon-only delete-player" onClick={() => handleDeletePlayer(player.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamDetailPage;