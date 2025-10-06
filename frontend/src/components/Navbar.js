import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import "./Navbar.css";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  let userEmail = null;
  if (isLoggedIn) {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        userEmail = decoded.email || decoded.name || decoded.sub;
      }
    } catch (e) {}
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">EV Data Marketplace</Link>
      <div className="navbar-links">
        {isLoggedIn ? (
          <>
            {userEmail && <span className="navbar-user">{userEmail}</span>}
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/transactions" className="nav-link">Giao dịch</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
            <button onClick={handleLogout} className="nav-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/login" className="nav-link">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
