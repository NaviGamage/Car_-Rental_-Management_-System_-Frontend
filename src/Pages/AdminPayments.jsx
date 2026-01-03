import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../Components/AdminNavbar';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api/payments';

const AdminPayments = () => {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({ totalRevenue: 0, paymentCount: 0, averagePayment: 0 });
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);

    // Calculate stats from payments data
    const calculateStats = (paymentsList) => {
        const total = paymentsList.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        const count = paymentsList.length;
        const average = count > 0 ? total / count : 0;

        return {
            totalRevenue: total,
            paymentCount: count,
            averagePayment: average
        };
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        if (payments.length > 0) {
            filterPayments();
        }
    }, [searchTerm, payments, dateFilter]);

    useEffect(() => {
        const filteredStats = calculateStats(filteredPayments);
        setStats(filteredStats);
    }, [filteredPayments]);

    const fetchPayments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(API_BASE_URL);
            // Ensure amounts are numbers
            const paymentsWithNumbers = response.data.map(payment => ({
                ...payment,
                amount: parseFloat(payment.amount) || 0
            }));
            setPayments(paymentsWithNumbers);
            setFilteredPayments(paymentsWithNumbers);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setError('Failed to fetch payments. Please try again.');
        }
        setLoading(false);
    };

    const filterPayments = () => {
        let filtered = payments;

        // Apply date filter
        if (dateFilter.start && dateFilter.end) {
            const startDate = new Date(dateFilter.start);
            const endDate = new Date(dateFilter.end);
            endDate.setHours(23, 59, 59, 999); // Include entire end day

            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.paymentDate);
                return paymentDate >= startDate && paymentDate <= endDate;
            });
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.paymentId?.toString().includes(searchTerm) ||
                payment.bookingId?.toString().includes(searchTerm) ||
                payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.amount?.toString().includes(searchTerm)
            );
        }

        setFilteredPayments(filtered);
    };

    const fetchDateRangePayments = async () => {
        if (!dateFilter.start || !dateFilter.end) {
            setError('Please select both start and end dates');
            return;
        }

        if (new Date(dateFilter.start) > new Date(dateFilter.end)) {
            setError('Start date cannot be after end date');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `${API_BASE_URL}/date-range?startDate=${dateFilter.start}&endDate=${dateFilter.end}`
            );
            const paymentsWithNumbers = response.data.map(payment => ({
                ...payment,
                amount: parseFloat(payment.amount) || 0
            }));
            setFilteredPayments(paymentsWithNumbers);
        } catch (error) {
            console.error('Error fetching date range payments:', error);
            setError('Failed to fetch payments for selected date range');
        }
        setLoading(false);
    };

    const handleDeleteClick = (paymentId) => {
        setPaymentToDelete(paymentId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!paymentToDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}/${paymentToDelete}`);
            setShowDeleteModal(false);
            setPaymentToDelete(null);
            fetchPayments();
        } catch (error) {
            console.error('Error deleting payment:', error);
            setError('Failed to delete payment');
            setShowDeleteModal(false);
        }
    };

    const viewPaymentDetails = async (paymentId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${paymentId}`);
            setSelectedPayment({
                ...response.data,
                amount: parseFloat(response.data.amount) || 0
            });
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching payment details:', error);
            setError('Failed to fetch payment details');
        }
    };

    const exportToCSV = () => {
        if (filteredPayments.length === 0) {
            setError('No payments to export');
            return;
        }

        const headers = ['Payment ID', 'Booking ID', 'Amount (LKR)', 'Payment Date', 'Payment Method'];
        const csvData = filteredPayments.map(p => [
            p.paymentId,
            p.bookingId,
            `LKR ${formatCurrencyNumber(p.amount)}`,
            new Date(p.paymentDate).toLocaleDateString(),
            p.paymentMethod
        ]);

        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const clearFilters = () => {
        setDateFilter({ start: '', end: '' });
        setSearchTerm('');
        setError('');
        setFilteredPayments(payments);
    };

    // Format currency in LKR with symbol
    const formatCurrency = (amount) => {
        return `LKR ${formatCurrencyNumber(amount)}`;
    };

    // Format currency number without symbol
    const formatCurrencyNumber = (amount) => {
        const numAmount = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-LK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    };

    // For table display - compact format
    const formatCurrencyCompact = (amount) => {
        const numAmount = parseFloat(amount) || 0;
        return `LKR ${new Intl.NumberFormat('en-LK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numAmount)}`;
    };

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    // Debug: Log payments and stats
    useEffect(() => {
        console.log('Payments:', payments);
        console.log('Filtered Payments:', filteredPayments);
        console.log('Stats:', stats);
    }, [payments, filteredPayments, stats]);

    return (
        <div className="admin-dashboard">
            {/* Modern Admin Navbar */}
            <AdminNavbar user={user} handleLogout={handleLogout} />

            {/* Main Content */}
            <main className="main-content">
                {/* Page Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h2 fw-bold mb-2">Payment Management</h1>
                        <p className="text-muted mb-0">
                            Track and manage all payment transactions
                        </p>
                    </div>
                    <button
                        className="btn btn-modern btn-modern-primary"
                        onClick={exportToCSV}
                        disabled={filteredPayments.length === 0}
                    >
                        <i className="bi bi-download me-2"></i>
                        Export CSV
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-xl-4 col-md-6">
                        <div className="stat-card hover-lift">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon primary me-3">
                                    <i className="bi bi-currency-exchange"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Total Revenue</div>
                                    <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                                    <div className="stat-change text-primary">
                                        <i className="bi bi-bar-chart me-1"></i>
                                        All time revenue
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-md-6">
                        <div className="stat-card hover-lift">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon success me-3">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Total Payments</div>
                                    <div className="stat-value">{stats.paymentCount}</div>
                                    <div className="stat-change text-success">
                                        <i className="bi bi-arrow-up me-1"></i>
                                        Showing {filteredPayments.length} of {payments.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-4 col-md-6">
                        <div className="stat-card hover-lift">
                            <div className="d-flex align-items-center">
                                <div className="stat-icon warning me-3">
                                    <i className="bi bi-graph-up"></i>
                                </div>
                                <div>
                                    <div className="stat-label">Average Payment</div>
                                    <div className="stat-value">{formatCurrency(stats.averagePayment)}</div>
                                    <div className="stat-change text-warning">
                                        <i className="bi bi-clock-history me-1"></i>
                                        Per transaction
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
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-transparent border-end-0">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search payments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="row g-2">
                                    <div className="col">
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateFilter.start}
                                            onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                                            placeholder="Start Date"
                                        />
                                    </div>
                                    <div className="col">
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateFilter.end}
                                            onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                                            placeholder="End Date"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 text-end">
                                <div className="btn-group">
                                    <button
                                        className="btn btn-modern btn-modern-primary"
                                        onClick={fetchDateRangePayments}
                                        disabled={!dateFilter.start || !dateFilter.end}
                                    >
                                        <i className="bi bi-filter me-1"></i>
                                        Filter
                                    </button>
                                    <button
                                        className="btn btn-modern-outline"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="modern-spinner mx-auto mb-3"></div>
                        <p className="text-muted">Loading payments...</p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-5">
                        <div className="empty-state-icon mb-4">
                            <i className="bi bi-credit-card text-muted" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="fw-semibold mb-2">No Payments Found</h4>
                        <p className="text-muted mb-4">
                            {searchTerm || dateFilter.start
                                ? "No payments match your search criteria"
                                : "No payment transactions available"}
                        </p>
                        <button
                            className="btn btn-modern btn-modern-primary"
                            onClick={clearFilters}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    /* Payments Table */
                    <div className="card modern-table">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th scope="col" className="ps-4">Payment ID</th>
                                        <th scope="col">Booking ID</th>
                                        <th scope="col">Amount (LKR)</th>
                                        <th scope="col">Payment Date</th>
                                        <th scope="col" className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.paymentId}>
                                            <td className="ps-4 fw-semibold">#{payment.paymentId}</td>
                                            <td>#{payment.bookingId}</td>
                                            <td className="fw-bold text-success">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td>
                                                {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-sm btn-modern-outline"
                                                        onClick={() => viewPaymentDetails(payment.paymentId)}
                                                        title="View Details"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-modern-outline text-danger"
                                                        onClick={() => handleDeleteClick(payment.paymentId)}
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
                        {/* Table Footer */}
                        {filteredPayments.length > 0 && (
                            <div className="table-footer d-flex justify-content-between align-items-center px-4 py-3 border-top">
                                <div className="text-muted">
                                    Showing <span className="fw-semibold">{filteredPayments.length}</span> payment(s)
                                </div>
                                <div className="text-muted">
                                    Total: <span className="fw-bold text-success">{formatCurrency(stats.totalRevenue)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Payment Details Modal */}
            {showModal && selectedPayment && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-credit-card me-2"></i>
                                    Payment Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body py-4">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="detail-card">
                                            <div className="detail-label">Payment ID</div>
                                            <div className="detail-value">#{selectedPayment.paymentId}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="detail-card">
                                            <div className="detail-label">Booking ID</div>
                                            <div className="detail-value">#{selectedPayment.bookingId}</div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="detail-card bg-light-success">
                                            <div className="detail-label">Amount</div>
                                            <div className="detail-value display-6 fw-bold text-success">
                                                {formatCurrency(selectedPayment.amount)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="detail-card">
                                            <div className="detail-label">Payment Date</div>
                                            <div className="detail-value">
                                                {new Date(selectedPayment.paymentDate).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="detail-card">
                                            <div className="detail-label">Payment Method</div>
                                            <div className="detail-value">
                                                <span className={`badge bg-${selectedPayment.paymentMethod === 'CARD' ? 'primary' : selectedPayment.paymentMethod === 'CASH' ? 'success' : selectedPayment.paymentMethod === 'ONLINE' ? 'info' : 'warning'} p-2`}>
                                                    {selectedPayment.paymentMethod}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedPayment.transactionId && (
                                        <div className="col-12">
                                            <div className="detail-card">
                                                <div className="detail-label">Transaction ID</div>
                                                <div className="detail-value font-monospace text-break">
                                                    {selectedPayment.transactionId}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedPayment.paymentStatus && (
                                        <div className="col-12">
                                            <div className="detail-card">
                                                <div className="detail-label">Status</div>
                                                <div className="detail-value">
                                                    <span className={`badge bg-${selectedPayment.paymentStatus === 'COMPLETED' ? 'success' : selectedPayment.paymentStatus === 'PENDING' ? 'warning' : 'danger'} p-2`}>
                                                        {selectedPayment.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    className="btn btn-modern-outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    Are you sure you want to delete this payment? This action cannot be undone.
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
                                    onClick={confirmDelete}
                                >
                                    Delete Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;