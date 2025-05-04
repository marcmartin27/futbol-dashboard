// src/services/teamService.js
import { authHeader } from './auth';

const API_URL = 'http://localhost:8000/api/teams';

export const getTeams = async () => {
  try {
    const response = await fetch(`${API_URL}/`, {
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
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error cargando equipos:", err);
    throw err;
  }
};

export const createTeam = async (teamData) => {
  try {
    const response = await fetch(`${API_URL}/create/`, {
      method: 'POST',
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData)
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
    
    return await response.json();
  } catch (err) {
    console.error("Error creando equipo:", err);
    throw err;
  }
};

// Añadir estas funciones al archivo

export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await fetch(`${API_URL}/${teamId}/`, {
      method: 'PUT',
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData)
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
    
    return await response.json();
  } catch (err) {
    console.error("Error actualizando equipo:", err);
    throw err;
  }
};

export const deleteTeam = async (teamId) => {
  try {
    const response = await fetch(`${API_URL}/${teamId}/`, {
      method: 'DELETE',
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
    
    return true;
  } catch (err) {
    console.error("Error eliminando equipo:", err);
    throw err;
  }
};