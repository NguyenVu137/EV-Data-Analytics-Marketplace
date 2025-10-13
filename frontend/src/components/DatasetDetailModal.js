import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import './DatasetDetailModal.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DatasetDetailModal = ({ datasetId, onClose }) => {
  const { user, isLoggedIn } = useAuth();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sampleRows, setSampleRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [socData, setSocData] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !datasetId) { return; }
    axios.get(`${config.backendUrl}/api/transactions/consumer/${user.id}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setHasPurchased(res.data.some(tr => tr.datasetId === datasetId && tr.status === 'completed'));
        }
      });
  }, [user, datasetId]);

  useEffect(() => {
    if (datasetId) { fetchDetails(); }
    // eslint-disable-next-line
  }, [datasetId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${config.backendUrl}/api/datasets/${datasetId}`);
      setDataset(res.data.data);
      // Giả lập sample CSV và schema nếu chưa có API thực tế
      if (res.data.data && res.data.data.fileUrl) {
        setColumns(['timestamp', 'vehicle_id', 'SoC', 'location', 'speed']);
        setSampleRows([
          ['2023-01-01 08:00', 'EV001', 80, 'Hà Nội', 45],
          ['2023-01-01 08:05', 'EV001', 78, 'Hà Nội', 43],
          ['2023-01-01 08:10', 'EV001', 76, 'Hà Nội', 40],
          ['2023-01-01 08:15', 'EV001', 74, 'Hà Nội', 38],
          ['2023-01-01 08:20', 'EV001', 72, 'Hà Nội', 35],
          ['2023-01-01 08:25', 'EV001', 70, 'Hà Nội', 33],
          ['2023-01-01 08:30', 'EV001', 68, 'Hà Nội', 30],
          ['2023-01-01 08:35', 'EV001', 66, 'Hà Nội', 28],
          ['2023-01-01 08:40', 'EV001', 64, 'Hà Nội', 25],
          ['2023-01-01 08:45', 'EV001', 62, 'Hà Nội', 23],
        ]);
        setSocData([
          { soc: 80, count: 1 },
          { soc: 78, count: 1 },
          { soc: 76, count: 1 },
          { soc: 74, count: 1 },
          { soc: 72, count: 1 },
          { soc: 70, count: 1 },
          { soc: 68, count: 1 },
          { soc: 66, count: 1 },
          { soc: 64, count: 1 },
          { soc: 62, count: 1 },
        ]);
      }
      setError('');
    } catch (err) {
      setError('Không thể tải chi tiết dataset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : dataset ? (
          <>
            <h2>{dataset.title}</h2>
            <p>{dataset.description}</p>
            <div className="meta">
              <div><b>Provider:</b> {dataset.Provider?.name}</div>
              <div><b>Khu vực:</b> {dataset.region}</div>
              <div><b>Loại xe:</b> {dataset.vehicleType}</div>
              <div><b>Loại pin:</b> {dataset.batteryType}</div>
              <div><b>Định dạng dữ liệu:</b> {dataset.dataFormat}</div>
              {dataset.locationLat && dataset.locationLng && (
                <div><b>Vị trí (lat,lng):</b> {dataset.locationLat.toFixed(5)}, {dataset.locationLng.toFixed(5)}</div>
              )}
              <div><b>Loại dữ liệu:</b> {dataset.type === 'processed' ? 'Processed' : 'Raw'}</div>
              <div><b>Ngày đăng tải:</b> {dataset.createdAt ? new Date(dataset.createdAt).toLocaleDateString() : ''}</div>
              <div><b>Kích thước:</b> {dataset.sizeBytes ? `${(dataset.sizeBytes/1024/1024).toFixed(1)} MB` : ''}</div>
              <div><b>Số bản ghi:</b> {dataset.numRecords || ''}</div>
              <div><b>Anonymization:</b> {dataset.isAnonymized ? 'Đã ẩn danh' : 'Không ẩn danh'}</div>
              <div><b>License:</b> {dataset.license || 'N/A'}</div>
              <div><b>Update frequency:</b> {dataset.updateFrequency || 'N/A'}</div>
            </div>
            <div className="pricing-table-modal">
              <h4>Bảng giá</h4>
              <table>
                <thead><tr><th>Loại</th><th>Giá</th></tr></thead>
                <tbody>
                  {dataset.pricingRaw && <tr><td>Raw</td><td>{dataset.pricingRaw}₫</td></tr>}
                  {dataset.pricingProcessed && <tr><td>Processed</td><td>{dataset.pricingProcessed}₫</td></tr>}
                  {dataset.pricingSubscription && <tr><td>Subscription</td><td>{dataset.pricingSubscription}₫/tháng</td></tr>}
                  {dataset.pricingAPI && <tr><td>API</td><td>{dataset.pricingAPI}₫/1000 requests</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{margin: '16px 0'}}>
              {!isLoggedIn && (
                <div style={{color: 'red'}}>Vui lòng đăng nhập để mua/thuê/đăng ký gói dữ liệu.</div>
              )}
              {isLoggedIn && hasPurchased && (
                <div style={{color: 'green', fontWeight: 'bold'}}>Bạn đã mua/thuê gói dữ liệu này.</div>
              )}
              {isLoggedIn && !hasPurchased && dataset.pricingType === 'per_download' && (
                <button className="buy-btn" onClick={() => {
                  navigate('/payment', { state: { dataset } });
                }}>Mua/Lượt tải</button>
              )}
              {isLoggedIn && !hasPurchased && dataset.pricingType === 'subscription' && (
                <button className="subscribe-btn" onClick={() => {
                  navigate('/payment', { state: { dataset } });
                }}>Thuê bao</button>
              )}
              {isLoggedIn && !hasPurchased && dataset.pricingType === 'api_access' && (
                <button className="api-btn" onClick={() => {
                  navigate('/payment', { state: { dataset } });
                }}>Đăng ký API</button>
              )}
            </div>
            <h3>Data Dictionary (Schema)</h3>
            <table className="schema-table">
              <thead>
                <tr>
                  <th>Tên trường</th>
                  <th>Kiểu</th>
                  <th>Mô tả</th>
                  <th>Đơn vị</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(dataset.dataFields) && dataset.dataFields.length > 0 ? dataset.dataFields.map((f, idx) => (
                  <tr key={idx}>
                    <td>{f.name}</td>
                    <td>{f.type}</td>
                    <td>{f.description}</td>
                    <td>{f.unit}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4}><i>Chưa có schema mẫu</i></td></tr>
                )}
              </tbody>
            </table>
            <h3>Sample Preview</h3>
            <table className="sample-table">
              <thead>
                <tr>
                  {Array.isArray(dataset.samplePreview) && dataset.samplePreview.length > 0
                    ? Object.keys(dataset.samplePreview[0]).map(col => <th key={col}>{col}</th>)
                    : columns.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(dataset.samplePreview) && dataset.samplePreview.length > 0
                  ? dataset.samplePreview.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((cell, i) => <td key={i}>{cell}</td>)}
                      </tr>
                    ))
                  : sampleRows.map((row, idx) => (
                      <tr key={idx}>
                        {row.map((cell, i) => <td key={i}>{cell}</td>)}
                      </tr>
                    ))}
              </tbody>
            </table>
            {isLoggedIn && hasPurchased && (
              <div style={{marginTop: 16}}>
                <button className="download-btn" onClick={async () => {
                  try {
                    const res = await fetch(`${config.backendUrl}/api/datasets/download/${dataset.id}`, {
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (!res.ok) { throw new Error('Download failed'); }
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = dataset.title ? dataset.title + '.csv' : 'dataset.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (e) {
                    alert('Không thể tải file. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
                  }
                }}>Tải xuống</button>
              </div>
            )}
            <h3>Chart Preview (SoC Distribution)</h3>
            <div className="chart-preview">
              <div className="soc-bar-chart">
                {socData.map((d, i) => (
                  <div key={i} className="bar" style={{height: `${d.count * 20}px`}}>
                    <span>{d.soc}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default DatasetDetailModal;

