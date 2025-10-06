import React, { useState } from "react";
import axios from "axios";
import config from "../config";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.post(`${config.backendUrl}/auth/request-password-reset`, { email });
      setMessage("Mã xác thực đã được gửi về email. Vui lòng kiểm tra email và nhập mã xác thực để đổi mật khẩu.");
      setTimeout(() => window.location.href = `/verify-reset-code?email=${encodeURIComponent(email)}`, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Quên mật khẩu</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>Gửi yêu cầu</button>
        <p className="form-footer">
          <a href="/login">Quay lại đăng nhập</a>
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

export default ForgotPassword;
