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
  },

  // ============ ADMIN OPERATIONS ============

  // Create a new car
  createCar: async (carData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cars`, carData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to create car';
    }
  },

  // Update a car
  updateCar: async (carId, carData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cars/${carId}`, carData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update car';
    }
  },

  // Delete a car
  deleteCar: async (carId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cars/${carId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete car';
    }
  },

  // Update car status
  updateCarStatus: async (carId, status) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/cars/${carId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update car status';
    }
  },

  // Upload car images
  uploadCarImages: async (carId, imageFiles) => {
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/car-images/upload/${carId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to upload images';
    }
  },

  // Delete car image
  deleteCarImage: async (imageId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/car-images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete image';
    }
  }
};

export default CarService;