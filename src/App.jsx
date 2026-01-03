import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import CustomerDashboard from './Pages/CustomerDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import BrowseCars from './Pages/BrowseCars';
import CarDetails from './Pages/CarDetails';
import AuthService from './services/AuthService';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyBookings from './Pages/MyBookings';
import Payment from './Pages/Payment';
import AddCar from './Pages/AddCar';
import ManageCars from './Pages/ManageCars';
import BookingManage from './Pages/BookingManage';
import AdminPayments from './Pages/AdminPayments';
import UserManage from './Pages/UserManage';
import UserProfile from './Pages/UserProfile';





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
      {/* My Bookings Route */}
      <Route
        path="/customer/bookings"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* Payment Route */}
      <Route
        path="/customer/payment/:bookingId"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <Payment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/payment"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <Payment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <UserProfile />
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

      {/* Admin Car Management Routes */}
      <Route
        path="/admin/cars"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ManageCars />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/cars/add"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddCar />
          </ProtectedRoute>
        }
      />

      {/* Admin Booking Management Route */}
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BookingManage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPayments />
          </ProtectedRoute>
        }
      />

      <Route
        path='/admin/users'
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManage />
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
          <i className="bi bi-shield-x text-danger" style={{ fontSize: '5rem' }}></i>
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
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '5rem' }}></i>
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

export default App;