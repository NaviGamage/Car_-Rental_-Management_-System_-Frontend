import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import CarService from '../services/CarService';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const CarDetails = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  // State management
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking form state
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: ''
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);

  useEffect(() => {
    fetchCarDetails();
  }, [carId]);

  useEffect(() => {
    calculatePrice();
  }, [bookingData.startDate, bookingData.endDate, car]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await CarService.getCarById(carId);
      setCar(response);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('Failed to load car details. Please try again.');
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (bookingData.startDate && bookingData.endDate && car) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 0) {
        setDays(diffDays);
        setTotalPrice(diffDays * car.rate);
      }
    } else {
      setDays(0);
      setTotalPrice(0);
    }
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
        carId,
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
        carId: parseInt(carId),
        userId: user.userId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate
      };

      const response = await axios.post('http://localhost:8080/api/rentals', rentalData);
      
      setBookingSuccess(true);
      setBookingLoading(false);

      // Redirect to bookings page after 2 seconds
      setTimeout(() => {
        navigate('/customer/bookings');
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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading car details...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Car not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/customer/cars')}>
          Back to Cars
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/customer/dashboard">
            <i className="bi bi-car-front-fill me-2"></i>
            Car Rental System
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
                <a className="nav-link" href="/customer/dashboard">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="/customer/cars">Browse Cars</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/customer/bookings">My Bookings</a>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light ms-2" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mt-4 mb-5">
        {/* Back Button */}
        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/customer/cars')}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Cars
        </button>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="alert alert-success alert-dismissible fade show">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Booking Successful!</strong> Redirecting to your bookings...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <div className="row">
          {/* Car Details Section */}
          <div className="col-lg-7">
            <div className="card shadow-sm mb-4">
              {/* Car Image */}
              <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: '400px'}}>
                <i className="bi bi-car-front-fill text-muted" style={{fontSize: '8rem'}}></i>
              </div>

              <div className="card-body">
                {/* Title */}
                <h2 className="card-title">
                  {car.brand} {car.carModel}
                </h2>
                
                {/* Year & Status */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">
                    <i className="bi bi-calendar me-1"></i>
                    Year: {car.year}
                  </span>
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Available
                  </span>
                </div>

                {/* Specifications */}
                <h5 className="mt-4 mb-3">Specifications</h5>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-fuel-pump-fill text-primary fs-4 me-3"></i>
                      <div>
                        <small className="text-muted d-block">Fuel Type</small>
                        <strong>{car.typesOfFuel}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-people-fill text-primary fs-4 me-3"></i>
                      <div>
                        <small className="text-muted d-block">Seating</small>
                        <strong>{car.seatingCapacity} Seats</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-card-text text-primary fs-4 me-3"></i>
                      <div>
                        <small className="text-muted d-block">Plate Number</small>
                        <strong>{car.plateNumber}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-cash-stack text-primary fs-4 me-3"></i>
                      <div>
                        <small className="text-muted d-block">Daily Rate</small>
                        <strong className="text-primary">Rs. {car.rate.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <h5 className="mt-4 mb-3">Description</h5>
                <p className="text-muted">
                  {car.description || 'No description available for this vehicle.'}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Form Section */}
          <div className="col-lg-5">
            <div className="card shadow-sm sticky-top" style={{top: '20px'}}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Book This Car
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleBooking}>
                  {/* Start Date */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="bi bi-calendar-event me-1"></i>
                      Start Date
                    </label>
                    <input
                      type="date"
                      className={`form-control ${bookingErrors.startDate ? 'is-invalid' : ''}`}
                      name="startDate"
                      value={bookingData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {bookingErrors.startDate && (
                      <div className="invalid-feedback">{bookingErrors.startDate}</div>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="bi bi-calendar-event me-1"></i>
                      End Date
                    </label>
                    <input
                      type="date"
                      className={`form-control ${bookingErrors.endDate ? 'is-invalid' : ''}`}
                      name="endDate"
                      value={bookingData.endDate}
                      onChange={handleInputChange}
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {bookingErrors.endDate && (
                      <div className="invalid-feedback">{bookingErrors.endDate}</div>
                    )}
                  </div>

                  {/* Price Calculation */}
                  {days > 0 && (
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <h6 className="card-subtitle mb-3 text-muted">Rental Summary</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Daily Rate:</span>
                          <strong>Rs. {car.rate.toLocaleString()}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Number of Days:</span>
                          <strong>{days} {days === 1 ? 'Day' : 'Days'}</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <strong className="text-primary">Total Price:</strong>
                          <strong className="text-primary fs-5">
                            Rs. {totalPrice.toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-lg"
                    disabled={bookingLoading || bookingSuccess}
                  >
                    {bookingLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
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
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Your booking will be confirmed after admin approval.
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

export default CarDetails;