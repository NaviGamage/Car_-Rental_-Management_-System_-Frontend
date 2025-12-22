import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import RentalService from '../services/RentalService';
import PaymentService from '../services/PaymentService';
import 'bootstrap/dist/css/bootstrap.min.css'
import CustomerNavbar from '../Components/Navbar';

const MyBookings = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [paidBookings, setPaidBookings] = useState(new Set());

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [selectedStatus, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await RentalService.getRentalsByUserId(user.userId);
      setBookings(response);
      setFilteredBookings(response);

      // Check which bookings have payments
      const paidSet = new Set();
      for (const booking of response) {
        const hasPaid = await PaymentService.checkPaymentExists(booking.bookingId);
        if (hasPaid) {
          paidSet.add(booking.bookingId);
        }
      }
      setPaidBookings(paidSet);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (selectedStatus === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === selectedStatus));
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handlePayment = (bookingId) => {
    navigate(`/customer/payment/${bookingId}`);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await RentalService.cancelRental(bookingId);
        alert('Booking cancelled successfully');
        fetchBookings(); // Refresh bookings
      } catch (error) {
        alert('Failed to cancel booking: ' + (error.message || error));
      }
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      approved: 'bg-info',
      active: 'bg-success',
      completed: 'bg-secondary',
      cancelled: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  return (
    <div>
      {/* Navbar */}
       <CustomerNavbar user={user} handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="container mt-4 mb-5">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h2>
              <i className="bi bi-calendar-check me-2"></i>
              My Bookings
            </h2>
            <p className="text-muted">View and manage your rental bookings</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn ${selectedStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleStatusChange('all')}
              >
                All Bookings ({bookings.length})
              </button>
              <button
                className={`btn ${selectedStatus === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => handleStatusChange('pending')}
              >
                Pending ({bookings.filter(b => b.status === 'pending').length})
              </button>
              <button
                className={`btn ${selectedStatus === 'approved' ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => handleStatusChange('approved')}
              >
                Approved ({bookings.filter(b => b.status === 'approved').length})
              </button>
              <button
                className={`btn ${selectedStatus === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => handleStatusChange('active')}
              >
                Active ({bookings.filter(b => b.status === 'active').length})
              </button>
              <button
                className={`btn ${selectedStatus === 'completed' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => handleStatusChange('completed')}
              >
                Completed ({bookings.filter(b => b.status === 'completed').length})
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          /* Empty State */
          <div className="text-center py-5">
            <i className="bi bi-calendar-x text-muted" style={{fontSize: '5rem'}}></i>
            <h4 className="mt-3">No Bookings Found</h4>
            <p className="text-muted">
              {selectedStatus === 'all' 
                ? "You haven't made any bookings yet" 
                : `No ${selectedStatus} bookings`}
            </p>
            <a href="/customer/cars" className="btn btn-primary">
              <i className="bi bi-search me-2"></i>
              Browse Cars
            </a>
          </div>
        ) : (
          /* Bookings List */
          <div className="row">
            {filteredBookings.map((booking) => (
              <div key={booking.bookingId} className="col-12 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="row">
                      {/* Car Image */}
                      <div className="col-md-2">
                        <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '100px', borderRadius: '8px'}}>
                          <i className="bi bi-car-front-fill text-muted" style={{fontSize: '3rem'}}></i>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="col-md-6">
                        <h5 className="mb-2">
                          {booking.carBrand} {booking.carModel}
                        </h5>
                        <p className="text-muted mb-2">
                          <strong>Booking ID:</strong> #{booking.bookingId}
                        </p>
                        <p className="mb-1">
                          <i className="bi bi-calendar-event me-2"></i>
                          <strong>From:</strong> {formatDate(booking.startDate)} 
                          {' '}<strong>To:</strong> {formatDate(booking.endDate)}
                        </p>
                        <p className="mb-2">
                          <i className="bi bi-cash-stack me-2"></i>
                          <strong>Total:</strong> {formatCurrency(booking.totalPrice)}
                        </p>
                        <span className={`badge ${getStatusBadge(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </span>
                        {paidBookings.has(booking.bookingId) && (
                          <span className="badge bg-success ms-2">
                            <i className="bi bi-check-circle me-1"></i>
                            PAID
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-md-4 d-flex flex-column justify-content-center gap-2">
                        {/* Pay Now Button - Show if pending and not paid */}
                        {booking.status === 'pending' && !paidBookings.has(booking.bookingId) && (
                          <button
                            className="btn btn-success"
                            onClick={() => handlePayment(booking.bookingId)}
                          >
                            <i className="bi bi-credit-card me-2"></i>
                            Pay Now
                          </button>
                        )}

                        {/* Cancel Button - Show if pending or approved */}
                        {(booking.status === 'pending' || booking.status === 'approved') && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleCancelBooking(booking.bookingId)}
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel Booking
                          </button>
                        )}

                        {/* View Details Button */}
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => navigate(`/customer/bookings/${booking.bookingId}`)}
                        >
                          <i className="bi bi-eye me-2"></i>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;