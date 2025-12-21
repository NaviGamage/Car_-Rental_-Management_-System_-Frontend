import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phonNumber: '',
    address: '',
    nic: '',
    role: 'customer'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phonNumber.trim()) {
      newErrors.phonNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phonNumber)) {
      newErrors.phonNumber = 'Phone number must be 10 digits';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;

      const response = await AuthService.register(registrationData);

      setSuccessMessage('Registration successful! Redirecting to login...');

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phonNumber: '',
        address: '',
        nic: '',
        role: 'customer'
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper"> {/* Reusing the background wrapper */}
      <div className="container py-5">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-11 col-lg-10 register-container shadow-lg d-flex flex-column flex-md-row p-0 overflow-hidden">
            
            {/* Left Side: Branding/Image Section */}
            <div className="col-md-5 register-image-side d-none d-md-flex align-items-center justify-content-center text-white p-5">
              <div className="text-center fade-in-up">
                <h1 className="fw-bold display-5 mb-3">Join Car Rental Management</h1>
                <p className="lead">Experience the freedom of the open road with our seamless car rental services.</p>
              </div>
            </div>

            {/* Right Side: Form Section */}
            <div className="col-md-7 bg-white register-form-side">
              <div className="form-scroll-area p-4 p-lg-5">
                <div className="mb-4">
                  <h2 className="fw-bold">Create Account</h2>
                  <p className="text-muted small">Please fill in the details to create your account.</p>
                </div>

                {successMessage && <div className="alert alert-success small">{successMessage}</div>}
                {apiError && <div className="alert alert-danger small">{apiError}</div>}

                <form onSubmit={handleSubmit} className="row g-3 fade-in-up">
                  {/* Full Name */}
                  <div className="col-md-12">
                    <label className="form-label-caps">Full Name</label>
                    <input
                      type="text"
                      className={`form-control custom-input ${errors.fullName ? 'is-invalid' : ''}`}
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <label className="form-label-caps">Email Address</label>
                    <input
                      type="email"
                      className={`form-control custom-input ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="col-md-6">
                    <label className="form-label-caps">Phone Number</label>
                    <input
                      type="text"
                      className={`form-control custom-input ${errors.phonNumber ? 'is-invalid' : ''}`}
                      name="phonNumber"
                      value={formData.phonNumber}
                      onChange={handleChange}
                      placeholder="0771234567"
                    />
                  </div>

                  {/* Password */}
                  <div className="col-md-6">
                    <label className="form-label-caps">Password</label>
                    <input
                      type="password"
                      className={`form-control custom-input ${errors.password ? 'is-invalid' : ''}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="col-md-6">
                    <label className="form-label-caps">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-control custom-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>

                  {/* NIC */}
                  <div className="col-md-12">
                    <label className="form-label-caps">NIC Number</label>
                    <input
                      type="text"
                      className={`form-control custom-input ${errors.nic ? 'is-invalid' : ''}`}
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      placeholder="123456789V"
                    />
                  </div>

                  {/* Address */}
                  <div className="col-md-12">
                    <label className="form-label-caps">Address</label>
                    <textarea
                      className={`form-control custom-input ${errors.address ? 'is-invalid' : ''}`}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Your street address"
                      rows="2"
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <button type="submit" className="btn login-btn w-100 text-white py-3" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Register Now'}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <p className="small text-muted">
                    Already have an account? <Link to="/login" className="fw-bold text-dark text-decoration-none border-bottom border-dark">Sign In</Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
    

export default Register;