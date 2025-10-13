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
  // Filters
  const [range, setRange] = useState('30d'); // default 30 days
  const [regionFilter, setRegionFilter] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [regions, setRegions] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  function exportCsv(arr, filename) {
    if (!arr || arr.length === 0) {
      return;
    }
    const keys = Object.keys(arr[0]);
    const lines = [keys.join(',')].concat(arr.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    // load filter options
    const loadFilters = async () => {
      try {
        const r = await axios.get(`${config.backendUrl}/api/analytics/regions`);
        setRegions(r.data.data || []);
      } catch (e) { /* ignore */ }
      try {
        const v = await axios.get(`${config.backendUrl}/api/analytics/vehicle-types`);
        setVehicleTypes(v.data.data || []);
      } catch (e) { /* ignore */ }
    };
    loadFilters();
    // Tần suất sạc
    const fetchChargeFreq = async () => {
      setLoadingCharge(true);
      try {
        const params = { range };
        if (regionFilter) {
          params.region = regionFilter;
        }
        if (vehicleTypeFilter) {
          params.vehicleType = vehicleTypeFilter;
        }
        const res = await axios.get(`${config.backendUrl}/api/analytics/charging-frequency`, { params });
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
        const params = { range };
        if (regionFilter) {
          params.region = regionFilter;
        }
        if (vehicleTypeFilter) {
          params.vehicleType = vehicleTypeFilter;
        }
        const res = await axios.get(`${config.backendUrl}/api/analytics/soc-soh`, { params });
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
        const params = { range };
        if (regionFilter) {
          params.region = regionFilter;
        }
        if (vehicleTypeFilter) {
          params.vehicleType = vehicleTypeFilter;
        }
        const res = await axios.get(`${config.backendUrl}/api/analytics/distance`, { params });
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
        const params = { range };
        if (regionFilter) {
          params.region = regionFilter;
        }
        if (vehicleTypeFilter) {
          params.vehicleType = vehicleTypeFilter;
        }
        const res = await axios.get(`${config.backendUrl}/api/analytics/co2`, { params });
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
  }, [range, regionFilter, vehicleTypeFilter]);

  return (
    <div className="dashboard-container">
      <h2>EV Analytics Dashboard</h2>
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div>
          <label>Range: </label>
          <select value={range} onChange={e => setRange(e.target.value)}>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="6m">6 months</option>
          </select>
        </div>
        <div>
          <label>Region: </label>
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
            <option value="">All</option>
            {regions.map(r => (<option key={r} value={r}>{r}</option>))}
          </select>
        </div>
        <div>
          <label>Vehicle: </label>
          <select value={vehicleTypeFilter} onChange={e => setVehicleTypeFilter(e.target.value)}>
            <option value="">All</option>
            {vehicleTypes.map(v => (<option key={v} value={v}>{v}</option>))}
          </select>
        </div>
        <button onClick={() => {
          // export each dataset to CSV
          const toCsv = (arr, filename) => {
            if (!arr || arr.length === 0) return;
            const keys = Object.keys(arr[0]);
            const lines = [keys.join(',')].concat(arr.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(',')));
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // include filters in filename
            const fullName = filename.replace('.csv', `_${range}${regionFilter?`_${regionFilter}`:''}${vehicleTypeFilter?`_${vehicleTypeFilter}`:''}.csv`);
            a.download = fullName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          };
          toCsv(socSohData, 'soc_soh.csv');
          toCsv(chargeFreqData, 'charge_frequency.csv');
          toCsv(distanceData, 'distance.csv');
          toCsv(co2Data, 'co2.csv');
        }}>Export CSV</button>
        <button onClick={() => {
          // trigger re-fetch by updating range state to same value (forces effect)
          setRange(r => r);
        }}>Refresh</button>
      </div>
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>SoC/SoH</h3>
          <div style={{ marginBottom: 8 }}><button onClick={() => { exportCsv(socSohData, `soc_soh_${range}${regionFilter?`_${regionFilter}`:''}${vehicleTypeFilter?`_${vehicleTypeFilter}`:''}.csv`) }}>Export CSV</button></div>
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
          <div style={{ marginBottom: 8 }}><button onClick={() => { exportCsv(chargeFreqData, `charge_frequency_${range}${regionFilter?`_${regionFilter}`:''}${vehicleTypeFilter?`_${vehicleTypeFilter}`:''}.csv`) }}>Export CSV</button></div>
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
          <div style={{ marginBottom: 8 }}><button onClick={() => { exportCsv(distanceData, `distance_${range}${regionFilter?`_${regionFilter}`:''}${vehicleTypeFilter?`_${vehicleTypeFilter}`:''}.csv`) }}>Export CSV</button></div>
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
          <div style={{ marginBottom: 8 }}><button onClick={() => { exportCsv(co2Data, `co2_${range}${regionFilter?`_${regionFilter}`:''}${vehicleTypeFilter?`_${vehicleTypeFilter}`:''}.csv`) }}>Export CSV</button></div>
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
