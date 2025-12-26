import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import CarService from '../services/CarService';
import AdminNavbar from '../Components/AdminNavbar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const ManageCars = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();
  
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);

  // Calculate stats from cars data
  const stats = {
    total: cars.length,
    available: cars.filter(c => c.status === 'available').length,
    rented: cars.filter(c => c.status === 'rented').length,
    maintenance: cars.filter(c => c.status === 'under maintenance').length
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    filterCars();
  }, [cars, selectedStatus, searchTerm]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:8080/api/cars');
      setCars(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars. Please try again.');
      setLoading(false);
    }
  };

  const filterCars = () => {
    let filtered = cars;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(car => car.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(car =>
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCars(filtered);
  };

  const handleUpdateStatus = async (carId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/cars/${carId}/status`, { status: newStatus });
      fetchCars();
    } catch (error) {
      console.error('Error updating car status:', error);
      setError('Failed to update car status');
    }
  };

  const handleDeleteCar = (carId) => {
    setCarToDelete(carId);
    setShowDeleteModal(true);
  };

  const confirmDeleteCar = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/cars/${carToDelete}`);
      setShowDeleteModal(false);
      setCarToDelete(null);
      fetchCars();
    } catch (error) {
      console.error('Error deleting car:', error);
      setError('Failed to delete car');
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'available': 'status-badge available',
      'rented': 'status-badge rented',
      'under maintenance': 'status-badge maintenance'
    };
    return badges[status] || 'status-badge';
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'success',
      'rented': 'warning',
      'under maintenance': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getFuelIcon = (fuelType) => {
    const icons = {
      'Petrol': 'bi-droplet',
      'Diesel': 'bi-fuel-pump',
      'Electric': 'bi-lightning-charge',
      'Hybrid': 'bi-arrow-left-right'
    };
    return icons[fuelType] || 'bi-fuel-pump';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
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
                        <h1 className="h2 fw-bold mb-2">Manage Cars</h1>
                        <p className="text-muted mb-0">
                            View and manage all vehicles in your fleet
                        </p>
                    </div>
                    <button
                        className="btn btn-modern btn-modern-primary"
                        onClick={() => navigate('/admin/cars/add')}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add New Car
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-xl-3 col-md-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('all')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon primary me-3">
                                    <i className="bi bi-car-front"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Total Cars</div>
                                    <div className="stat-value">{stats.total}</div>
                                    <div className="stat-change text-primary">
                                        <i className="bi bi-bar-chart me-1"></i>
                                        Entire fleet
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('available')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon success me-3">
                                    <i className="bi bi-check-circle"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Available</div>
                                    <div className="stat-value">{stats.available}</div>
                                    <div className="stat-change text-success">
                                        <i className="bi bi-arrow-up me-1"></i>
                                        Ready to rent
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('rented')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon warning me-3">
                                    <i className="bi bi-calendar-check"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Rented</div>
                                    <div className="stat-value">{stats.rented}</div>
                                    <div className="stat-change text-warning">
                                        <i className="bi bi-clock-history me-1"></i>
                                        Currently in use
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('under maintenance')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon danger me-3">
                                    <i className="bi bi-tools"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Maintenance</div>
                                    <div className="stat-value">{stats.maintenance}</div>
                                    <div className="stat-change text-danger">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        Under service
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="card modern-table mb-4">
                    <div className="table-header">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text bg-transparent border-end-0">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search cars by brand, model, or plate..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 text-end">
                                <div className="btn-group">
                                    <button
                                        className={`btn ${selectedStatus === 'all' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                                        onClick={() => setSelectedStatus('all')}
                                    >
                                        All ({stats.total})
                                    </button>
                                    <button
                                        className={`btn ${selectedStatus === 'available' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                                        onClick={() => setSelectedStatus('available')}
                                    >
                                        Available ({stats.available})
                                    </button>
                                    <button
                                        className={`btn ${selectedStatus === 'rented' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                                        onClick={() => setSelectedStatus('rented')}
                                    >
                                        Rented ({stats.rented})
                                    </button>
                                </div>
                                <button className="btn btn-modern-outline ms-2" onClick={fetchCars}>
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                        </div>
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
                        <p className="text-muted">Loading cars...</p>
                    </div>
                ) : filteredCars.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-5">
                        <div className="empty-state-icon mb-4">
                            <i className="bi bi-car-front text-muted" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="fw-semibold mb-2">No Cars Found</h4>
                        <p className="text-muted mb-4">
                            {selectedStatus === 'all' && searchTerm === ''
                                ? "You haven't added any cars to your fleet yet"
                                : `No cars match your ${searchTerm ? 'search' : 'filter'} criteria`}
                        </p>
                        <button
                            className="btn btn-modern btn-modern-primary"
                            onClick={() => navigate('/admin/cars/add')}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add New Car
                        </button>
                    </div>
                ) : (
                    /* Cars Grid View */
                    <div className="row g-4">
                        {filteredCars.map((car) => (
                            <div className="col-xl-4 col-lg-6" key={car.carId}>
                                <div className="car-card">
                                    {/* Car Header */}
                                    <div className="car-header">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h5 className="fw-bold mb-1">{car.brand} {car.carModel}</h5>
                                                <p className="text-muted small mb-0">ID: #{car.carId}</p>
                                            </div>
                                            <span className={`badge bg-${getStatusColor(car.status)}`}>
                                                {car.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Car Details */}
                                    <div className="car-body">
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <div className="car-detail-item">
                                                    <i className={`bi ${getFuelIcon(car.typesOfFuel)} text-primary me-2`}></i>
                                                    <span>{car.typesOfFuel}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="car-detail-item">
                                                    <i className="bi bi-people text-primary me-2"></i>
                                                    <span>{car.seatingCapacity} seats</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="car-detail-item">
                                                    <i className="bi bi-calendar text-primary me-2"></i>
                                                    <span>{car.year}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="car-detail-item">
                                                    <i className="bi bi-tag text-primary me-2"></i>
                                                    <span>{car.plateNumber}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="car-description">
                                            <p className="text-muted small mb-0">
                                                {car.description?.substring(0, 80)}...
                                            </p>
                                        </div>
                                    </div>

                                    {/* Car Footer */}
                                    <div className="car-footer">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="car-price fw-bold">
                                                    {formatCurrency(car.rate)}<span className="text-muted small">/day</span>
                                                </div>
                                            </div>
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-modern-outline"
                                                    onClick={() => navigate(`/admin/cars/edit/${car.carId}`)}
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-modern-outline dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        title="Status"
                                                    >
                                                        <i className="bi bi-arrow-clockwise"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => handleUpdateStatus(car.carId, 'available')}
                                                            >
                                                                <i className="bi bi-check-circle text-success me-2"></i>
                                                                Set as Available
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => handleUpdateStatus(car.carId, 'rented')}
                                                            >
                                                                <i className="bi bi-calendar-check text-warning me-2"></i>
                                                                Set as Rented
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => handleUpdateStatus(car.carId, 'under maintenance')}
                                                            >
                                                                <i className="bi bi-tools text-danger me-2"></i>
                                                                Set as Maintenance
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-modern-outline text-danger"
                                                    onClick={() => handleDeleteCar(car.carId)}
                                                    title="Delete"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body py-4">
                                <div className="text-center mb-4">
                                    <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                                </div>
                                <p className="text-center">
                                    Are you sure you want to delete this car? This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    className="btn btn-modern-outline"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={confirmDeleteCar}
                                >
                                    Delete Car
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


            export default ManageCars;