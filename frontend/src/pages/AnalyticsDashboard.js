import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import axios from 'axios';
import config from '../config';
import './AnalyticsDashboard.css';
import AIChatbox from '../components/AIChatbox';


const AnalyticsDashboard = () => {

  // State cho dữ liệu thực tế các biểu đồ
  const [socSohData, setSocSohData] = useState([]);
  const [distanceData, setDistanceData] = useState([]);
  const [co2Data, setCo2Data] = useState([]);
  const COLORS = ['#00C49F', '#FF8042'];
  const [loadingSoc, setLoadingSoc] = useState(false);
  const [errorSoc, setErrorSoc] = useState('');
  const [loadingDist, setLoadingDist] = useState(false);
  const [errorDist, setErrorDist] = useState('');
  const [loadingCo2, setLoadingCo2] = useState(false);
  const [errorCo2, setErrorCo2] = useState('');

  // State cho dữ liệu thực tế tần suất sạc
  const [chargeFreqData, setChargeFreqData] = useState([]);
  const [loadingCharge, setLoadingCharge] = useState(false);
  const [errorCharge, setErrorCharge] = useState('');

  useEffect(() => {
    // Tần suất sạc
    const fetchChargeFreq = async () => {
      setLoadingCharge(true);
      try {
        const res = await axios.get(`${config.backendUrl}/api/analytics/charging-frequency`);
        setChargeFreqData(res.data.data);
        setErrorCharge('');
      } catch (err) {
        setErrorCharge('Không thể tải dữ liệu tần suất sạc');
      } finally {
        setLoadingCharge(false);
      }
    };
    // SoC/SoH
    const fetchSocSoh = async () => {
      setLoadingSoc(true);
      try {
        const res = await axios.get(`${config.backendUrl}/api/analytics/soc-soh`);
        setSocSohData(res.data.data);
        setErrorSoc('');
      } catch (err) {
        setErrorSoc('Không thể tải dữ liệu SoC/SoH');
      } finally {
        setLoadingSoc(false);
      }
    };
    // Quãng đường
    const fetchDistance = async () => {
      setLoadingDist(true);
      try {
        const res = await axios.get(`${config.backendUrl}/api/analytics/distance`);
        setDistanceData(res.data.data);
        setErrorDist('');
      } catch (err) {
        setErrorDist('Không thể tải dữ liệu quãng đường');
      } finally {
        setLoadingDist(false);
      }
    };
    // CO2
    const fetchCo2 = async () => {
      setLoadingCo2(true);
      try {
        const res = await axios.get(`${config.backendUrl}/api/analytics/co2`);
        setCo2Data(res.data.data);
        setErrorCo2('');
      } catch (err) {
        setErrorCo2('Không thể tải dữ liệu CO₂');
      } finally {
        setLoadingCo2(false);
      }
    };
    fetchChargeFreq();
    fetchSocSoh();
    fetchDistance();
    fetchCo2();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>EV Analytics Dashboard</h2>
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>SoC/SoH</h3>
          {loadingSoc ? (
            <div>Đang tải...</div>
          ) : errorSoc ? (
            <div style={{color: 'red'}}>{errorSoc}</div>
          ) : (
            <LineChart width={220} height={160} data={socSohData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="SoC" stroke="#8884d8" />
              <Line type="monotone" dataKey="SoH" stroke="#82ca9d" />
            </LineChart>
          )}
        </div>
        <div className="chart-card">
          <h3>Tần suất sạc</h3>
          {loadingCharge ? (
            <div>Đang tải...</div>
          ) : errorCharge ? (
            <div style={{color: 'red'}}>{errorCharge}</div>
          ) : (
            <BarChart width={220} height={160} data={chargeFreqData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="charges" fill="#8884d8" />
            </BarChart>
          )}
        </div>
        <div className="chart-card">
          <h3>Quãng đường di chuyển</h3>
          {loadingDist ? (
            <div>Đang tải...</div>
          ) : errorDist ? (
            <div style={{color: 'red'}}>{errorDist}</div>
          ) : (
            <LineChart width={220} height={160} data={distanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="km" stroke="#00C49F" />
            </LineChart>
          )}
        </div>
        <div className="chart-card">
          <h3>Lượng CO₂ tiết kiệm</h3>
          {loadingCo2 ? (
            <div>Đang tải...</div>
          ) : errorCo2 ? (
            <div style={{color: 'red'}}>{errorCo2}</div>
          ) : (
            <PieChart width={220} height={160}>
              <Pie data={co2Data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {co2Data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </div>
      </div>
      <div className="dashboard-ai-suggestion">
        <h3>Gợi ý từ AI</h3>
        <AIChatbox />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
