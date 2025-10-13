import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './Login.css';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    role: "consumer"
  });
  const [loading, setLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState(false);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);

  // Generate a safe username from email local-part
  const generateUsernameFromEmail = (email) => {
    const local = (email || '').split('@')[0] || '';
    let gen = local.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    gen = gen.replace(/^-+|-+$/g, '');
    gen = gen.replace(/-+/g, '-');
    if (gen.length < 2) {
      gen = gen + Math.floor(10 + Math.random() * 90).toString();
    }
    return gen;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    const updated = { ...formData, [name]: newValue };

    // If user types email and username is empty or was previously generated, auto-fill username
    if (name === 'email') {
      if (!formData.username || formData._generatedUsername) {
        updated.username = generateUsernameFromEmail(newValue);
        updated._generatedUsername = true;
      }
    }

    // If user edits username manually, mark it as user-provided
    if (name === 'username') {
      updated._generatedUsername = false;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (googleStep) {
        // Chỉ gửi username và credential Google lên backend
        if (!formData.username) {
          setError('Vui lòng nhập username');
          setLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(formData.username)) {
          setError('Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.');
          setLoading(false);
          return;
        }
        await axios.post(`${config.backendUrl}/auth/google/username`, {
          username: formData.username,
          credential: formData.credential
        });
        navigate('/login');
      } else {
        // Đăng ký thường
        if (!formData.email || !formData.password || !formData.username) {
          setError('Vui lòng điền đầy đủ thông tin');
          setLoading(false);
          return;
        }
        if (!(formData.password.length >= 15 || (formData.password.length >= 8 && /[0-9]/.test(formData.password) && /[a-z]/.test(formData.password)))) {
          setError('Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter');
          setLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(formData.username)) {
          setError('Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.');
          setLoading(false);
          return;
        }
        // backend expects `name`, so map username -> name
        const payload = { ...formData, name: formData.username };
        const response = await axios.post(`${config.backendUrl}/auth/register`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 5000,
        });
        console.log('Register successful:', response.data);
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed: ' + err.message);
      console.error('Register error:', err.response?.data || err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  // Xử lý đăng ký bằng Google
  const handleGoogleSuccess = async (credentialResponse) => {
    // Lưu credential, chuyển sang bước nhập username
    setFormData((prev) => ({ ...prev, credential: credentialResponse.credential }));
    setGoogleStep(true);
    setError("");
  };

  const handleGoogleError = () => {
    setError('Đăng ký bằng Google thất bại.');
  };

  return (
    <div className="login-container">
      {!googleStep ? (
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign up for EV Data Marketplace</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
              placeholder="Email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password"
              id="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              minLength="8"
              placeholder="Password"
            />
            <small>Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.</small>
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="2"
              pattern="^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$"
              placeholder="Username"
            />
            <small>Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.</small>
          </div>
          <button type="submit" disabled={loading}>Create account</button>
          <div style={{ textAlign: 'center', margin: '16px 0' }}>Hoặc</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {!showGoogleLogin ? (
              <button type="button" className="btn btn-google" onClick={() => setShowGoogleLogin(true)}>Đăng ký bằng Google</button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="100%"
                locale="vi"
                text="signup_with"
              />
            )}
          </div>
          <p className="form-footer">
            Already have an account? <a href="/login">Sign in →</a>
          </p>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Choose your username</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="2"
              pattern="^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$"
              placeholder="Username"
            />
            <small>Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.</small>
          </div>
          <button type="submit" disabled={loading}>Create account</button>
        </form>
      )}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Register;
