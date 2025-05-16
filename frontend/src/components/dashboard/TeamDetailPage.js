import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authHeader } from '../../services/auth';
import PlayerDetailModal from './PlayerDetailModal';

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
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
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

   const orderedPositions = ["POR", "LTD", "DEF", "LTI", "MCD", "MC", "MCO", "ED", "EI", "SD", "DEL"];

  // Modal handlers
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const handleClosePlayerModal = () => {
    setShowPlayerModal(false);
  };

  const handlePlayerUpdate = async () => {
    try {
      // Recargar los jugadores del equipo
      const playersData = await getTeamPlayers(teamId);
      setPlayers(playersData);
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  // Cargar datos del equipo y jugadores
  useEffect(() => {
    const loadTeamDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Cargar datos del equipo
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
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamDetails();
  }, [teamId]);

  const getTeamPlayers = async (teamId) => {
    const playersResponse = await fetch(`http://localhost:8000/api/teams/${teamId}/players/`, {
      headers: authHeader()
    });
    
    if (!playersResponse.ok) {
      throw new Error(`Error ${playersResponse.status}: No se pudieron cargar los jugadores`);
    }
    
    return await playersResponse.json();
  };

  const handlePlayerChange = e => {
    const { name, value } = e.target;
    setPlayerForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePlayerSubmit = async e => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/teams/${teamId}/players/create/`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      // Limpiar el formulario y recargar jugadores
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
      
      const playersData = await getTeamPlayers(teamId);
      setPlayers(playersData);
      
    } catch (err) {
      setError(`Error al crear jugador: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

const handleDeletePlayer = async (playerId, e) => {
    e.stopPropagation();
    
    if (!window.confirm("¿Estás seguro de eliminar este jugador?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Para debugging - verifica la información del usuario y el token
      const user = JSON.parse(localStorage.getItem('user'));
      console.log("Usuario actual:", user);
      console.log("Token:", user?.token?.substring(0, 20) + "...");
      console.log("Rol:", user?.role);
      console.log("Equipo asignado:", user?.team);
      
      const response = await fetch(`http://localhost:8000/api/teams/players/${playerId}/`, {
        method: 'DELETE',
        headers: authHeader()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${errorData.error || 'No se pudo eliminar el jugador'}`);
      }
      
      // Actualizar la lista de jugadores
      setPlayers(players.filter(player => (player.id || player._id) !== playerId));
      
    } catch (err) {
      setError(`Error al eliminar jugador: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (positionCode) => {
    const position = POSITIONS.find(p => p.value === positionCode);
    return position ? position.color : '#777';
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
      {error && <div className="error-message">{error}</div>}
      
      {/* Cabecera del equipo */}
      <div className="team-header">
        <div className="team-badge">
          {team.name.split(' ').map(word => word[0]).join('').toUpperCase()}
        </div>
        <div className="team-title">
          <h1>{team.name}</h1>
          <div className="team-meta">
            <span><i className="fas fa-map-marker-alt"></i> {team.city}</span>
            <span><i className="fas fa-calendar"></i> Fundado en {team.founded}</span>
          </div>
        </div>
      </div>
      
      {/* Dashboard del equipo */}
      <div className="team-dashboard">
        {/* Formulario de creación (en la parte superior) */}
        <div className="player-form-card">
          <div className="card-header">
            <h2>Añadir Nuevo Jugador</h2>
          </div>
          <div className="card-body">
            <form className="player-form" onSubmit={handlePlayerSubmit}>
              <div className="form-control">
                <label htmlFor="name">Nombre</label>
                <input
                  id="name"
                  name="name"
                  value={playerForm.name}
                  onChange={handlePlayerChange}
                  required
                />
              </div>
              
              <div className="form-control">
                <label htmlFor="last_name">Apellido</label>
                <input
                  id="last_name"
                  name="last_name"
                  value={playerForm.last_name}
                  onChange={handlePlayerChange}
                  required
                />
              </div>
              
              <div className="form-control">
                <label htmlFor="number">Dorsal</label>
                <input
                  id="number"
                  name="number"
                  type="number"
                  min="1"
                  max="99"
                  value={playerForm.number}
                  onChange={handlePlayerChange}
                  required
                />
              </div>
              
              <div className="form-control">
                <label htmlFor="position">Posición</label>
                <select
                  id="position"
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
                <label htmlFor="age">Edad</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="16"
                  max="50"
                  value={playerForm.age}
                  onChange={handlePlayerChange}
                  required
                />
              </div>
              
              <div className="form-control">
                <label htmlFor="nationality">Nacionalidad</label>
                <input
                  id="nationality"
                  name="nationality"
                  value={playerForm.nationality}
                  onChange={handlePlayerChange}
                  required
                />
              </div>
              
              <div className="form-control">
                <label htmlFor="height">Altura (cm)</label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  min="150"
                  max="220"
                  value={playerForm.height}
                  onChange={handlePlayerChange}
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
                  value={playerForm.weight}
                  onChange={handlePlayerChange}
                />
              </div>
              
              <div className="form-control">
                <label htmlFor="photo_url">URL de foto</label>
                <input
                  id="photo_url"
                  name="photo_url"
                  type="url"
                  value={playerForm.photo_url}
                  onChange={handlePlayerChange}
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>
              
              <button
                type="submit"
                className="btn"
                disabled={loading}
              >
                <i className="fas fa-plus"></i>
                {loading ? 'Añadiendo...' : 'Añadir Jugador'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Contenido principal: lista de jugadores y campo de fútbol */}
        <div className="team-content">
          {/* Lista de jugadores - Lado izquierdo (65%) */}
{/* Lista de jugadores */}
      <div className="roster-card">
        <div className="card-header">
          <h2>Plantilla ({players.length} jugadores)</h2>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Cargando jugadores...</span>
            </div>
          ) : players.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-users"></i>
              </div>
              <p className="empty-state-message">No hay jugadores en este equipo</p>
              <p>Añade jugadores utilizando el formulario de arriba</p>
            </div>
          ) : (
            <div className="player-roster">
              {orderedPositions.map(position => {
                // Solo renderizamos si hay jugadores con esa posición
                if (!groupedPlayers[position]) return null;
                return (
                  <div key={position} className="position-group">
                    <div className={`position-header position-${position}`}>
                      <i className="fas fa-running"></i>
                      {getPositionLabel(position)} ({groupedPlayers[position].length})
                    </div>
                    <div className="position-players">
                      {groupedPlayers[position].map(player => (
                        <div key={player.id || player._id} className="player-card" onClick={() => handlePlayerClick(player)}>
                          <div className="player-number">{player.number}</div>
                          <div className="player-position-tag">{position}</div>
                          <div className="player-photo">
                            {player.photo_url ? (
                              <img 
                                src={player.photo_url} 
                                alt={`${player.name} ${player.last_name}`} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.parentNode.innerHTML = '<i class="fas fa-user"></i>';
                                }}
                              />
                            ) : (
                              <i className="fas fa-user"></i>
                            )}
                          </div>
                          <div className="player-info">
                            <div className="player-name">{player.name} {player.last_name}</div>
                            <div className="player-details">
                              <div className="player-age">{player.age} años</div>
                              <div className="player-nationality">{player.nationality}</div>
                            </div>
                            <button
                              className="delete-player"
                              onClick={(e) => handleDeletePlayer(player.id || player._id, e)}
                              title="Eliminar jugador"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
          
          {/* Campo de fútbol - Lado derecho (35%) */}
          <div className="football-field-container">
            {/* Marcas del campo */}
            <div className="field-markings">
              <div className="center-circle"></div>
              <div className="penalty-area-top"></div>
              <div className="penalty-area-bottom"></div>
              <div className="goal-area-top"></div>
              <div className="goal-area-bottom"></div>
              <div className="penalty-spot-top"></div>
              <div className="penalty-spot-bottom"></div>
              <div className="goal-top"></div>
              <div className="goal-bottom"></div>
            </div>
            
            {/* Campo con jugadores */}
            <div className="football-field">
              {/* Posiciones del campo */}
              <div className="field-row">
                {/* Portero */}
                <div className="field-position">
                  {players.filter(p => p.position === 'POR').map(player => (
                    <div 
                      key={player.id || player._id} 
                      className={`player-dot position-${player.position}`}
                      onClick={() => handlePlayerClick(player)}
                    >
                      {player.number}
                      <div className="player-tooltip">
                        {player.name} {player.last_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="field-row">
                {/* Defensas */}
                <div className="field-position">
                  {players.filter(p => ['DEF', 'LTD', 'LTI'].includes(p.position)).map(player => (
                    <div 
                      key={player.id || player._id} 
                      className={`player-dot position-${player.position}`}
                      onClick={() => handlePlayerClick(player)}
                    >
                      {player.number}
                      <div className="player-tooltip">
                        {player.name} {player.last_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="field-row">
                {/* Mediocampos */}
                <div className="field-position">
                  {players.filter(p => ['MCD', 'MC', 'MCO'].includes(p.position)).map(player => (
                    <div 
                      key={player.id || player._id} 
                      className={`player-dot position-${player.position}`}
                      onClick={() => handlePlayerClick(player)}
                    >
                      {player.number}
                      <div className="player-tooltip">
                        {player.name} {player.last_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="field-row">
                {/* Delanteros */}
                <div className="field-position">
                  {players.filter(p => ['ED', 'EI', 'SD', 'DEL'].includes(p.position)).map(player => (
                    <div 
                      key={player.id || player._id} 
                      className={`player-dot position-${player.position}`}
                      onClick={() => handlePlayerClick(player)}
                    >
                      {player.number}
                      <div className="player-tooltip">
                        {player.name} {player.last_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal para ver/editar jugador */}
      {showPlayerModal && selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={handleClosePlayerModal}
          onUpdate={handlePlayerUpdate}
        />
      )}
    </div>
  );
}

export default TeamDetailPage;