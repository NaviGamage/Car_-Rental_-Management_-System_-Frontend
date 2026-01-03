import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import AdminNavbar from '../Components/AdminNavbar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const API_BASE_URL = 'http://localhost:8080/api/users';

const UserManage = () => {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    customerCount: 0,
    adminCount: 0
  });
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Calculate stats from users data
  const calculateStats = (userData) => {
    const total = userData.length;
    const customers = userData.filter(u => u.role === 'CUSTOMER').length;
    const admins = userData.filter(u => u.role === 'ADMIN').length;

    setStats({
      totalUsers: total,
      customerCount: customers,
      adminCount: admins
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      filterUsers();
    }
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(API_BASE_URL);
      setUsers(response.data);
      setFilteredUsers(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.userId?.toString().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/${userToDelete}`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
      setShowDeleteModal(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`);
      setSelectedUser(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    }
  };

  const openEditModal = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`);
      setEditFormData(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    }
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/${editFormData.userId}`, editFormData);
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      setError('No users to export');
      return;
    }

    const headers = ['User ID', 'Username', 'Email', 'First Name', 'Last Name', 'Phone', 'Role', 'Created Date'];
    const csvData = filteredUsers.map(u => [
      u.userId,
      u.username,
      u.email,
      u.firstName,
      u.lastName,
      u.phoneNumber || 'N/A',
      u.role,
      new Date(u.createdAt || Date.now()).toLocaleDateString()
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setError('');
    setFilteredUsers(users);
  };

  const getRoleBadgeClass = (role) => {
    return role === 'ADMIN' ? 'bg-danger' : 'bg-success';
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
            <h1 className="h2 fw-bold mb-2">User Management</h1>
            <p className="text-muted mb-0">
              Manage and monitor all system users
            </p>
          </div>
          <button
            className="btn btn-modern btn-modern-primary"
            onClick={exportToCSV}
            disabled={filteredUsers.length === 0}
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
            <div className="stat-card hover-lift" onClick={() => setRoleFilter('ALL')}>
              <div className="d-flex align-items-center">
                <div className="stat-icon primary me-3">
                  <i className="bi bi-people"></i>
                </div>
                <div>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-change text-primary">
                    <i className="bi bi-bar-chart me-1"></i>
                    All system users
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-md-6">
            <div className="stat-card hover-lift" onClick={() => setRoleFilter('CUSTOMER')}>
              <div className="d-flex align-items-center">
                <div className="stat-icon success me-3">
                  <i className="bi bi-person"></i>
                </div>
                <div>
                  <div className="stat-label">Customers</div>
                  <div className="stat-value">{stats.customerCount}</div>
                  <div className="stat-change text-success">
                    <i className="bi bi-arrow-up me-1"></i>
                    Regular users
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-md-6">
            <div className="stat-card hover-lift" onClick={() => setRoleFilter('ADMIN')}>
              <div className="d-flex align-items-center">
                <div className="stat-icon danger me-3">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <div className="stat-label">Admins</div>
                  <div className="stat-value">{stats.adminCount}</div>
                  <div className="stat-change text-danger">
                    <i className="bi bi-person-check me-1"></i>
                    System administrators
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
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by name, email, username, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4 text-end">
                <div className="btn-group">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="form-select"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="CUSTOMER">Customers</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                  <button
                    className="btn btn-modern-outline ms-2"
                    onClick={clearFilters}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                  <button className="btn btn-modern-outline ms-2" onClick={fetchUsers}>
                    <i className="bi bi-arrow-clockwise"></i>
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
            <p className="text-muted">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-5">
            <div className="empty-state-icon mb-4">
              <i className="bi bi-people text-muted" style={{ fontSize: '4rem' }}></i>
            </div>
            <h4 className="fw-semibold mb-2">No Users Found</h4>
            <p className="text-muted mb-4">
              {searchTerm || roleFilter !== 'ALL'
                ? "No users match your search criteria"
                : "No users registered yet"}
            </p>
          </div>
        ) : (
          /* Users Table */
          <div className="card modern-table">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th scope="col" className="ps-4">User ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Role</th>
                    <th scope="col" className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.userId}>
                      <td className="ps-4 fw-semibold">#{user.userId}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm me-3">
                            <div className="avatar-circle bg-light">
                              <i className="bi bi-person text-primary"></i>
                            </div>
                          </div>
                          <div>
                            <div className="fw-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-muted small">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-modern-outline"
                            onClick={() => viewUserDetails(user.userId)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-modern-outline"
                            onClick={() => openEditModal(user.userId)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-modern-outline text-danger"
                            onClick={() => handleDeleteClick(user.userId)}
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
            {filteredUsers.length > 0 && (
              <div className="table-footer d-flex justify-content-between align-items-center px-4 py-3 border-top">
                <div className="text-muted">
                  Showing <span className="fw-semibold">{filteredUsers.length}</span> user(s)
                </div>
              </div>
            )}
          </div>
        
        )}
      </main>

      {/* View User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-circle me-2"></i>
                  User Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body py-4">
                <div className="text-center mb-4">
                  <div className="avatar-xl mx-auto mb-3">
                    <div className="avatar-circle bg-light">
                      <i className="bi bi-person" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                  <h5 className="fw-bold mb-1">{selectedUser.firstName} {selectedUser.lastName}</h5>
                  <p className="text-muted">@{selectedUser.username}</p>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="detail-card">
                      <div className="detail-label">User ID</div>
                      <div className="detail-value">#{selectedUser.userId}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="detail-card">
                      <div className="detail-label">Role</div>
                      <div className="detail-value">
                        <span className={`badge ${getRoleBadgeClass(selectedUser.role)} p-2`}>
                          {selectedUser.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="detail-card">
                      <div className="detail-label">
                        <i className="bi bi-envelope me-2"></i>
                        Email
                      </div>
                      <div className="detail-value">{selectedUser.email}</div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="detail-card">
                      <div className="detail-label">
                        <i className="bi bi-telephone me-2"></i>
                        Phone Number
                      </div>
                      <div className="detail-value">{selectedUser.phoneNumber || 'Not provided'}</div>
                    </div>
                  </div>

                  {selectedUser.createdAt && (
                    <div className="col-12">
                      <div className="detail-card">
                        <div className="detail-label">
                          <i className="bi bi-calendar me-2"></i>
                          Joined Date
                        </div>
                        <div className="detail-value">
                          {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
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

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Edit User</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.firstName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.lastName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.username || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={editFormData.phoneNumber || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={editFormData.role || 'CUSTOMER'}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-modern-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-modern btn-modern-primary"
                  onClick={handleEditSubmit}
                >
                  Save Changes
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
                  Are you sure you want to delete this user? This action cannot be undone.
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
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManage;