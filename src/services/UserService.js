import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/users';

const UserService = {
  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch users';
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch user';
    }
  },

  // Update user profile
  updateUserProfile: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update profile';
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete user';
    }
  },

  // Get users by role
  getUsersByRole: async (role) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/role/${role}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch users by role';
    }
  },

  // Count users by role
  countUsersByRole: async (role) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/count/role/${role}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to count users';
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Update current user in localStorage
  updateCurrentUser: (userData) => {
    const currentUser = UserService.getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
};

export default UserService;