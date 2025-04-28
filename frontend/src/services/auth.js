/**
 * Servicio de autenticación para manejar tokens JWT
 */

// Almacena el usuario y token
export const setAuth = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Obtiene los datos del usuario actual
export const getAuth = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error("Error al obtener datos de autenticación:", e);
    return null;
  }
};

// Verifica si hay un usuario autenticado
export const isAuthenticated = () => {
  return getAuth() !== null;
};

// Obtiene el token JWT
export const getToken = () => {
  const userData = getAuth();
  return userData?.token || null;
};

// Cierra la sesión
export const logout = () => {
  localStorage.removeItem('user');
};

// Función para crear headers con autenticación
export const authHeader = () => {
  const token = getToken();
  console.log("Enviando token:", token ? token.substring(0, 15) + "..." : "ninguno");
  return token ? { 'Authorization': `JWT ${token}` } : {};
};