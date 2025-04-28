import { authHeader } from './auth';

/**
 * Obtiene los datos del usuario actual desde la API
 */
export const getUser = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/users/me/', {
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return null;
  }
};