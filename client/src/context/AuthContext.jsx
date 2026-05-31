import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default axios base URL
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('vibe_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('vibe_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post('/auth/register', { username, email, password });
    setUser(data);
    localStorage.setItem('vibe_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vibe_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const enterDemoMode = () => {
    const demoUser = {
      _id: 'demo_user_id',
      username: 'VibeExplorer',
      email: 'demo@vibe.social',
      profilePicture: '',
      token: 'demo_token'
    };
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
