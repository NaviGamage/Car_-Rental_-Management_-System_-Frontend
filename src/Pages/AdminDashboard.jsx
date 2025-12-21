import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/admin/dashboard">
            🚗 Car Rental - Admin
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
                <a className="nav-link" href="/admin/dashboard">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/cars">Manage Cars</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/bookings">Manage Bookings</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/users">Manage Users</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/payments">Payments</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/admin/reports">Reports</a>
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

      {/* Dashboard Content */}
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-12">
            <h2>Admin Dashboard</h2>
            <p className="text-muted">Welcome back, {user?.fullName}</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mt-4">
          <div className="col-md-3 mb-3">
            <div className="card text-white bg-primary">
              <div className="card-body">
                <h5 className="card-title">Total Cars</h5>
                <h2 className="card-text">25</h2>
                <p className="card-text">In fleet</p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-white bg-success">
              <div className="card-body">
                <h5 className="card-title">Active Rentals</h5>
                <h2 className="card-text">12</h2>
                <p className="card-text">Currently rented</p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-white bg-warning">
              <div className="card-body">
                <h5 className="card-title">Pending Bookings</h5>
                <h2 className="card-text">5</h2>
                <p className="card-text">Awaiting approval</p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card text-white bg-info">
              <div className="card-body">
                <h5 className="card-title">Revenue (Month)</h5>
                <h2 className="card-text">$15,000</h2>
                <p className="card-text">This month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mt-4">
          <div className="col-12">
            <h4>Quick Actions</h4>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <i className="bi bi-car-front-fill" style={{fontSize: '3rem', color: '#0d6efd'}}></i>
                <h5 className="card-title mt-3">Add New Car</h5>
                <a href="/admin/cars/add" className="btn btn-primary btn-sm">Add Car</a>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <i className="bi bi-calendar-check-fill" style={{fontSize: '3rem', color: '#198754'}}></i>
                <h5 className="card-title mt-3">Approve Bookings</h5>
                <a href="/admin/bookings?status=pending" className="btn btn-success btn-sm">View Pending</a>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <i className="bi bi-people-fill" style={{fontSize: '3rem', color: '#ffc107'}}></i>
                <h5 className="card-title mt-3">Manage Users</h5>
                <a href="/admin/users" className="btn btn-warning btn-sm">View Users</a>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <i className="bi bi-bar-chart-fill" style={{fontSize: '3rem', color: '#0dcaf0'}}></i>
                <h5 className="card-title mt-3">View Reports</h5>
                <a href="/admin/reports" className="btn btn-info btn-sm">Generate Report</a>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Recent Activity</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Action</th>
                        <th>User</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2025-12-17</td>
                        <td>New booking created</td>
                        <td>John Doe</td>
                        <td><span className="badge bg-warning">Pending</span></td>
                      </tr>
                      <tr>
                        <td>2025-12-17</td>
                        <td>Payment received</td>
                        <td>Jane Smith</td>
                        <td><span className="badge bg-success">Completed</span></td>
                      </tr>
                      <tr>
                        <td>2025-12-16</td>
                        <td>Car returned</td>
                        <td>Mike Johnson</td>
                        <td><span className="badge bg-info">Completed</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;