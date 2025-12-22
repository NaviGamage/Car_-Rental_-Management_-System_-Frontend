import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const RentalService = {
  // Create rental/booking
  createRental: async (rentalData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/rentals`, rentalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to create booking';
    }
  },

  // Get rental by ID
  getRentalById: async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rentals/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch booking';
    }
  },

  // Get all rentals
  getAllRentals: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rentals`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch bookings';
    }
  },

  // Get rentals by user ID
  getRentalsByUserId: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rentals/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch user bookings';
    }
  },

  // Get rentals by status
  getRentalsByStatus: async (status) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rentals/status/${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch bookings by status';
    }
  },

  // Cancel rental
  cancelRental: async (bookingId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/rentals/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to cancel booking';
    }
  },

  // Check car availability
  checkAvailability: async (carId, startDate, endDate) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rentals/check-availability`, {
        params: { carId, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to check availability';
    }
  }
};

export default RentalService;