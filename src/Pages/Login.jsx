import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import 'bootstrap/dist/css/bootstrap.min.css';
import'../App.css';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Inside Login.js -> handleSubmit
    try {
      const user = await AuthService.login(formData); // Note: renamed 'response' to 'user' for clarity

      console.log("User received from service:", user);

      // Use Optional Chaining (?.) to safely check the role
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'CUSTOMER') {
        navigate('/customer/dashboard');
      } else {
        setApiError('Login successful, but role is undefined.');
      }
    } catch (error) {
      // Your AuthService throws error.response?.data, so check for a message field
      setApiError(error.message || error || 'Invalid email or password');
    }
  };

 return (
    <div className="login-wrapper">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-10 col-lg-8 login-container shadow-lg d-flex flex-column flex-md-row p-0 overflow-hidden">
            
            {/* Left Side: Branding & Car Image */}
            <div className="col-md-5 login-image-side d-flex flex-column justify-content-center align-items-center text-white p-4">
              <div className="brand-content fade-in-up">
                <h1 className="fw-bold display-5 mb-3">Car Rental Management</h1>
                <p className="lead">Drive Your Dreams with Us</p>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="col-md-7 login-form-side p-4 p-lg-5">
              <div className="text-center mb-4 fade-in-up delay-1">
                <h2 className="fw-bold display-6">Sign in</h2>
              </div>

              {apiError && (
                <div className="alert alert-danger small py-2 fade-in" role="alert">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="fade-in-up delay-2">
                {/* Email Address */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label-caps">EMAIL</label>
                  <input
                    type="email"
                    className={`form-control custom-input ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    placeholder="hello@reallygreatsite.com"
                  
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label-caps">PASSWORD</label>
                  <input
                    type="password"
                    className={`form-control custom-input ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label small text-muted" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" id="forgot-link">Forgot Password?</Link>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn login-btn w-100 text-white mb-3" disabled={loading}>
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : 'Login'}
                </button>
              </form>

              <div className="text-center mt-3 fade-in-up delay-3">
                <p className="small text-muted">
                  Don't have an account? <Link to="/register" className="text-danger fw-bold text-decoration-none">Sign Up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;