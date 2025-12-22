import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import RentalService from '../services/RentalService';
import PaymentService from '../services/PaymentService';
import 'bootstrap/dist/css/bootstrap.min.css';


const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if payment already exists
      const paymentExists = await PaymentService.checkPaymentExists(bookingId);
      if (paymentExists) {
        setError('Payment already exists for this booking');
        setTimeout(() => navigate('/customer/bookings'), 3000);
        return;
      }

      const response = await RentalService.getRentalById(bookingId);
      setBooking(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Failed to load booking details');
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!booking) return;

    try {
      setProcessing(true);
      setError('');

      const payment = {
        bookingId: parseInt(bookingId),
        paymentDate: paymentData.paymentDate,
        amount: booking.totalPrice
      };

      await PaymentService.createPayment(payment);
      
      setSuccess(true);
      setProcessing(false);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/customer/bookings');
      }, 3000);

    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setProcessing(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading payment details...</p>
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
                <a className="nav-link" href="/customer/cars">Browse Cars</a>
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
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {/* Back Button */}
            <button 
              className="btn btn-outline-secondary mb-3" 
              onClick={() => navigate('/customer/bookings')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Bookings
            </button>

            {/* Success Message */}
            {success && (
              <div className="alert alert-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                <strong>Payment Successful!</strong> Redirecting to bookings...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            {booking && (
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <i className="bi bi-credit-card me-2"></i>
                    Complete Payment
                  </h4>
                </div>
                <div className="card-body">
                  {/* Booking Summary */}
                  <h5 className="mb-3">Booking Summary</h5>
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>Booking ID:</strong> #{booking.bookingId}
                          </p>
                          <p className="mb-2">
                            <strong>Car:</strong> {booking.carBrand} {booking.carModel}
                          </p>
                          <p className="mb-2">
                            <strong>Customer:</strong> {booking.userName}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>Start Date:</strong> {formatDate(booking.startDate)}
                          </p>
                          <p className="mb-2">
                            <strong>End Date:</strong> {formatDate(booking.endDate)}
                          </p>
                          <p className="mb-2">
                            <strong>Status:</strong>{' '}
                            <span className="badge bg-warning text-dark">
                              {booking.status.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <h5 className="mb-3">Payment Details</h5>
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Amount to Pay:</span>
                        <strong className="text-primary fs-4">
                          {formatCurrency(booking.totalPrice)}
                        </strong>
                      </div>
                      <hr />
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        This is the total rental amount for your booking
                      </small>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <form onSubmit={handlePayment}>
                    <div className="mb-3">
                      <label className="form-label">Payment Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={paymentData.paymentDate}
                        onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    {/* Payment Method Info */}
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Note:</strong> This is a simplified payment system. In a real application, 
                      you would integrate with a payment gateway (e.g., PayPal, Stripe).
                    </div>

                    {/* Terms and Conditions */}
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="terms"
                        required
                      />
                      <label className="form-check-label" htmlFor="terms">
                        I agree to the terms and conditions
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100"
                      disabled={processing || success}
                    >
                      {processing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing Payment...
                        </>
                      ) : success ? (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Payment Successful
                        </>
                      ) : (
                        <>
                          <i className="bi bi-credit-card me-2"></i>
                          Pay {formatCurrency(booking.totalPrice)}
                        </>
                      )}
                    </button>
                  </form>

                  {/* Security Notice */}
                  <div className="mt-4 text-center">
                    <small className="text-muted">
                      <i className="bi bi-shield-check me-1"></i>
                      Your payment is secure and encrypted
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;