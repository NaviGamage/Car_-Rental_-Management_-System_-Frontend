import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import AdminNavbar from '../Components/AdminNavbar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const BookingManage = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();
    
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'delete'
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [editData, setEditData] = useState(null);
    
    // Stats calculation
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        revenue: bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + (b.amount || 0), 0)
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [bookings, selectedStatus, searchTerm]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError('');
            // Replace with your actual API endpoint
            const response = await axios.get('http://localhost:8080/api/rentals');
            setBookings(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError('Failed to load bookings. Please try again.');
            setLoading(false);
        }
    };

    const filterBookings = () => {
        let filtered = bookings;

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(booking => booking.status === selectedStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(booking =>
                booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.service?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBookings(filtered);
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/api/rentals/${bookingId}/status`, { status: newStatus });
            fetchBookings();
        } catch (error) {
            console.error('Error updating booking status:', error);
            setError('Failed to update booking status');
        }
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEditBooking = (booking) => {
        setSelectedBooking(booking);
        setEditData({ ...booking });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDeleteBooking = (booking) => {
        setSelectedBooking(booking);
        setModalMode('delete');
        setShowModal(true);
    };

    const confirmDeleteBooking = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/rentals/${selectedBooking.bookingId}`);
            setShowModal(false);
            fetchBookings();
        } catch (error) {
            console.error('Error deleting booking:', error);
            setError('Failed to delete booking');
            setShowModal(false);
        }
    };

    const saveEditBooking = async () => {
        try {
            await axios.put(`http://localhost:8080/api/rentals/${editData.bookingId}`, editData);
            setShowModal(false);
            fetchBookings();
        } catch (error) {
            console.error('Error updating booking:', error);
            setError('Failed to update booking');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': 'warning',
            'confirmed': 'info',
            'completed': 'success',
            'cancelled': 'danger'
        };
        return badges[status] || 'secondary';
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'warning',
            'confirmed': 'info',
            'completed': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Customer', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Status', 'Amount'];
        const rows = filteredBookings.map(b => [
            b.bookingId,
            b.customerName,
            b.email,
            b.phone,
            b.service,
            b.date,
            b.time,
            b.status,
            `$${b.amount}`
            
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
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
                        <h1 className="h2 fw-bold mb-2">Manage Bookings</h1>
                        <p className="text-muted mb-0">
                            View and manage all customer bookings
                        </p>
                    </div>
                    <button
                        className="btn btn-modern btn-modern-primary"
                        onClick={exportToCSV}
                    >
                        <i className="bi bi-download me-2"></i>
                        Export CSV
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-xl-2 col-md-3 col-sm-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('all')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon primary me-3">
                                    <i className="bi bi-calendar-check"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Total Bookings</div>
                                    <div className="stat-value">{stats.total}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-3 col-sm-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('pending')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon warning me-3">
                                    <i className="bi bi-clock"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Pending</div>
                                    <div className="stat-value">{stats.pending}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-3 col-sm-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('confirmed')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon info me-3">
                                    <i className="bi bi-check-circle"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Confirmed</div>
                                    <div className="stat-value">{stats.confirmed}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-3 col-sm-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('completed')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon success me-3">
                                    <i className="bi bi-check-all"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Completed</div>
                                    <div className="stat-value">{stats.completed}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-3 col-sm-6">
                        <div className="stat-card hover-lift" onClick={() => setSelectedStatus('cancelled')}>
                            <div className="d-flex align-items-center">
                                <div className="stat-icon danger me-3">
                                    <i className="bi bi-x-circle"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Cancelled</div>
                                    <div className="stat-value">{stats.cancelled}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-md-3 col-sm-6">
                        <div className="stat-card hover-lift">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon success me-3">
                                    <i className="bi bi-cash-stack"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Revenue</div>
                                    <div className="stat-value">{formatCurrency(stats.revenue)}</div>
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
                                        placeholder="Search bookings by customer, email, or ID..."
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
                                        className={`btn ${selectedStatus === 'pending' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                                        onClick={() => setSelectedStatus('pending')}
                                    >
                                        Pending ({stats.pending})
                                    </button>
                                    <button
                                        className={`btn ${selectedStatus === 'confirmed' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                                        onClick={() => setSelectedStatus('confirmed')}
                                    >
                                        Confirmed ({stats.confirmed})
                                    </button>
                                    <button
                                        className={`btn ${selectedStatus === 'completed' ? 'btn-modern btn-modern-primary' : 'btn-modern-outline'}`}
                                        onClick={() => setSelectedStatus('completed')}
                                    >
                                        Completed ({stats.completed})
                                    </button>
                                </div>
                                <button className="btn btn-modern-outline ms-2" onClick={fetchBookings}>
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
                        <p className="text-muted">Loading bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-5">
                        <div className="empty-state-icon mb-4">
                            <i className="bi bi-calendar-x text-muted" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="fw-semibold mb-2">No Bookings Found</h4>
                        <p className="text-muted mb-4">
                            {selectedStatus === 'all' && searchTerm === ''
                                ? "No bookings have been made yet"
                                : `No bookings match your ${searchTerm ? 'search' : 'filter'} criteria`}
                        </p>
                        <button
                            className="btn btn-modern btn-modern-outline"
                            onClick={() => {
                                setSelectedStatus('all');
                                setSearchTerm('');
                            }}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    /* Bookings Table View */
                    <div className="card modern-table">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Customer</th>
                                        <th>Service</th>
                                        <th>Date & Time</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.bookingId}>
                                            <td>
                                                <strong>#{booking.bookingId}</strong>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm me-3">
                                                        <div className="avatar-title bg-light rounded">
                                                            <i className="bi bi-person text-primary"></i>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{booking.customerName}</div>
                                                        <div className="text-muted small">{booking.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{booking.service}</div>
                                                <div className="text-muted small">{booking.location}</div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{formatDate(booking.date)}</div>
                                                <div className="text-muted small">{booking.time}</div>
                                            </td>
                                            <td>
                                                <div className="dropdown">
                                                    <span className={`badge bg-${getStatusBadge(booking.status)} dropdown-toggle`}
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        style={{ cursor: 'pointer' }}>
                                                        {booking.status.toUpperCase()}
                                                    </span>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <button className="dropdown-item" 
                                                              onClick={() => handleStatusChange(booking.bookingId, 'pending')}>
                                                                <i className="bi bi-clock text-warning me-2"></i>
                                                                Set as Pending
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item"
                                                              onClick={() => handleStatusChange(booking.bookingId, 'confirmed')}>
                                                                <i className="bi bi-check-circle text-info me-2"></i>
                                                                Set as Confirmed
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item"
                                                              onClick={() => handleStatusChange(booking.bookingId, 'completed')}>
                                                                <i className="bi bi-check-all text-success me-2"></i>
                                                                Set as Completed
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item"
                                                              onClick={() => handleStatusChange(booking.bookingId, 'cancelled')}>
                                                                <i className="bi bi-x-circle text-danger me-2"></i>
                                                                Set as Cancelled
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-bold">{formatCurrency(booking.amount)}</div>
                                            </td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-sm btn-modern-outline"
                                                        onClick={() => handleViewBooking(booking)}
                                                        title="View Details"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-modern-outline"
                                                        onClick={() => handleEditBooking(booking)}
                                                        title="Edit"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-modern-outline text-danger"
                                                        onClick={() => handleDeleteBooking(booking)}
                                                        title="Delete"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal for View/Edit/Delete */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    {modalMode === 'view' ? 'Booking Details' : 
                                     modalMode === 'edit' ? 'Edit Booking' : 
                                     'Confirm Delete'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            
                            <div className="modal-body py-4">
                                {modalMode === 'delete' ? (
                                    <div className="text-center">
                                        <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                                        <p className="mt-3">
                                            Are you sure you want to delete booking <strong>#{selectedBooking?.bookingId}</strong>?
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                ) : modalMode === 'edit' ? (
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Customer Name</label>
                                            <input type="text" className="form-control" 
                                                value={editData?.customerName || ''}
                                                onChange={(e) => setEditData({...editData, customerName: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" 
                                                value={editData?.email || ''}
                                                onChange={(e) => setEditData({...editData, email: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Phone</label>
                                            <input type="text" className="form-control" 
                                                value={editData?.phone || ''}
                                                onChange={(e) => setEditData({...editData, phone: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Amount</label>
                                            <input type="number" className="form-control" 
                                                value={editData?.amount || ''}
                                                onChange={(e) => setEditData({...editData, amount: e.target.value})} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Service</label>
                                            <input type="text" className="form-control" 
                                                value={editData?.service || ''}
                                                onChange={(e) => setEditData({...editData, service: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Date</label>
                                            <input type="date" className="form-control" 
                                                value={editData?.date || ''}
                                                onChange={(e) => setEditData({...editData, date: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Time</label>
                                            <input type="text" className="form-control" 
                                                value={editData?.time || ''}
                                                onChange={(e) => setEditData({...editData, time: e.target.value})} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Notes</label>
                                            <textarea className="form-control" rows="3"
                                                value={editData?.notes || ''}
                                                onChange={(e) => setEditData({...editData, notes: e.target.value})} />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <label className="form-label small text-muted">Booking ID</label>
                                                <p className="fw-semibold">#{selectedBooking?.bookingId}</p>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small text-muted">Status</label>
                                                <p>
                                                    <span className={`badge bg-${getStatusBadge(selectedBooking?.status)}`}>
                                                        {selectedBooking?.status?.toUpperCase()}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted">Customer</label>
                                                <p className="fw-semibold">{selectedBooking?.customerName}</p>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small text-muted">Email</label>
                                                <p>{selectedBooking?.email}</p>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small text-muted">Phone</label>
                                                <p>{selectedBooking?.phone}</p>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted">Service</label>
                                                <p className="fw-semibold">{selectedBooking?.service}</p>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small text-muted">Date</label>
                                                <p>{selectedBooking?.date}</p>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small text-muted">Time</label>
                                                <p>{selectedBooking?.time}</p>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted">Location</label>
                                                <p>{selectedBooking?.location}</p>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small text-muted">Amount</label>
                                                <p className="fw-bold h5">{formatCurrency(selectedBooking?.amount)}</p>
                                            </div>
                                            {selectedBooking?.notes && (
                                                <div className="col-12">
                                                    <label className="form-label small text-muted">Notes</label>
                                                    <p>{selectedBooking?.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer border-0">
                                <button
                                    className="btn btn-modern-outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                                </button>
                                {modalMode === 'edit' && (
                                    <button
                                        className="btn btn-modern btn-modern-primary"
                                        onClick={saveEditBooking}
                                    >
                                        Save Changes
                                    </button>
                                )}
                                {modalMode === 'delete' && (
                                    <button
                                        className="btn btn-danger"
                                        onClick={confirmDeleteBooking}
                                    >
                                        Delete Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManage;