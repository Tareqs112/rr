import api from './api';

// Login user
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
};

// Get user profile
const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

const authService = {
  login,
  logout,
  getProfile
};

export default authService;
