import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/'}api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores { name, role, etc. }
  const [loading, setLoading] = useState(true); // Start as true until we verify auth state

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
    setLoading(false); // Auth check complete
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Store user data in sessionStorage (not token, as it's in HttpOnly cookie)
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  // Clear user state without redirect (for axios interceptor)
  const clearUser = () => {
    setUser(null);
    sessionStorage.removeItem('user');
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
    <AuthContext.Provider value={{ user, login, logout, clearUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);