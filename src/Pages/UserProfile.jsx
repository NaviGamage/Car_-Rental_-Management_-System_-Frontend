import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import UserService from '../services/UserService';
import Footer from '../Components/Footer';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const currentUser = UserService.getCurrentUser();
      if (!currentUser || !currentUser.userId) {
        alert('Please login first');
        window.location.href = '/login';
        return;
      }

      const data = await UserService.getUserById(currentUser.userId);
      setUser(data);
      setEditFormData(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      alert('Failed to load profile');
    }
    setLoading(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditFormData(user);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await UserService.updateUserProfile(user.userId, editFormData);
      setUser(updatedUser);
      setIsEditing(false);
      
      // Update localStorage with new user data
      UserService.updateCurrentUser(updatedUser);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
    setSaving(false);
  };

  const getMemberSince = () => {
    if (!user?.createdAt) return 'January 2024';
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <i className="bi bi-exclamation-circle text-danger" style={{fontSize: '4rem'}}></i>
          <h3 className="mt-3">User not found</h3>
          <button onClick={() => window.location.href = '/login'} className="btn btn-primary mt-3">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="card-header text-white py-4 border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="mb-1">
                      <i className="bi bi-person-badge me-2"></i>
                      Account Profile
                    </h4>
                    <p className="mb-0 opacity-90">Your personal information</p>
                  </div>
                  <span className="badge bg-white text-primary px-3 py-2 rounded-pill">
                    <i className="bi bi-shield-check me-1"></i>
                    Verified Account
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Content Card */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-4 p-lg-5">
                {/* User Header */}
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start mb-4 pb-4 border-bottom">
                  <div className="d-flex align-items-center mb-3 mb-lg-0">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                      <i className="bi bi-person text-white" style={{fontSize: '2.5rem'}}></i>
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">{user.fullName}</h3>
                      <p className="mb-0 text-muted">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        Loyal Member
                      </p>
                    </div>
                  </div>

                  {/* Edit/Save Buttons */}
                  {!isEditing ? (
                    <button onClick={handleEditToggle} className="btn btn-primary px-4 py-2 rounded-pill">
                      <i className="bi bi-pencil-square me-2"></i>
                      Edit Profile Information
                    </button>
                  ) : (
                    <div className="d-flex gap-2">
                      <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="btn btn-success px-4 py-2 rounded-pill"
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={handleEditToggle}
                        disabled={saving} 
                        className="btn btn-secondary px-4 py-2 rounded-pill"
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Information Grid */}
                <div className="row g-4">
                  {/* Left Column */}
                  <div className="col-lg-6">
                    {/* Email */}
                    <div className="mb-4">
                      <label className="text-muted small mb-2 d-block">
                        <i className="bi bi-envelope me-2"></i>Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                          className="form-control form-control-lg"
                        />
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-envelope-fill text-primary me-2"></i>
                          <strong className="fs-6">{user.email}</strong>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                      <label className="text-muted small mb-2 d-block">
                        <i className="bi bi-telephone me-2"></i>Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editFormData.phoneNumber || ''}
                          onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                          className="form-control form-control-lg"
                        />
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-telephone-fill text-primary me-2"></i>
                          <strong className="fs-6">{user.phoneNumber || 'Not provided'}</strong>
                        </div>
                      )}
                    </div>

                    {/* Full Name */}
                    <div className="mb-4">
                      <label className="text-muted small mb-2 d-block">
                        <i className="bi bi-person me-2"></i>Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.fullName || ''}
                          onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                          className="form-control form-control-lg"
                        />
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-fill text-primary me-2"></i>
                          <strong className="fs-6">{user.fullName}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-lg-6">
                    {/* Address */}
                    <div className="mb-4">
                      <label className="text-muted small mb-2 d-block">
                        <i className="bi bi-geo-alt me-2"></i>Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.address || ''}
                          onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                          className="form-control form-control-lg"
                        />
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                          <strong className="fs-6">{user.address || 'Not provided'}</strong>
                        </div>
                      )}
                    </div>

                    {/* NIC */}
                    <div className="mb-4">
                      <label className="text-muted small mb-2 d-block">
                        <i className="bi bi-card-text me-2"></i>NIC Number
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.nic || ''}
                          onChange={(e) => setEditFormData({...editFormData, nic: e.target.value})}
                          className="form-control form-control-lg"
                        />
                      ) : (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-card-text text-primary me-2"></i>
                          <strong className="fs-6">{user.nic || 'Not provided'}</strong>
                        </div>
                      )}
                    </div>

                    {/* Member Since */}
                    <div className="mb-4">
                      <label className="text-muted small mb-2 d-block">
                        <i className="bi bi-calendar-event me-2"></i>Member Since
                      </label>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-calendar-event-fill text-primary me-2"></i>
                        <strong className="fs-6">{getMemberSince()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status Section */}
                {!isEditing && (
                  <div className="mt-5 pt-4 border-top">
                    <div className="card border-0 bg-primary bg-opacity-10 rounded-4">
                      <div className="card-body p-4">
                        <h5 className="mb-4 fw-bold">
                          <i className="bi bi-info-circle me-2"></i>
                          Account Status
                        </h5>
                        <div className="row g-4 text-center">
                          <div className="col-6 col-md-3">
                            <div className="p-3">
                              <h3 className="text-primary mb-2">Active</h3>
                              <p className="text-muted small mb-0">Status</p>
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="p-3">
                              <h3 className="text-success mb-2">Verified</h3>
                              <p className="text-muted small mb-0">Account</p>
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="p-3">
                              <h3 className="text-primary mb-2">Customer</h3>
                              <p className="text-muted small mb-0">Role</p>
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="p-3">
                              <h3 className="mb-2">⭐</h3>
                              <p className="text-muted small mb-0">Loyal Member</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Back to Dashboard Button */}
                {!isEditing && (
                  <div className="text-center mt-4">
                    <a href="/customer/dashboard" className="btn btn-outline-primary px-5 py-2 rounded-pill">
                      <i className="bi bi-arrow-left me-2"></i>
                      Back to Dashboard
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;