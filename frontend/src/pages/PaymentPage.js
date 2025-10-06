import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const dataset = location.state?.dataset;
  const [processing, setProcessing] = useState(false);

  if (!isLoggedIn) {
    return <div>Vui lòng đăng nhập để thanh toán.</div>;
  }
  if (!dataset) {
    return <div>Không có dataset để thanh toán.</div>;
  }

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await axios.post(`${config.backendUrl}/api/transactions`, { consumerId: user.id, datasetId: dataset.id });
      // Sau khi thanh toán thành công, chuyển tới lịch sử giao dịch
      navigate('/transactions');
    } catch (e) {
      alert('Thanh toán thất bại');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <h2>Thanh toán: {dataset.title}</h2>
      <p>Loại gói: {dataset.pricingType}</p>
      <p>Giá: {dataset.price ? `${dataset.price}₫` : 'Miễn phí'}</p>
      <p>Nội dung: {dataset.description}</p>
      <button onClick={handleConfirm} disabled={processing}>{processing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}</button>
    </div>
  );
};

export default PaymentPage;
