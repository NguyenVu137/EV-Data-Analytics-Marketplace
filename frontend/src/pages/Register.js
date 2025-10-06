import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './Login.css';
import { GoogleLogin, googleLogout } from '@react-oauth/google';

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

  // Xử lý đăng ký bằng Google
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      // Gửi credential lên backend để xác thực/tạo tài khoản
      const response = await axios.post(`${config.backendUrl}/auth/google`, {
        credential: credentialResponse.credential,
        mode: 'register'
      });
      // Nếu backend trả về token, chuyển hướng sang dashboard hoặc login
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 409) {
        setError('Tài khoản Google này đã được đăng ký. Vui lòng đăng nhập.');
      } else {
        setError(err.response?.data?.message || 'Google signup failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng ký bằng Google thất bại.');
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
        <div style={{ textAlign: 'center', margin: '16px 0' }}>Hoặc</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="100%"
            locale="vi"
            text="signup_with"
          />
        </div>
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
