import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import config from '../config';
import { AuthContext } from '../contexts/AuthContext';

const TransactionHistory = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios.get(`${config.backendUrl}/api/transactions/consumer/${user.id}`)
      .then(res => {
        setTransactions(res.data);
        setError('');
      })
      .catch(() => setError('Không thể tải lịch sử giao dịch'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div>Vui lòng đăng nhập để xem lịch sử giao dịch.</div>;
  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="transaction-history">
      <h2>Lịch sử giao dịch</h2>
      <table>
        <thead>
          <tr>
            <th>Dataset</th>
            <th>Loại gói</th>
            <th>Số tiền</th>
            <th>Trạng thái</th>
            <th>Ngày giao dịch</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tr => (
            <tr key={tr.id}>
              <td>{tr.Dataset?.title}</td>
              <td>{tr.Dataset?.pricingType}</td>
              <td>{tr.amount}₫</td>
              <td>{tr.status === 'completed' ? 'Đã thanh toán' : 'Chờ xử lý'}</td>
              <td>{new Date(tr.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
