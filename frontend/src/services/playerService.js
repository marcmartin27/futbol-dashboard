import { authHeader } from './auth';

const API_URL = 'http://localhost:8000/api/teams';

export const getTeamPlayers = async (teamId) => {
  try {
    const response = await fetch(`${API_URL}/${teamId}/players/`, {
      headers: authHeader()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error cargando jugadores:", err);
    throw err;
  }
};

export const createPlayer = async (teamId, playerData) => {
  try {
    const response = await fetch(`${API_URL}/${teamId}/players/create/`, {
      method: 'POST',
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("Error creando jugador:", err);
    throw err;
  }
};

export const deletePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}/`, {
      method: 'DELETE',
      headers: authHeader()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return true;
  } catch (err) {
    console.error("Error eliminando jugador:", err);
    throw err;
  }
};

export const updatePlayer = async (playerId, playerData) => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}/`, {
      method: 'PUT',
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("Error actualizando jugador:", err);
    throw err;
  }
};