import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import { useAuth } from "../contexts/AuthContext";

const AccountSettings = () => {
  const { user, token, logout } = useAuth();
  const [form, setForm] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.put(`${config.backendUrl}/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Cập nhật thông tin thành công!");
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tài khoản?")) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${config.backendUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Xóa tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-settings">
      <h2>Cài đặt tài khoản</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Tên:</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label>Email:</label>
          <input name="email" value={form.email} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading}>Cập nhật</button>
      </form>
      <button style={{marginTop:16, color:'red'}} onClick={handleDelete} disabled={loading}>Xóa tài khoản</button>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AccountSettings;
