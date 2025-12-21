import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomerNavbar from '../Components/Navbar';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  // State management
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedRentals: 0,
    pendingBookings: 0,
    totalSpent: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's bookings
      const response = await axios.get(`http://localhost:8080/api/rentals/user/${user.userId}`);
      const bookings = response.data;

      // Calculate statistics
      const active = bookings.filter(b => b.status === 'active').length;
      const completed = bookings.filter(b => b.status === 'completed').length;
      const pending = bookings.filter(b => b.status === 'pending').length;
      
      const total = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalPrice, 0);

      setStats({
        activeBookings: active,
        completedRentals: completed,
        pendingBookings: pending,
        totalSpent: total
      });

      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning',
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  return (
  <div className="customer-dashboard">
    
   <CustomerNavbar user={user} handleLogout={handleLogout} />

    {/* Main Content */}
    <div className="container-fluid px-lg-5 pt-4">
      {/* Welcome Banner with Animation */}
      <div className="row animate-fade-in">
        <div className="col-12">
          <div className="welcome-banner rounded-4 p-4 mb-4 shadow-strong">
            <div className="d-flex align-items-center">
              <div className="welcome-icon me-4 animate-bounce">
                <i className="bi bi-emoji-smile-fill fs-1 text-white"></i>
              </div>
              <div className="flex-grow-1">
                <h3 className="text-white mb-1 fw-bold">Welcome back, {user?.fullName}! 👋</h3>
                <p className="text-white mb-0 opacity-90">Ready for your next adventure? Let's find the perfect ride!</p>
              </div>
              <div className="d-none d-md-block">
                <div className="floating-car animate-float animate-delay-2">
                  <i className="bi bi-car-front-fill fs-2 text-white opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="row animate-fade-in">
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

      {/* Loading State */}
      {loading ? (
        <div className="row animate-pulse">
          <div className="col-12 text-center my-5 py-5">
            <div className="spinner-grow spinner-grow-lg text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-4 text-muted fs-5">Loading your dashboard experience...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Animated Statistics Cards */}
          <div className="row mt-3 gy-3 animate-slide-up">
            {[
              {
                title: "Active Bookings",
                value: stats.activeBookings,
                subtitle: "Currently rented",
                icon: "car-front-fill",
                gradient: "bg-gradient-primary",
                delay: "animate-delay-1"
              },
              {
                title: "Completed",
                value: stats.completedRentals,
                subtitle: "Total rentals",
                icon: "check-circle-fill",
                gradient: "bg-gradient-success",
                delay: "animate-delay-2"
              },
              {
                title: "Pending",
                value: stats.pendingBookings,
                subtitle: "Awaiting approval",
                icon: "clock-fill",
                gradient: "bg-gradient-warning",
                delay: "animate-delay-3"
              },
              {
                title: "Total Spent",
                value: `Rs. ${stats.totalSpent.toLocaleString()}`,
                subtitle: "All time",
                icon: "cash-stack",
                gradient: "bg-gradient-info",
                delay: "animate-delay-4"
              }
            ].map((stat, index) => (
              <div className="col-xl-3 col-md-6" key={index}>
                <div 
                  className={`stat-card ${stat.gradient} text-white rounded-4 shadow-medium hover-lift ${stat.delay}`}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-uppercase mb-2 opacity-85">{stat.title}</p>
                        <h2 className="display-6 fw-bold mb-1">{stat.value}</h2>
                        <small className="opacity-75">{stat.subtitle}</small>
                      </div>
                      <div className="stat-icon">
                        <i className={`bi bi-${stat.icon} display-4 opacity-25`}></i>
                      </div>
                    </div>
                    <div className="progress mt-3" style={{height: '4px'}}>
                      <div 
                        className="progress-bar bg-white"
                        style={{width: `${(index + 1) * 25}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions with Hover Effects */}
          <div className="row mt-5 animate-fade-in">
            <div className="col-12 mb-4">
              <h3 className="fw-bold">
                <i className="bi bi-lightning-fill text-warning me-2"></i>
                Quick Actions
                <span className="text-muted fs-6 ms-2">Get things done faster</span>
              </h3>
            </div>
            
            {[
              {
                icon: "car-front",
                title: "Browse Available Cars",
                description: "Find your perfect rental car from our wide selection of vehicles.",
                buttonText: "Browse Cars",
                href: "/customer/cars",
                color: "primary",
                iconColor: "text-primary"
              },
              {
                icon: "calendar-check",
                title: "View My Bookings",
                description: "Check your current and past rental bookings and history.",
                buttonText: "My Bookings",
                href: "/customer/bookings",
                color: "success",
                iconColor: "text-success"
              },
              {
                icon: "person-circle",
                title: "Update Profile",
                description: "Manage your account settings and personal information.",
                buttonText: "Edit Profile",
                href: "/customer/profile",
                color: "info",
                iconColor: "text-info"
              }
            ].map((action, index) => (
              <div className="col-lg-4 col-md-6 mb-4" key={index}>
                <div className="action-card card border-0 shadow-soft hover-scale-lg rounded-4 overflow-hidden">
                  <div className="card-body p-4 text-center">
                    <div className={`action-icon ${action.iconColor} mb-3`}>
                      <i className={`bi bi-${action.icon}`} style={{fontSize: '3.5rem'}}></i>
                    </div>
                    <h5 className="card-title fw-bold mb-2">{action.title}</h5>
                    <p className="card-text text-muted mb-4">
                      {action.description}
                    </p>
                    <a 
                      href={action.href} 
                      className={`btn btn-${action.color} btn-rounded px-4 shadow-sm hover-lift`}
                    >
                      <i className={`bi bi-arrow-right me-2`}></i>
                      {action.buttonText}
                    </a>
                  </div>
                  <div className={`card-footer bg-${action.color} bg-opacity-10 py-3`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings Section */}
          <div className="row mt-5 animate-slide-up">
            <div className="col-12">
              <div className="card border-0 shadow-medium rounded-4 overflow-hidden">
                <div className="card-header bg-white border-0 py-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-0 fw-bold">
                        <i className="bi bi-clock-history text-primary me-3"></i>
                        Recent Bookings
                      </h4>
                      <p className="text-muted mb-0 mt-1">Your latest rental activities</p>
                    </div>
                    <a href="/customer/bookings" className="btn btn-outline-primary btn-rounded px-4">
                      View All <i className="bi bi-arrow-right ms-1"></i>
                    </a>
                  </div>
                </div>
                
                <div className="card-body p-0">
                  {recentBookings.length === 0 ? (
                    <div className="empty-state">
                      <i className="bi bi-calendar-x text-muted" style={{fontSize: '5rem'}}></i>
                      <h5 className="mt-4 text-muted">No bookings yet</h5>
                      <p className="text-muted mb-4">Start your journey by booking your first car!</p>
                      <a href="/customer/cars" className="btn btn-primary btn-rounded px-5 py-2 hover-lift">
                        <i className="bi bi-plus-circle me-2"></i>
                        Book First Car
                      </a>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-4">Booking</th>
                            <th>Vehicle</th>
                            <th>Duration</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th className="text-end pe-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map((booking, index) => (
                            <tr 
                              key={booking.bookingId} 
                              className="hover-bg-light"
                              style={{animationDelay: `${index * 0.05}s`}}
                            >
                              <td className="ps-4">
                                <div>
                                  <strong className="text-primary">#{booking.bookingId}</strong>
                                  <div className="text-muted small">
                                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    <i className="bi bi-car-front-fill text-muted fs-4"></i>
                                  </div>
                                  <div>
                                    <strong>{booking.carBrand} {booking.carModel}</strong>
                                    <div className="text-muted small">
                                      {booking.carType || "Standard"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="text-muted">
                                  {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days
                                </div>
                              </td>
                              <td>
                                <div className="fw-bold text-dark">
                                  Rs. {booking.totalPrice.toLocaleString()}
                                </div>
                              </td>
                              <td>
                                <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(booking.status)}`}>
                                  <i className={`bi ${getStatusIcon(booking.status)} me-1`}></i>
                                  {booking.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="text-end pe-4">
                                <a 
                                  href={`/customer/bookings/${booking.bookingId}`} 
                                  className="btn btn-sm btn-outline-primary btn-rounded px-3"
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  Details
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {recentBookings.length > 0 && (
                  <div className="card-footer bg-white border-0 py-3">
                    <div className="text-center">
                      <a href="/customer/bookings" className="text-decoration-none text-primary fw-semibold">
                        See all bookings <i className="bi bi-arrow-right ms-1"></i>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="row mt-5 mb-5 animate-fade-in">
            <div className="col-12">
              <div className="card border-0 shadow-medium rounded-4 overflow-hidden">
                <div className="card-header bg-gradient-primary text-white py-4 border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="mb-0">
                        <i className="bi bi-person-badge me-3"></i>
                        Account Profile
                      </h4>
                      <p className="mb-0 opacity-90">Your personal information</p>
                    </div>
                    <span className="badge bg-white text-primary px-3 py-2 rounded-pill">
                      <i className="bi bi-shield-check me-2"></i>
                      Verified Account
                    </span>
                  </div>
                </div>
                
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="profile-info mb-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="avatar me-3">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                              <i className="bi bi-person fs-3"></i>
                            </div>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-1">{user?.fullName}</h5>
                            <p className="text-muted mb-0">
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              Loyal Member
                            </p>
                          </div>
                        </div>
                        
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="text-muted small">Email Address</label>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-envelope text-primary me-2"></i>
                              <strong>{user?.email}</strong>
                            </div>
                          </div>
                          <div className="col-12">
                            <label className="text-muted small">Phone Number</label>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-telephone text-primary me-2"></i>
                              <strong>{user?.phonNumber}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-6">
                      <div className="profile-details">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="text-muted small">Address</label>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-geo-alt text-primary me-2"></i>
                              <strong>{user?.address}</strong>
                            </div>
                          </div>
                          <div className="col-12">
                            <label className="text-muted small">NIC Number</label>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-card-text text-primary me-2"></i>
                              <strong>{user?.nic}</strong>
                            </div>
                          </div>
                          <div className="col-12">
                            <label className="text-muted small">Member Since</label>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-calendar-event text-primary me-2"></i>
                              <strong>January 2024</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4 pt-3 border-top">
                    <a href="/customer/profile" className="btn btn-primary btn-rounded px-5 py-2 shadow-sm hover-scale">
                      <i className="bi bi-pencil-square me-2"></i>
                      Edit Profile Information
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
  );
}

export default CustomerDashboard;