import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminNavbar = ({ user, handleLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: "speedometer2", label: "Dashboard", to: "/admin/dashboard" },
    { icon: "car-front", label: "Manage Cars", to: "/admin/cars" },
    { icon: "calendar-check", label: "Manage Bookings", to: "/admin/bookings" },
    { icon: "cash-stack", label: "Payments", to: "/admin/payments" },
    { icon: "people", label: "Users", to: "/admin/users" },
    { icon: "bar-chart", label: "Reports", to: "/admin/reports" },
    { icon: "gear", label: "Settings", to: "/admin/settings" }
  ];

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'A';
  };

  return (
    <>
      {/* Modern Top Navbar */}
      <nav className="navbar modern-navbar">
        <div className="container-fluid">
          {/* Mobile Menu Button */}
          <button 
            className="btn btn-link d-lg-none mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          {/* Brand Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/admin/dashboard">
            <div className="logo-icon me-2">
              <i className="bi bi-shield-check"></i>
            </div>
            <span className="fw-bold">AutoRent Pro</span>
          </Link>

          {/* Search Bar */}
          <div className="d-none d-lg-flex flex-grow-1 mx-4">
            <div className="input-group" style={{ maxWidth: '400px' }}>
              <span className="input-group-text bg-transparent border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="search" 
                className="form-control border-start-0" 
                placeholder="Search bookings, cars, users..." 
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="d-flex align-items-center">
            {/* Notifications */}
            <div className="dropdown me-3">
              <button 
                className="btn btn-link text-dark position-relative p-0"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-bell fs-5"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </button>
              <div className="dropdown-menu dropdown-menu-end p-2" style={{ width: '320px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Notifications</h6>
                  <small className="text-primary">Mark all as read</small>
                </div>
                <div className="list-group list-group-flush">
                  <a href="#" className="list-group-item list-group-item-action border-0 py-2">
                    <div className="d-flex">
                      <div className="me-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded">
                          <i className="bi bi-calendar-check text-primary"></i>
                        </div>
                      </div>
                      <div>
                        <p className="mb-0 small">New booking request received</p>
                        <small className="text-muted">2 minutes ago</small>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* User Profile Dropdown */}
            <div className="dropdown">
              <button 
                className="btn btn-link text-dark d-flex align-items-center p-0"
                data-bs-toggle="dropdown"
              >
                <div className="user-avatar me-2">
                  {getInitials(user?.fullName)}
                </div>
                <div className="d-none d-lg-block text-start">
                  <div className="small fw-semibold">{user?.fullName || 'Admin'}</div>
                  <div className="small text-muted">Administrator</div>
                </div>
                <i className="bi bi-chevron-down ms-1"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3">
                <li>
                  <div className="px-3 py-2">
                    <div className="fw-semibold">{user?.fullName || 'Admin'}</div>
                    <div className="small text-muted">{user?.email}</div>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/admin/profile">
                    <i className="bi bi-person me-2"></i>My Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/admin/settings">
                    <i className="bi bi-gear me-2"></i>Settings
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="px-3 mb-4">
          <div className="d-flex align-items-center">
            <div className="logo-icon me-2">
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <div className="fw-bold">AutoRent Pro</div>
              <small className="text-muted">Admin Panel</small>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li 
              key={item.to} 
              className={`menu-item ${location.pathname === item.to ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Link className="menu-link" to={item.to}>
                <i className={`bi bi-${item.icon} menu-icon`}></i>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ms-auto badge bg-primary rounded-pill">{item.badge}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto px-3 pt-4 border-top">
          <div className="card border-0 bg-light">
            <div className="card-body p-3">
              <h6 className="card-title small fw-bold mb-2">Need Help?</h6>
              <p className="card-text small text-muted mb-3">
                Contact our support team for assistance
              </p>
              <button className="btn btn-modern btn-modern-primary w-100 btn-sm">
                <i className="bi bi-headset me-1"></i> Support Center
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
        />
      )}
    </>
  );
};

export default AdminNavbar;