import axios from 'axios';

const API_BASE_URL ='http://localhost:8080/auth';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Service
const AuthService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Registration failed';
    }
  },
    
  // Login user
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/login', credentials);
      
      // Store user data in localStorage
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Login failed';
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return localStorage.getItem('user') !== null;
  },
};

export default AuthService;
