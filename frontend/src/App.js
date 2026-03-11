import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

const API_BASE_URL = 'http://18.60.156.103/api';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      setUser(response.data.user);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      handleLogout();
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentView('dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const handleRegister = async (name, email, password, role, department) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
        role,
        department
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setCurrentView('login');
  };

  return (
    <div className="App">
      {currentView === 'login' && (
        <Login 
          onLogin={handleLogin} 
        />
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          apiBaseUrl={API_BASE_URL}
        />
      )}
    </div>
  );
}

export default App;
