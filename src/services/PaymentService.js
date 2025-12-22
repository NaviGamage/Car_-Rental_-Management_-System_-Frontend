import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const PaymentService = {
  // Create payment
  createPayment: async (paymentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to create payment';
    }
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch payment';
    }
  },

  // Get payment by booking ID
  getPaymentByBookingId: async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch payment';
    }
  },

  // Get all payments (for admin)
  getAllPayments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch payments';
    }
  },

  // Check if payment exists for booking
  checkPaymentExists: async (bookingId) => {
    try {
      await axios.get(`${API_BASE_URL}/payments/booking/${bookingId}`);
      return true; // Payment exists
    } catch (error) {
      return false; // Payment doesn't exist
    }
  }
};

export default PaymentService;