import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (data) => {
    const merged = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  const refreshMe = async () => {
    try {
      const res = await api.get('/auth/me');
      updateUser(res.data.data);
    } catch (err) {
      // token invalid/expired
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUser, refreshMe, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
