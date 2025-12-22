import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import AdminNavbar from '../Components/AdminNavbar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../app.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  // State management
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    activeRentals: 0,
    totalRevenue: 0,
    totalUsers: 0,
    monthlyGrowth: 12.5,
    conversionRate: 4.2
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [carsRes, bookingsRes, paymentsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/cars'),
        axios.get('http://localhost:8080/api/rentals'),
        axios.get('http://localhost:8080/api/payments/revenue/total')
      ]);

      const cars = carsRes.data;
      const bookings = bookingsRes.data;

      // Calculate statistics
      setStats({
        totalCars: cars.length,
        availableCars: cars.filter(c => c.status === 'available').length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        activeRentals: bookings.filter(b => b.status === 'active').length,
        totalRevenue: paymentsRes.data.totalRevenue || 0,
        totalUsers: 0,
        monthlyGrowth: 12.5,
        conversionRate: 4.2
      });

      // Get recent bookings (last 5)
      const sorted = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentBookings(sorted.slice(0, 5));

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
    const badgeClasses = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      active: 'badge-active',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled'
    };
    return badgeClasses[status] || 'badge-completed';
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
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const quickActions = [
    { 
      icon: 'plus-lg', 
      label: 'Add New Car', 
      color: 'primary',
      action: () => navigate('/admin/cars/add')
    },
    { 
      icon: 'check2-square', 
      label: 'Approve Bookings', 
      color: 'warning',
      action: () => navigate('/admin/bookings?status=pending')
    },
    { 
      icon: 'people', 
      label: 'Manage Users', 
      color: 'success',
      action: () => navigate('/admin/users')
    },
    { 
      icon: 'file-earmark-bar-graph', 
      label: 'View Reports', 
      color: 'info',
      action: () => navigate('/admin/reports')
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Modern Admin Navbar */}
      <AdminNavbar user={user} handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-2">Dashboard Overview</h1>
            <p className="text-muted mb-0">
              Welcome back, <span className="fw-semibold">{user?.fullName}</span>! 
              Here's what's happening with your business today.
            </p>
          </div>
          
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm w-auto"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button 
              className="btn btn-modern btn-modern-primary"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="modern-spinner mx-auto mb-3"></div>
            <p className="text-muted">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Grid */}
            <div className="row g-4 mb-4">
              {/* Total Cars */}
              <div className="col-xl-3 col-md-6">
                <div className="stat-card hover-lift">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon primary me-3">
                      <i className="bi bi-car-front"></i>
                    </div>
                    <div>
                      <div className="stat-label">Total Cars</div>
                      <div className="stat-value">{stats.totalCars}</div>
                      <div className="stat-change text-success">
                        <i className="bi bi-arrow-up me-1"></i>
                        {stats.availableCars} available
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Bookings */}
              <div className="col-xl-3 col-md-6">
                <div className="stat-card hover-lift">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon warning me-3">
                      <i className="bi bi-hourglass-split"></i>
                    </div>
                    <div>
                      <div className="stat-label">Pending Bookings</div>
                      <div className="stat-value">{stats.pendingBookings}</div>
                      <div className="stat-change text-warning">
                        <i className="bi bi-clock me-1"></i>
                        Awaiting approval
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Rentals */}
              <div className="col-xl-3 col-md-6">
                <div className="stat-card hover-lift">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon success me-3">
                      <i className="bi bi-calendar-check"></i>
                    </div>
                    <div>
                      <div className="stat-label">Active Rentals</div>
                      <div className="stat-value">{stats.activeRentals}</div>
                      <div className="stat-change text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Currently rented
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="col-xl-3 col-md-6">
                <div className="stat-card hover-lift">
                  <div className="d-flex align-items-center">
                    <div className="stat-icon info me-3">
                      <i className="bi bi-cash-stack"></i>
                    </div>
                    <div>
                      <div className="stat-label">Total Revenue</div>
                      <div className="stat-value">
                        Rs. {(stats.totalRevenue / 1000000).toFixed(1)}M
                      </div>
                      <div className="stat-change text-info">
                        <i className="bi bi-graph-up me-1"></i>
                        {stats.monthlyGrowth}% this month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div className="row g-4">
              {/* Quick Actions */}
              <div className="col-lg-4">
                <div className="modern-table">
                  <div className="table-header">
                    <h5><i className="bi bi-lightning me-2"></i>Quick Actions</h5>
                  </div>
                  <div className="table-body p-3">
                    <div className="row g-3">
                      {quickActions.map((action, index) => (
                        <div className="col-6" key={index}>
                          <div 
                            className="action-card hover-lift"
                            onClick={action.action}
                          >
                            <div className={`action-icon bg-${action.color} bg-opacity-10 text-${action.color}`}>
                              <i className={`bi bi-${action.icon}`}></i>
                            </div>
                            <h6 className="fw-semibold mb-0">{action.label}</h6>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-top">
                      <h6 className="small fw-semibold mb-3">Quick Stats</h6>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Booking Conversion</span>
                        <span className="fw-semibold">{stats.conversionRate}%</span>
                      </div>
                      <div className="progress mb-3" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ width: `${stats.conversionRate}%` }}
                        ></div>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Car Utilization</span>
                        <span className="fw-semibold">
                          {stats.totalCars > 0 ? Math.round((stats.activeRentals / stats.totalCars) * 100) : 0}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ 
                            width: `${stats.totalCars > 0 ? Math.round((stats.activeRentals / stats.totalCars) * 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="col-lg-8">
                <div className="modern-table">
                  <div className="table-header d-flex justify-content-between align-items-center">
                    <h5><i className="bi bi-clock-history me-2"></i>Recent Bookings</h5>
                    <button 
                      className="btn btn-modern btn-modern-outline btn-sm"
                      onClick={() => navigate('/admin/bookings')}
                    >
                      View All <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                  <div className="table-body">
                    {recentBookings.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-inbox text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <p className="text-muted">No recent bookings found</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Customer</th>
                              <th>Car</th>
                              <th>Dates</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentBookings.map((booking) => (
                              <tr key={booking.bookingId}>
                                <td className="fw-semibold">#{booking.bookingId}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="user-avatar me-2">
                                      {booking.userName?.[0] || 'U'}
                                    </div>
                                    <div>
                                      <div className="fw-medium">{booking.userName}</div>
                                      <small className="text-muted">{booking.userEmail}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="fw-medium">{booking.carBrand}</div>
                                  <small className="text-muted">{booking.carModel}</small>
                                </td>
                                <td>
                                  <div>{formatDate(booking.startDate)}</div>
                                  <small className="text-muted">to {formatDate(booking.endDate)}</small>
                                </td>
                                <td className="fw-semibold">{formatCurrency(booking.totalPrice)}</td>
                                <td>
                                  <span className={`status-badge ${getStatusBadge(booking.status)}`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-modern-outline"
                                    onClick={() => navigate(`/admin/bookings/${booking.bookingId}`)}
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;