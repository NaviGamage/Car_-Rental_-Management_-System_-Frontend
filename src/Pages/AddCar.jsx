import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import AdminNavbar from '../Components/AdminNavbar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../app.css';
import CarService from '../services/CarService';

const AddCar = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  // Car form state
  const [carData, setCarData] = useState({
    carModel: '',
    brand: '',
    plateNumber: '',
    typesOfFuel: '',
    rate: '',
    status: 'available',
    year: new Date().getFullYear(),
    seatingCapacity: '',
    description: ''
  });

  // Image state
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarData({
      ...carData,
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

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (validFiles.length !== files.length) {
      setError('Only image files are allowed');
      return;
    }

    // Limit to 5 images
    if (validFiles.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(validFiles);

    // Create preview URLs
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setError('');
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke object URLs to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!carData.carModel.trim()) {
      newErrors.carModel = 'Car model is required';
    }

    if (!carData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!carData.plateNumber.trim()) {
      newErrors.plateNumber = 'Plate number is required';
    }

    if (!carData.typesOfFuel) {
      newErrors.typesOfFuel = 'Fuel type is required';
    }

    if (!carData.rate || carData.rate <= 0) {
      newErrors.rate = 'Valid rate is required';
    }

    if (!carData.year || carData.year < 1900 || carData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year is required';
    }

    if (!carData.seatingCapacity || carData.seatingCapacity < 1) {
      newErrors.seatingCapacity = 'Valid seating capacity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Step 1: Create car
      const carResponse = await axios.post('http://localhost:8080/api/cars', {
        ...carData,
        rate: parseFloat(carData.rate),
        year: parseInt(carData.year),
        seatingCapacity: parseInt(carData.seatingCapacity)
      });

      const carId = carResponse.data.carId;

      // Step 2: Upload images if any
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach(image => {
          formData.append('files', image);
        });

        await axios.post(
          `http://localhost:8080/api/car-images/upload-multiple/${carId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      setSuccess(true);
      setLoading(false);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/cars');
      }, 2000);

    } catch (error) {
      console.error('Error adding car:', error);
      setError(error.response?.data?.message || 'Failed to add car. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Modern Admin Navbar */}
      <AdminNavbar user={user} handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="main-content">
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 fw-bold mb-2">
              <span className="gradient-text">Add New Car</span>
            </h1>
            <p className="text-muted mb-0">
              Fill in the details to add a new car to your fleet
            </p>
          </div>
          <button 
            className="btn btn-modern-outline"
            onClick={() => navigate('/admin/cars')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Cars
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Success!</strong> Car added successfully. Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column - Car Details */}
            <div className="col-lg-8">
              <div className="modern-table mb-4">
                <div className="table-header">
                  <h5><i className="bi bi-info-circle me-2"></i>Car Information</h5>
                </div>
                <div className="table-body p-4">
                  <div className="row g-3">
                    {/* Car Model */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-semibold mb-2">
                          Car Model <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-lg ${errors.carModel ? 'is-invalid' : ''}`}
                          name="carModel"
                          value={carData.carModel}
                          onChange={handleInputChange}
                          placeholder="e.g., Camry"
                        />
                        {errors.carModel && (
                          <div className="invalid-feedback d-block">{errors.carModel}</div>
                        )}
                      </div>
                    </div>

                    {/* Brand */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-semibold mb-2">
                          Brand <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select form-select-lg ${errors.brand ? 'is-invalid' : ''}`}
                          name="brand"
                          value={carData.brand}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Brand</option>
                          <option value="Toyota">Toyota</option>
                          <option value="Honda">Honda</option>
                          <option value="Nissan">Nissan</option>
                          <option value="Mazda">Mazda</option>
                          <option value="Suzuki">Suzuki</option>
                          <option value="BMW">BMW</option>
                          <option value="Mercedes-Benz">Mercedes-Benz</option>
                          <option value="Audi">Audi</option>
                          <option value="Hyundai">Hyundai</option>
                          <option value="KIA">KIA</option>
                        </select>
                        {errors.brand && (
                          <div className="invalid-feedback d-block">{errors.brand}</div>
                        )}
                      </div>
                    </div>

                    {/* Plate Number */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-semibold mb-2">
                          Plate Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-lg ${errors.plateNumber ? 'is-invalid' : ''}`}
                          name="plateNumber"
                          value={carData.plateNumber}
                          onChange={handleInputChange}
                          placeholder="e.g., ABC-1234"
                        />
                        {errors.plateNumber && (
                          <div className="invalid-feedback d-block">{errors.plateNumber}</div>
                        )}
                      </div>
                    </div>

                    {/* Fuel Type */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-semibold mb-2">
                          Fuel Type <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select form-select-lg ${errors.typesOfFuel ? 'is-invalid' : ''}`}
                          name="typesOfFuel"
                          value={carData.typesOfFuel}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Fuel Type</option>
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Electric">Electric</option>
                        </select>
                        {errors.typesOfFuel && (
                          <div className="invalid-feedback d-block">{errors.typesOfFuel}</div>
                        )}
                      </div>
                    </div>

                    {/* Daily Rate */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label fw-semibold mb-2">
                          Daily Rate (Rs.) <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-transparent">Rs.</span>
                          <input
                            type="number"
                            className={`form-control ${errors.rate ? 'is-invalid' : ''}`}
                            name="rate"
                            value={carData.rate}
                            onChange={handleInputChange}
                            placeholder="5000"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {errors.rate && (
                          <div className="invalid-feedback d-block">{errors.rate}</div>
                        )}
                      </div>
                    </div>

                    {/* Year */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label fw-semibold mb-2">
                          Year <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control form-control-lg ${errors.year ? 'is-invalid' : ''}`}
                          name="year"
                          value={carData.year}
                          onChange={handleInputChange}
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                        {errors.year && (
                          <div className="invalid-feedback d-block">{errors.year}</div>
                        )}
                      </div>
                    </div>

                    {/* Seating Capacity */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label fw-semibold mb-2">
                          Seating Capacity <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <input
                            type="number"
                            className={`form-control ${errors.seatingCapacity ? 'is-invalid' : ''}`}
                            name="seatingCapacity"
                            value={carData.seatingCapacity}
                            onChange={handleInputChange}
                            placeholder="5"
                            min="1"
                            max="50"
                          />
                          <span className="input-group-text bg-transparent">seats</span>
                        </div>
                        {errors.seatingCapacity && (
                          <div className="invalid-feedback d-block">{errors.seatingCapacity}</div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label fw-semibold mb-2">Description</label>
                        <textarea
                          className="form-control form-control-lg"
                          name="description"
                          value={carData.description}
                          onChange={handleInputChange}
                          rows="5"
                          placeholder="Enter car description, features, and any important details..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="modern-table mb-4">
                <div className="table-header">
                  <h5><i className="bi bi-images me-2"></i>Car Images</h5>
                </div>
                <div className="table-body p-4">
                  <div className="mb-4">
                    <div className="image-upload-area">
                      <input
                        type="file"
                        className="d-none"
                        id="imageUpload"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                      <label htmlFor="imageUpload" className="image-upload-label">
                        <div className="text-center py-5">
                          <i className="bi bi-cloud-arrow-up text-muted" style={{ fontSize: '3rem' }}></i>
                          <h5 className="mt-3 mb-2">Upload Car Images</h5>
                          <p className="text-muted mb-0">
                            Click to browse or drag and drop images here
                          </p>
                          <small className="text-muted">
                            Supported: JPG, PNG, GIF • Max 5 images
                          </small>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="image-previews">
                      <h6 className="fw-semibold mb-3">Selected Images ({imagePreviews.length}/5)</h6>
                      <div className="row g-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="col-md-3 col-6">
                            <div className="image-preview-card">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="img-fluid rounded"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger image-remove-btn"
                                onClick={() => removeImage(index)}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                              <div className="image-number">{index + 1}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="col-lg-4">
              <div className="sticky-sidebar">
                <div className="modern-table mb-4">
                  <div className="table-header">
                    <h5><i className="bi bi-gear me-2"></i>Car Status</h5>
                  </div>
                  <div className="table-body p-4">
                    <div className="form-group">
                      <label className="form-label fw-semibold mb-2">Initial Status</label>
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className={`btn ${carData.status === 'available' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                          onClick={() => setCarData({...carData, status: 'available'})}
                        >
                          Available
                        </button>
                        <button
                          type="button"
                          className={`btn ${carData.status === 'rented' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                          onClick={() => setCarData({...carData, status: 'rented'})}
                        >
                          Rented
                        </button>
                        <button
                          type="button"
                          className={`btn ${carData.status === 'under maintenance' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                          onClick={() => setCarData({...carData, status: 'under maintenance'})}
                        >
                          Maintenance
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="modern-table mb-4">
                  <div className="table-header">
                    <h5><i className="bi bi-eye me-2"></i>Preview</h5>
                  </div>
                  <div className="table-body p-4">
                    {carData.brand || carData.carModel ? (
                      <div className="car-preview">
                        <div className="d-flex align-items-center mb-3">
                          <div className="car-preview-icon me-3">
                            <i className="bi bi-car-front fs-3"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">{carData.brand} {carData.carModel}</h6>
                            <small className="text-muted">{carData.year || 'Year'}</small>
                          </div>
                        </div>
                        
                        <div className="row g-2 mb-3">
                          {carData.typesOfFuel && (
                            <div className="col-6">
                              <div className="car-detail-item">
                                <i className="bi bi-fuel-pump me-2"></i>
                                <small>{carData.typesOfFuel}</small>
                              </div>
                            </div>
                          )}
                          {carData.seatingCapacity && (
                            <div className="col-6">
                              <div className="car-detail-item">
                                <i className="bi bi-people me-2"></i>
                                <small>{carData.seatingCapacity} seats</small>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {carData.rate && (
                          <div className="car-price-preview">
                            <div className="fw-bold fs-4 text-primary">
                              Rs. {parseFloat(carData.rate).toLocaleString()}
                              <span className="text-muted small">/day</span>
                            </div>
                          </div>
                        )}
                        
                        {carData.plateNumber && (
                          <div className="mt-3 pt-3 border-top">
                            <small className="text-muted">Plate: {carData.plateNumber}</small>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <i className="bi bi-car-front text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted small mb-0">Fill in details to see preview</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="modern-table">
                  <div className="table-body p-4">
                    <button
                      type="submit"
                      className="btn btn-modern btn-modern-primary w-100 py-3 mb-3"
                      disabled={loading || success}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Adding Car...
                        </>
                      ) : success ? (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Car Added!
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Add Car to Fleet
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-modern-outline w-100"
                      onClick={() => navigate('/admin/cars')}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
    );
};

export default AddCar;