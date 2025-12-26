import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import CarService from '../services/CarService';
import 'bootstrap/dist/css/bootstrap.min.css';

const BrowseCars = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  // State management
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carImages, setCarImages] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    brand: '',
    fuelType: '',
    minRate: '',
    maxRate: '',
    seatingCapacity: '',
    status: 'available'
  });

  // Unique values for filters
  const [brands, setBrands] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await CarService.getAvailableCars();
      setCars(response);
      setFilteredCars(response);

      // Extract unique brands and fuel types
      const uniqueBrands = [...new Set(response.map(car => car.brand))];
      const uniqueFuelTypes = [...new Set(response.map(car => car.typesOfFuel))];

      setBrands(uniqueBrands);
      setFuelTypes(uniqueFuelTypes);

      // Fetch images for each car
      response.forEach(car => {
        fetchCarImage(car.carId);
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars. Please try again.');
      setLoading(false);
    }
  };

  const fetchCarImage = async (carId) => {
    try {
      const images = await CarService.getCarImages(carId);
      if (images && images.length > 0) {
        const imageUrl = CarService.getCarImageUrl(images[0].carImageId);
        setCarImages(prev => ({
          ...prev,
          [carId]: imageUrl
        }));
      }
    } catch (error) {
      console.error('Error fetching car image:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    let filtered = [...cars];

    if (filters.brand) {
      filtered = filtered.filter(car => car.brand === filters.brand);
    }

    if (filters.fuelType) {
      filtered = filtered.filter(car => car.typesOfFuel === filters.fuelType);
    }

    if (filters.minRate) {
      filtered = filtered.filter(car => car.rate >= parseFloat(filters.minRate));
    }

    if (filters.maxRate) {
      filtered = filtered.filter(car => car.rate <= parseFloat(filters.maxRate));
    }

    if (filters.seatingCapacity) {
      filtered = filtered.filter(car => car.seatingCapacity >= parseInt(filters.seatingCapacity));
    }

    setFilteredCars(filtered);
  };

  const resetFilters = () => {
    setFilters({
      brand: '',
      fuelType: '',
      minRate: '',
      maxRate: '',
      seatingCapacity: '',
      status: 'available'
    });
    setFilteredCars(cars);
  };

  const handleViewDetails = (carId) => {
    navigate(`/customer/cars/${carId}`);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  // Navbar Component
  const Navbar = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-lg">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center fw-bold fs-4" href="/customer/dashboard">
          <div className="logo-icon me-2">
            <i className="bi bi-car-front-fill"></i>
          </div>
          DriveEase
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/customer/dashboard">
                <i className="bi bi-speedometer2 me-1"></i>
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link active" href="/customer/cars">
                <i className="bi bi-car-front me-1"></i>
                Browse Cars
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/customer/bookings">
                <i className="bi bi-calendar-check me-1"></i>
                My Bookings
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/customer/profile">
                <i className="bi bi-person me-1"></i>
                Profile
              </a>
            </li>
            <li className="nav-item ms-2">
              <button className="btn btn-outline-light rounded-pill px-4" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="modern-car-rental">
      <Navbar />
      
      <div className="container-fluid px-lg-5 pt-4">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold mb-2">
                  <i className="bi bi-car-front-fill me-2 text-primary"></i>
                  Available Cars
                </h2>
                <p className="text-muted mb-0">Discover your perfect ride from our premium collection</p>
              </div>
              <div className="text-end">
                <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                  <i className="bi bi-check-circle me-1"></i>
                  All cars are verified
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show rounded-3" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
                  <div className="flex-grow-1">{error}</div>
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-xl-3 col-lg-4 mb-4">
            <div className="card border-0 shadow rounded-4 overflow-hidden sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-primary text-white py-4 border-0">
                <h5 className="mb-0">
                  <i className="bi bi-funnel me-2"></i>
                  Filter Cars
                </h5>
              </div>
              <div className="card-body p-4">
                {/* Brand Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-tag me-1"></i>
                    Brand
                  </label>
                  <select
                    className="form-select border-2"
                    name="brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand, index) => (
                      <option key={index} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Fuel Type Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-fuel-pump me-1"></i>
                    Fuel Type
                  </label>
                  <select
                    className="form-select border-2"
                    name="fuelType"
                    value={filters.fuelType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    {fuelTypes.map((fuel, index) => (
                      <option key={index} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-currency-exchange me-1"></i>
                    Price Range
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control border-2"
                        placeholder="Min"
                        name="minRate"
                        value={filters.minRate}
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control border-2"
                        placeholder="Max"
                        name="maxRate"
                        value={filters.maxRate}
                        onChange={handleFilterChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Seating Capacity */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-people me-1"></i>
                    Seating Capacity
                  </label>
                  <select
                    className="form-select border-2"
                    name="seatingCapacity"
                    value={filters.seatingCapacity}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Capacity</option>
                    <option value="2">2+ Seats</option>
                    <option value="4">4+ Seats</option>
                    <option value="5">5+ Seats</option>
                    <option value="7">7+ Seats</option>
                  </select>
                </div>

                {/* Filter Buttons */}
                <div className="d-grid gap-2">
                  <button className="btn btn-primary rounded-pill py-2" onClick={applyFilters}>
                    <i className="bi bi-search me-2"></i>
                    Apply Filters
                  </button>
                  <button className="btn btn-outline-primary rounded-pill py-2" onClick={resetFilters}>
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Car Listings */}
          <div className="col-xl-9 col-lg-8">
            {/* Results Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-0">
                  {filteredCars.length} {filteredCars.length === 1 ? 'Car' : 'Cars'} Found
                </h4>
                <small className="text-muted">Sorted by: Recommended</small>
              </div>
              <div>
                <button className="btn btn-outline-primary rounded-pill px-4" onClick={fetchCars}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh List
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-grow text-primary spinner-grow-lg" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-4 text-muted fs-5">Loading available cars...</p>
              </div>
            ) : filteredCars.length === 0 ? (
              /* Empty State */
              <div className="text-center py-5">
                <div className="empty-state">
                  <i className="bi bi-car-front text-muted" style={{ fontSize: '5rem' }}></i>
                  <h4 className="mt-4 text-muted">No Cars Found</h4>
                  <p className="text-muted mb-4">Try adjusting your filters or check back later</p>
                  <button className="btn btn-primary rounded-pill px-5" onClick={resetFilters}>
                    <i className="bi bi-funnel me-2"></i>
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              /* Car Grid */
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                {filteredCars.map((car, index) => (
                  <div key={car.carId} className="col">
                    <div
                      className="card h-100 border-0 shadow rounded-4 overflow-hidden"
                    >
                      {/* Car Image */}
                      <div className="car-image bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                        {carImages[car.carId] ? (
                          <img
                            src={carImages[car.carId]}
                            alt={`${car.brand} ${car.carModel}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <i className="bi bi-car-front-fill" style={{ fontSize: '3.5rem' }}></i>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-body p-4">
                        {/* Car Info */}
                        <h5 className="card-title fw-bold mb-2">
                          {car.brand} {car.carModel}
                        </h5>
                        
                        <p className="text-muted small mb-3">
                          <i className="bi bi-calendar me-1"></i>
                          {car.year} • {car.typesOfFuel}
                        </p>

                        {/* Features */}
                        <div className="mb-3">
                          <span className="badge bg-light text-dark me-1 mb-1">
                            <i className="bi bi-people me-1"></i>
                            {car.seatingCapacity} Seats
                          </span>
                          <span className="badge bg-light text-dark mb-1">
                            <i className="bi bi-card-text me-1"></i>
                            {car.plateNumber}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="card-text text-muted small mb-4">
                          {car.description?.substring(0, 80)}
                          {car.description?.length > 80 ? '...' : ''}
                        </p>

                        {/* Price & Button */}
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <small className="text-muted">Per Day</small>
                            <h4 className="text-primary mb-0">
                              Rs. {car.rate.toLocaleString()}
                            </h4>
                          </div>
                          <button
                            className="btn btn-primary rounded-pill px-4"
                            onClick={() => handleViewDetails(car.carId)}
                          >
                            <i className="bi bi-eye me-2"></i>
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseCars;