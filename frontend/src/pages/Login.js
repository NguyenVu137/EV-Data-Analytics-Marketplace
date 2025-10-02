import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import config from '../config';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post(`${config.backendUrl}/auth/login`, {
        email,
        password,
      });
      
      // Lưu token và cập nhật trạng thái đăng nhập
      authLogin(response.data.token);
      console.log('Login successful:', response.data);
      
      // Chuyển hướng đến trang Dashboard sau khi đăng nhập thành công
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      console.error('Login failed:', error.response?.data || error.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Login</button>
        <p className="form-footer">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
