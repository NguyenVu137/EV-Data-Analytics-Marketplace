import React, { useState } from "react";
import axios from "axios";
import config from "../config";
import { useNavigate } from "react-router-dom";

const VerifyResetCode = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.post(`${config.backendUrl}/auth/verify-reset-code`, { email, code, newPassword });
      setMessage("Đổi mật khẩu thành công. Bạn có thể đăng nhập.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Xác thực mã và đổi mật khẩu</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mã xác thực:</label>
          <input value={code} onChange={e => setCode(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mật khẩu mới:</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
        </div>
        <button type="submit" disabled={loading}>Đổi mật khẩu</button>
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

export default VerifyResetCode;
