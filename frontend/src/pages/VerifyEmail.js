import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const VerifyEmail = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy token từ query string
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      setError("");
      setMessage("");
      try {
        if (!token) {
          setError("Thiếu token xác thực.");
          setLoading(false);
          return;
        }
        await axios.post(`${config.backendUrl}/auth/verify-email`, { token });
        setMessage("Xác thực email thành công! Bạn có thể đăng nhập.");
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn.");
      } finally {
        setLoading(false);
      }
    };
    verify();
    // eslint-disable-next-line
  }, [token]);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Xác thực email</h2>
        {loading && <div className="loading-spinner"></div>}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <p className="form-footer">
          <a href="/login">Quay lại đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
