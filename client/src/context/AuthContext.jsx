import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

// Context create karo
const AuthContext = createContext(null);

// Provider component — poori app ko wrap karega
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Initial load

  // App start hone pe localStorage se data lo
  useEffect(() => {
    const savedToken = localStorage.getItem('splitify_token');
    const savedUser = localStorage.getItem('splitify_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Signup function
  const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    const { token, user } = response.data;

    // localStorage mein save karo
    localStorage.setItem('splitify_token', token);
    localStorage.setItem('splitify_user', JSON.stringify(user));

    setToken(token);
    setUser(user);
    return response.data;
  };

  // Login function
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('splitify_token', token);
    localStorage.setItem('splitify_user', JSON.stringify(user));

    setToken(token);
    setUser(user);
    return response.data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('splitify_token');
    localStorage.removeItem('splitify_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — useAuth() se anywhere use karo
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};