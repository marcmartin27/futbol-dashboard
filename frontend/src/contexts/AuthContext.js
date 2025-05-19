import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Para manejar el estado inicial de carga

  useEffect(() => {
    // Al cargar la app, intentar recuperar el usuario desde localStorage
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userStr && token) {
        const user = JSON.parse(userStr);
        setCurrentUser({ ...user, token }); // Establecer el usuario en el estado del contexto
      }
    } catch (error) {
      console.error("Error al parsear usuario desde localStorage:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoadingAuth(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData)); // Guardar todo el objeto user
    setCurrentUser(userData); // Actualizar el estado del contexto
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null); // Actualizar el estado del contexto
  };

  const updateUserInContext = (updatedUserData) => {
    const token = localStorage.getItem('token'); // Mantener el token existente
    const fullUser = { ...updatedUserData, token };
    localStorage.setItem('user', JSON.stringify(fullUser));
    setCurrentUser(fullUser);
  };


  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loadingAuth, updateUserInContext }}>
      {!loadingAuth && children} {/* No renderizar hijos hasta que la autenticación inicial esté lista */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);