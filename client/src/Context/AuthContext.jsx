import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = `${import.meta.env.VITE_API_URL}api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores { name, role, etc. }
  const [loading, setLoading] = useState(false);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Store user data in sessionStorage (not token, as it's in HttpOnly cookie)
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear HttpOnly cookie
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear session data
      setUser(null);
      sessionStorage.removeItem('user');
      // Replace history instead of adding to it (prevents back button access)
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);