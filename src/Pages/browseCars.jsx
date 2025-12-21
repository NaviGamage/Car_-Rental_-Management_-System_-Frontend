import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import CarService from '../services/CarService';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const CarDetailsPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  // State management for both components
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [currentCar, setCurrentCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carLoading, setCarLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    brand: '',
    fuelType: '',
    minRate: '',
    maxRate: '',
    seatingCapacity: '',
    status: 'available'
  });

  // Booking form state
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: ''
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);

  // Unique values for filters
  const [brands, setBrands] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  // View mode: 'list' or 'details'
  const [viewMode, setViewMode] = useState(carId ? 'details' : 'list');

  useEffect(() => {
    if (carId) {
      fetchCarDetails();
    } else {
      fetchCars();
    }
  }, [carId]);

  useEffect(() => {
    if (currentCar) {
      calculatePrice();
    }
  }, [bookingData.startDate, bookingData.endDate, currentCar]);

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
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars. Please try again.');
      setLoading(false);
    }
  };

  const fetchCarDetails = async () => {
    try {
      setCarLoading(true);
      setError('');
      
      const response = await CarService.getCarById(carId);
      setCurrentCar(response);
      setCarLoading(false);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('Failed to load car details. Please try again.');
      setCarLoading(false);
    }
  };

  const calculatePrice = () => {
    if (bookingData.startDate && bookingData.endDate && currentCar) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 0) {
        setDays(diffDays);
        setTotalPrice(diffDays * currentCar.rate);
      }
    } else {
      setDays(0);
      setTotalPrice(0);
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

  const handleViewDetails = (car) => {
    setCurrentCar(car);
    setViewMode('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentCar(null);
    setBookingData({ startDate: '', endDate: '' });
    setBookingErrors({});
    navigate('/customer/cars');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });
    // Clear error for this field
    if (bookingErrors[name]) {
      setBookingErrors({
        ...bookingErrors,
        [name]: ''
      });
    }
  };

  const validateBooking = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!bookingData.startDate) {
      errors.startDate = 'Start date is required';
    } else if (bookingData.startDate < today) {
      errors.startDate = 'Start date cannot be in the past';
    }

    if (!bookingData.endDate) {
      errors.endDate = 'End date is required';
    } else if (bookingData.endDate < bookingData.startDate) {
      errors.endDate = 'End date must be after start date';
    }

    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!validateBooking()) {
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      // Check availability first
      const isAvailable = await CarService.checkCarAvailability(
        currentCar.carId,
        bookingData.startDate,
        bookingData.endDate
      );

      if (!isAvailable) {
        setError('This car is not available for the selected dates. Please choose different dates.');
        setBookingLoading(false);
        return;
      }

      // Create booking
      const rentalData = {
        carId: parseInt(currentCar.carId),
        userId: user.userId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate
      };

      await axios.post('http://localhost:8080/api/rentals', rentalData);
      
      setBookingSuccess(true);
      setBookingLoading(false);

      // Refresh cars list
      fetchCars();

      // Reset form after 2 seconds
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingData({ startDate: '', endDate: '' });
        setViewMode('list');
      }, 2000);

    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.message || 'Failed to create booking. Please try again.');
      setBookingLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Modern Navbar Component
  const Navbar = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary shadow-lg">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center fw-bold fs-4" href="/customer/dashboard">
          <div className="logo-icon me-2 animate-float">
            <i className="bi bi-car-front-fill"></i>
          </div>
          DriveEase
        </a>
        <button
          className="navbar-toggler border-0"
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
              <a className={`nav-link ${viewMode === 'list' && !carId ? 'active' : ''}`} href="/customer/cars">
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
              <button className="btn btn-outline-light rounded-pill px-4 hover-scale" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );

  // Car Details View
  const CarDetailsView = () => {
    if (carLoading) {
      return (
        <div className="text-center py-5 animate-fade-in">
          <div className="spinner-grow text-primary spinner-grow-lg" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-muted fs-5">Loading car details...</p>
        </div>
      );
    }

    if (!currentCar) {
      return (
        <div className="container mt-5 animate-fade-in">
          <div className="alert alert-danger">Car not found</div>
          <button className="btn btn-primary" onClick={handleBackToList}>
            Back to Cars
          </button>
        </div>
      );
    }

    return (
      <div className="animate-fade-in">
        {/* Back Button */}
        <div className="container-fluid px-lg-5 pt-4">
          <button className="btn btn-outline-secondary btn-rounded mb-3 hover-scale" onClick={handleBackToList}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to All Cars
          </button>

          {/* Success Message */}
          {bookingSuccess && (
            <div className="alert alert-success alert-dismissible fade show shadow-soft rounded-3 mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-3 fs-4"></i>
                <div>
                  <strong className="fs-5">Booking Successful!</strong>
                  <p className="mb-0">Redirecting to cars list...</p>
                </div>
              </div>
            </div>
          )}

          <div className="row">
            {/* Car Details Section */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-strong rounded-4 overflow-hidden mb-4">
                {/* Car Image */}
                <div className="car-image-header bg-gradient-primary d-flex align-items-center justify-content-center" style={{height: '350px'}}>
                  <div className="text-center text-white">
                    <i className="bi bi-car-front-fill" style={{fontSize: '8rem'}}></i>
                    <h3 className="mt-3 fw-bold">{currentCar.brand} {currentCar.carModel}</h3>
                  </div>
                </div>

                <div className="card-body p-4">
                  {/* Year & Status */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar text-primary fs-4 me-2"></i>
                      <span className="fs-5 fw-semibold">Year: {currentCar.year}</span>
                    </div>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Available Now
                    </span>
                  </div>

                  {/* Specifications Grid */}
                  <h4 className="mb-4 fw-bold">
                    <i className="bi bi-gear-fill me-2"></i>
                    Specifications
                  </h4>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="spec-card p-3 rounded-4 border hover-scale">
                        <div className="d-flex align-items-center">
                          <div className="spec-icon bg-primary bg-opacity-10 text-primary rounded-3 p-3 me-3">
                            <i className="bi bi-fuel-pump-fill fs-3"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Fuel Type</small>
                            <strong className="fs-5">{currentCar.typesOfFuel}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="spec-card p-3 rounded-4 border hover-scale">
                        <div className="d-flex align-items-center">
                          <div className="spec-icon bg-success bg-opacity-10 text-success rounded-3 p-3 me-3">
                            <i className="bi bi-people-fill fs-3"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Seating</small>
                            <strong className="fs-5">{currentCar.seatingCapacity} Seats</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="spec-card p-3 rounded-4 border hover-scale">
                        <div className="d-flex align-items-center">
                          <div className="spec-icon bg-info bg-opacity-10 text-info rounded-3 p-3 me-3">
                            <i className="bi bi-card-text fs-3"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Plate Number</small>
                            <strong className="fs-5">{currentCar.plateNumber}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="spec-card p-3 rounded-4 border hover-scale">
                        <div className="d-flex align-items-center">
                          <div className="spec-icon bg-warning bg-opacity-10 text-warning rounded-3 p-3 me-3">
                            <i className="bi bi-cash-stack fs-3"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Daily Rate</small>
                            <strong className="fs-5 text-primary">Rs. {currentCar.rate.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-5">
                    <h4 className="mb-3 fw-bold">
                      <i className="bi bi-card-text me-2"></i>
                      Description
                    </h4>
                    <div className="bg-light p-4 rounded-4">
                      <p className="mb-0">
                        {currentCar.description || 'No description available for this vehicle.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form Section */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-strong rounded-4 sticky-top" style={{top: '20px'}}>
                <div className="card-header bg-gradient-primary text-white py-4 border-0">
                  <h4 className="mb-0">
                    <i className="bi bi-calendar-check me-2"></i>
                    Book This Car
                  </h4>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleBooking}>
                    {/* Date Selection */}
                    <div className="row g-3 mb-4">
                      <div className="col-12">
                        <label className="form-label fw-bold">
                          <i className="bi bi-calendar-event me-1"></i>
                          Start Date
                        </label>
                        <input
                          type="date"
                          className={`form-control form-control-lg ${bookingErrors.startDate ? 'is-invalid' : ''}`}
                          name="startDate"
                          value={bookingData.startDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {bookingErrors.startDate && (
                          <div className="invalid-feedback">{bookingErrors.startDate}</div>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">
                          <i className="bi bi-calendar-event me-1"></i>
                          End Date
                        </label>
                        <input
                          type="date"
                          className={`form-control form-control-lg ${bookingErrors.endDate ? 'is-invalid' : ''}`}
                          name="endDate"
                          value={bookingData.endDate}
                          onChange={handleInputChange}
                          min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                        />
                        {bookingErrors.endDate && (
                          <div className="invalid-feedback">{bookingErrors.endDate}</div>
                        )}
                      </div>
                    </div>

                    {/* Price Calculation */}
                    {days > 0 && (
                      <div className="bg-gradient-primary bg-opacity-10 rounded-4 p-4 mb-4 border border-primary border-opacity-25">
                        <h5 className="mb-3 fw-bold text-primary">Rental Summary</h5>
                        <div className="row mb-2">
                          <div className="col-6">
                            <small className="text-muted">Daily Rate</small>
                          </div>
                          <div className="col-6 text-end">
                            <strong>Rs. {currentCar.rate.toLocaleString()}</strong>
                          </div>
                        </div>
                        <div className="row mb-2">
                          <div className="col-6">
                            <small className="text-muted">Number of Days</small>
                          </div>
                          <div className="col-6 text-end">
                            <strong>{days} {days === 1 ? 'Day' : 'Days'}</strong>
                          </div>
                        </div>
                        <hr className="my-3" />
                        <div className="row">
                          <div className="col-6">
                            <strong className="text-primary">Total Price</strong>
                          </div>
                          <div className="col-6 text-end">
                            <strong className="text-primary fs-3">Rs. {totalPrice.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm hover-lift"
                      disabled={bookingLoading || bookingSuccess}
                    >
                      {bookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing Booking...
                        </>
                      ) : bookingSuccess ? (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Booked Successfully
                        </>
                      ) : (
                        <>
                          <i className="bi bi-calendar-check me-2"></i>
                          Book Now
                        </>
                      )}
                    </button>
                  </form>

                  {/* Info Text */}
                  <div className="mt-4 pt-3 border-top text-center">
                    <small className="text-muted">
                      <i className="bi bi-shield-check me-1"></i>
                      Your booking requires admin approval. You'll be notified once confirmed.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Car List View
  const CarListView = () => (
    <div className="container-fluid px-lg-5 pt-4 animate-fade-in">
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
            <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-soft" role="alert">
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
          <div className="card border-0 shadow-medium rounded-4 overflow-hidden sticky-top" style={{top: '20px'}}>
            <div className="card-header bg-gradient-primary text-white py-4 border-0">
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
                <button className="btn btn-primary rounded-pill py-2 hover-lift" onClick={applyFilters}>
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
              <button className="btn btn-outline-primary rounded-pill px-4 hover-scale" onClick={fetchCars}>
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
                <i className="bi bi-car-front text-muted" style={{fontSize: '5rem'}}></i>
                <h4 className="mt-4 text-muted">No Cars Found</h4>
                <p className="text-muted mb-4">Try adjusting your filters or check back later</p>
                <button className="btn btn-primary rounded-pill px-5 hover-lift" onClick={resetFilters}>
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
                    className="card h-100 border-0 shadow-soft hover-scale-lg rounded-4 overflow-hidden"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    {/* Car Image */}
                    <div className="car-image bg-gradient-primary d-flex align-items-center justify-content-center" style={{height: '180px'}}>
                      <div className="text-center text-white">
                        <i className="bi bi-car-front-fill" style={{fontSize: '3.5rem'}}></i>
                      </div>
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
                          className="btn btn-primary rounded-pill px-4 hover-lift"
                          onClick={() => handleViewDetails(car)}
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
  );

  return (
    <div className="modern-car-rental">
      <Navbar />
      
      {/* Error Message for booking */}
      {error && viewMode === 'details' && (
        <div className="container-fluid px-lg-5 pt-4">
          <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-soft" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
              <div className="flex-grow-1">{error}</div>
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'details' ? <CarDetailsView /> : <CarListView />}
    </div>
  );
};

export default CarDetailsPage;