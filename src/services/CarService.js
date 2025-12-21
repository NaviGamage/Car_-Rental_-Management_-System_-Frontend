import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api";

const CarService = {
  // Get all cars
  getAllCars: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch cars';
    }
  },

  // Get car by ID
  getCarById: async (carId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars/${carId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch car details';
    }
  },

  // Get available cars (status = available)
  getAvailableCars: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars/status/available`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch available cars';
    }
  },

  // Get cars by brand
  getCarsByBrand: async (brand) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars/brand/${brand}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch cars by brand';
    }
  },

  // Get cars by fuel type
  getCarsByFuelType: async (fuelType) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars/fuel/${fuelType}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch cars by fuel type';
    }
  },

  // Get cars by price range
  getCarsByPriceRange: async (minRate, maxRate) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars/price-range`, {
        params: { minRate, maxRate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch cars by price range';
    }
  },

  // Search cars with filters
  searchCars: async (filters) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars/search`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search cars';
    }
  },

  // Get car images
  getCarImages: async (carId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/car-images/car/${carId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch car images';
    }
  },

  // Get car image URL
  getCarImageUrl: (imageId) => {
    return `${API_BASE_URL}/car-images/view/${imageId}`;
  },

  // Check car availability
  checkCarAvailability: async (carId, startDate, endDate) => {
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

export default CarService;