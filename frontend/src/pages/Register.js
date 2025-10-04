import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './Login.css';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "consumer" // Auto set role là consumer
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Vui lòng điền đầy đủ thông tin');
        setLoading(false);
        return;
      }
      const response = await axios.post(`${config.backendUrl}/auth/register`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000,
      });
      console.log('Register successful:', response.data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed: ' + err.message);
      console.error('Register error:', err.response?.data || err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500); // Delay 0.5s before stopping loading
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input 
            type="text" 
            id="name"
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            minLength="2"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email"
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            type="password"
            id="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            minLength="6"
          />
        </div>
        <button type="submit" disabled={loading}>Register</button>
        <p className="form-footer">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Register;
