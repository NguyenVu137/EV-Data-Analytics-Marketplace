import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const APIAccessPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [quota, setQuota] = useState(0);
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKey = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vui lòng đăng nhập để xem API key.');
          setLoading(false);
          return;
        }
        const res = await axios.get(`${config.backendUrl}/api/key`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.data) {
          setApiKey(res.data.data.key);
          setQuota(res.data.data.quota || 0);
          setUsed(res.data.data.used || 0);
        }
      } catch (e) {
        setError('Không thể lấy API key từ server.');
      } finally {
        setLoading(false);
      }
    };
    fetchKey();
  }, []);

  const handleRenew = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return setError('Vui lòng đăng nhập');
      const res = await axios.post(`${config.backendUrl}/api/key/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.data) {
        setQuota(res.data.data.quota || quota);
        setUsed(res.data.data.used || used);
      }
    } catch (e) {
      setError('Gia hạn quota thất bại');
    }
  };

  return (
    <div className="api-access-page">
      <h2>API Access</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div><b>API Key:</b> <code>{apiKey || '---'}</code></div>
          <div><b>Quota:</b> {used} / {quota} requests</div>
          <h3>SDK Snippet</h3>
          <pre>{`curl -H "x-api-key: ${apiKey}" ${config.backendUrl}/external/datasets/9/metadata`}</pre>
          <button onClick={handleRenew}>Gia hạn quota</button>
        </>
      )}
    </div>
  );
};

export default APIAccessPage;
