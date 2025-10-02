import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import './DatasetDetailModal.css';

const DatasetDetailModal = ({ datasetId, onClose }) => {
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sampleRows, setSampleRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [socData, setSocData] = useState([]);

  useEffect(() => {
    if (datasetId) fetchDetails();
    // eslint-disable-next-line
  }, [datasetId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${config.backendUrl}/api/datasets/${datasetId}`);
      setDataset(res.data.data);
      // Giả lập sample CSV và schema nếu chưa có API thực tế
      if (res.data.data && res.data.data.fileUrl) {
        // TODO: fetch sample CSV from backend if available
        // Dưới đây là dữ liệu mẫu giả lập
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
              <div><b>Region:</b> {dataset.region}</div>
              <div><b>Vehicle Type:</b> {dataset.vehicleType}</div>
              <div><b>Battery Type:</b> {dataset.batteryType}</div>
              <div><b>Data Format:</b> {dataset.dataFormat}</div>
              <div><b>Time Range:</b> {dataset.timeRange?.start} - {dataset.timeRange?.end}</div>
              <div><b>Anonymization:</b> {dataset.isAnonymized ? 'Đã ẩn danh' : 'Không ẩn danh'}</div>
            </div>
            <h3>Schema (Cột dữ liệu)</h3>
            <table className="schema-table">
              <thead>
                <tr>
                  {columns.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {columns.map(col => <td key={col}><i>Kiểu dữ liệu</i></td>)}
                </tr>
              </tbody>
            </table>
            <h3>Sample CSV (10 dòng)</h3>
            <table className="sample-table">
              <thead>
                <tr>
                  {columns.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell, i) => <td key={i}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>Chart Preview (SoC Distribution)</h3>
            <div className="chart-preview">
              {/* Simple bar chart using divs */}
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
};

export default DatasetDetailModal;
