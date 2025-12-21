import React from 'react';
import {  Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import CustomerDashboard from './Pages/CustomerDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import BrowseCars from './Pages/BrowseCars';
import CarDetails from './Pages/CarDetails';
import AuthService from './services/AuthService';
import 'bootstrap/dist/css/bootstrap.min.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = AuthService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
   
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Browse Cars Route */}
        <Route
          path="/customer/cars"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <BrowseCars />
            </ProtectedRoute>
          }
        />
        
        {/* Car Details Route */}
        <Route
          path="/customer/cars/:carId"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CarDetails />
            </ProtectedRoute>
          }
        />
        
        {/* My Bookings Route (placeholder) */}
        <Route
          path="/customer/bookings"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <ComingSoon page="My Bookings" />
            </ProtectedRoute>
          }
        />
        
        {/* Profile Route (placeholder) */}
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <ComingSoon page="Profile" />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
   
  );
}

// Unauthorized Page Component
const Unauthorized = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <i className="bi bi-shield-x text-danger" style={{fontSize: '5rem'}}></i>
          <h1 className="display-4 mt-3">403</h1>
          <h2>Access Denied</h2>
          <p className="text-muted">You don't have permission to access this page.</p>
          <a href="/login" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
};

// 404 Not Found Component
const NotFound = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <i className="bi bi-exclamation-triangle text-warning" style={{fontSize: '5rem'}}></i>
          <h1 className="display-4 mt-3">404</h1>
          <h2>Page Not Found</h2>
          <p className="text-muted">The page you're looking for doesn't exist.</p>
          <a href="/login" className="btn btn-primary">
            <i className="bi bi-house me-2"></i>
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
};

// Coming Soon Component (Placeholder for unfinished pages)
const ComingSoon = ({ page }) => {
  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

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
                <a className="nav-link" href="/customer/profile">Profile</a>
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

      {/* Coming Soon Content */}
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="bi bi-tools text-info" style={{fontSize: '5rem'}}></i>
            <h1 className="display-4 mt-3">Coming Soon</h1>
            <h2>{page} Page</h2>
            <p className="text-muted">This page is under development and will be available soon.</p>
            <a href="/customer/dashboard" className="btn btn-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;