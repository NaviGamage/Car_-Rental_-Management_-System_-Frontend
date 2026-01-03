
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer mt-auto bg-dark text-white pt-5 pb-4">
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-lg-4 mb-4">
            <div className="footer-brand mb-3">
              <h3 className="fw-bold text-primary">
                <i className="bi bi-building me-2"></i>
                DriveEase
              </h3>
            </div>
            <p className="text-light opacity-75 mb-4">
              Providing exceptional services and solutions to our valued customers since 2025. 
              We are committed to excellence and customer satisfaction.
            </p>
            <div className="social-icons d-flex gap-3">
              <a href="#" className="text-white text-decoration-none">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-white text-decoration-none">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" className="text-white text-decoration-none">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
              <a href="#" className="text-white text-decoration-none">
                <i className="bi bi-instagram fs-5"></i>
              </a>
            </div>
          </div>

             {/* Quick Links*/}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="fw-bold mb-4 text-primary">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/customer/dashboard" className="text-white text-decoration-none opacity-75 hover-opacity-100 d-flex align-items-center">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/customer/cars" className="text-white text-decoration-none opacity-75 hover-opacity-100 d-flex align-items-center">
                  <i className="bi bi-car-front me-2"></i>
                  Browse Cars
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/customer/bookings" className="text-white text-decoration-none opacity-75 hover-opacity-100 d-flex align-items-center">
                  <i className="bi bi-calendar-check me-2"></i>
                  My Bookings
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/customer/profile" className="text-white text-decoration-none opacity-75 hover-opacity-100 d-flex align-items-center">
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="fw-bold mb-4 text-primary">Our Services</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  <i className="bi bi-check-circle me-2"></i>
                  Legal Consultation
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  <i className="bi bi-check-circle me-2"></i>
                  Document Processing
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  <i className="bi bi-check-circle me-2"></i>
                  Account Management
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  <i className="bi bi-check-circle me-2"></i>
                  24/7 Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="fw-bold mb-4 text-primary">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-geo-alt text-primary me-3 mt-1"></i>
                <span className="opacity-75">
                  123 Business Street,<br />
                  Matara 01000,<br />
                  Sri Lanka
                </span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="bi bi-telephone text-primary me-3"></i>
                <span className="opacity-75">+94 41 22 8419</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="bi bi-envelope text-primary me-3"></i>
                <span className="opacity-75">info@driveease.com</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="bi bi-clock text-primary me-3"></i>
                <span className="opacity-75">Mon - Fri: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 opacity-25" />

        {/* Bottom Bar */}
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0 opacity-75">
              © {new Date().getFullYear()} DriveEase. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  Privacy Policy
                </a>
              </li>
              <li className="list-inline-item mx-3">|</li>
              <li className="list-inline-item">
                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  Terms of Service
                </a>
              </li>
              <li className="list-inline-item mx-3">|</li>
              <li className="list-inline-item">
                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;