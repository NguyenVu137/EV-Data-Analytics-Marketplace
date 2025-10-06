import React from 'react';

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <h2>Dashboard người dùng</h2>
      <ul>
        <li><a href="/subscription">Quản lý thuê bao</a></li>
        <li><a href="/api-access">API Access</a></li>
        <li><a href="/invoices">Hóa đơn</a></li>
        <li><a href="/transaction-history">Lịch sử giao dịch</a></li>
      </ul>
      <div style={{marginTop: 24}}>
        <b>Quota còn lại:</b> 40 download, 900 API calls<br />
        <b>Gói hiện tại:</b> Starter (còn 20 ngày)
      </div>
    </div>
  );
};

export default UserDashboard;
