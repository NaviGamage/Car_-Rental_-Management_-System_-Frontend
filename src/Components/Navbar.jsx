import { Link } from "react-router-dom";

const CustomerNavbar = ({ user, handleLogout }) => {
  const menuItems = [
    { icon: "speedometer2", label: "Dashboard", to: "/customer/dashboard" },
    { icon: "car-front", label: "Browse Cars", to: "/customer/cars" },
    { icon: "calendar-check", label: "My Bookings", to: "/customer/bookings" },
    { icon: "person", label: "Profile", to: "/customer/profile" }
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/customer/dashboard">
          <div className="logo-icon me-2 animate-float">
            <i className="bi bi-car-front-fill fs-4"></i>
          </div>
          <span className="fw-bold">Auto Haven</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <Link
                  className="nav-link hover-scale"
                  to={item.to}
                >
                  <i className={`bi bi-${item.icon} me-2`}></i>
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="nav-item ms-2">
              <button
                className="btn btn-outline-light btn-rounded px-4 hover-scale"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
