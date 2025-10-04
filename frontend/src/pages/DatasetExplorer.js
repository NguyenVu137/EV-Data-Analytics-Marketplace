
import React, { useState, useEffect } from 'react';
import './DatasetExplorer.css';

import DatasetDetailModal from '../components/DatasetDetailModal';
import axios from 'axios';
import config from '../config';

// Chuẩn hóa giá trị filter để khớp với seed.js/backend
const regionOptions = ['', 'Hà Nội', 'TP.HCM', 'Toàn quốc', 'Đà Nẵng', 'Tất cả'];
const vehicleTypeOptions = ['', 'EV Sedan', 'EV SUV', 'EV Truck', 'Tất cả'];
const batteryTypeOptions = ['', 'Li-ion', 'LFP', 'Tất cả'];
const dataFormatOptions = ['', 'CSV', 'Parquet', 'Timeseries', 'Tất cả'];
const timeSortOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' }
];

const DatasetExplorer = () => {
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        dataCategory: '',
        region: '',
        vehicleType: '',
        batteryType: '',
        dataFormat: '',
        searchTerm: '',
        sortBy: 'newest',
        dateFrom: '',
        dateTo: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    // Removed unused purchase and categories state

    useEffect(() => {
        searchDatasets();
        // eslint-disable-next-line
    }, []);

    // Fetch datasets with filters and pagination
    const searchDatasets = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const params = {
                ...filters,
                page,
                limit: pagination.itemsPerPage
            };
            const res = await axios.get(`${config.backendUrl}/api/datasets/search`, { params });
            if (res.data.status === 'success') {
                setDatasets(res.data.data.datasets);
                setPagination(res.data.data.pagination);
            } else {
                setDatasets([]);
                setPagination({ ...pagination, totalItems: 0, totalPages: 1 });
                setError('Không tìm thấy dữ liệu phù hợp.');
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu.');
            setDatasets([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            // Nếu thay đổi sortBy thì tìm kiếm ngay
            if (name === 'sortBy') {
                setTimeout(() => searchDatasets(1), 0);
            }
            return newFilters;
        });
    };

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        searchDatasets(1);
    };

    // Pagination controls
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
        searchDatasets(newPage);
    };

    // Quick filter for recent days
    const quickDateFilter = (days) => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - days + 1);
        setFilters(prev => {
            const newFilters = {
                ...prev,
                dateFrom: from.toISOString().slice(0, 10),
                dateTo: today.toISOString().slice(0, 10)
            };
            // Trigger search immediately after setting filters
            setTimeout(() => searchDatasets(1), 0);
            return newFilters;
        });
    };

    // Dataset detail modal
    const handleOpenDetail = (id) => {
        setSelectedDatasetId(id);
    };
    const handleCloseDetail = () => {
        setSelectedDatasetId(null);
    };

    return (
        <div className="dataset-explorer">
            <h1>Tìm kiếm & Khám phá</h1>
            {/* Filters */}
            <form onSubmit={handleSearch} className="filters-form">
                <div className="filters-grid">
                    <div className="filter-item">
                        <label>Từ khóa tìm kiếm:</label>
                        <input
                            type="text"
                            name="searchTerm"
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            placeholder="Nhập từ khóa..."
                        />
                    </div>
                    <div className="filter-item">
                        <label>Danh mục dữ liệu:</label>
                        <select
                            name="dataCategory"
                            value={filters.dataCategory}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả</option>
                            <option value="driving_behavior">Hành vi lái xe</option>
                            <option value="battery_performance">Hiệu suất pin</option>
                            <option value="charging_station">Trạm sạc</option>
                            <option value="v2g_transaction">Giao dịch V2G</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Khu vực:</label>
                        <select
                            name="region"
                            value={filters.region}
                            onChange={handleFilterChange}
                        >
                            {regionOptions.map(opt => (
                                <option key={opt} value={opt}>{opt || 'Tất cả'}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Loại xe:</label>
                        <select
                            name="vehicleType"
                            value={filters.vehicleType}
                            onChange={handleFilterChange}
                        >
                            {vehicleTypeOptions.map(opt => (
                                <option key={opt} value={opt}>{opt || 'Tất cả'}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Loại pin:</label>
                        <select
                            name="batteryType"
                            value={filters.batteryType}
                            onChange={handleFilterChange}
                        >
                            {batteryTypeOptions.map(opt => (
                                <option key={opt} value={opt}>{opt || 'Tất cả'}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Định dạng dữ liệu:</label>
                        <select
                            name="dataFormat"
                            value={filters.dataFormat}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả</option>
                            <option value="raw">Dữ liệu thô (raw)</option>
                            <option value="analyzed">Đã phân tích</option>
                            <option value="dashboard">Dashboard/Báo cáo</option>
                            <option value="api">API</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>Từ ngày:</label>
                        <input
                            type="date"
                            name="dateFrom"
                            value={filters.dateFrom}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-item">
                        <label>Đến ngày:</label>
                        <input
                            type="date"
                            name="dateTo"
                            value={filters.dateTo}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-item">
                        <label>Lọc nhanh:</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={() => quickDateFilter(7)}>7 ngày gần đây</button>
                            <button type="button" onClick={() => quickDateFilter(30)}>30 ngày gần đây</button>
                            <button type="button" onClick={() => quickDateFilter(365)}>1 năm gần đây</button>
                        </div>
                    </div>
                    <div className="filter-item">
                        <label>Sắp xếp:</label>
                        <select
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                        >
                            {timeSortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-item" style={{ alignSelf: 'end', marginTop: 8, display: 'flex', gap: 8 }}>
                        <button type="submit" className="search-btn">Tìm kiếm</button>
                        <button type="button" className="clear-btn" onClick={() => {
                            setFilters({
                                dataCategory: '',
                                region: '',
                                vehicleType: '',
                                batteryType: '',
                                dataFormat: '',
                                searchTerm: '',
                                sortBy: 'newest',
                                dateFrom: '',
                                dateTo: ''
                            });
                            setTimeout(() => searchDatasets(1), 0);
                        }}>Xóa bộ lọc</button>
                    </div>
                </div>
            </form>

            {/* Dataset list and pagination */}
            <>
                <div className="datasets-grid">
                    {datasets.map(ds => (
                        <div className="dataset-card" key={ds.id}>
                            <h3>{ds.title}</h3>
                            <div className="description">{ds.description}</div>
                            <div className="dataset-details">
                                <span className="category">{ds.dataCategory}</span>
                                <span className="format">{ds.dataFormat}</span>
                                <span className="price">{ds.price ? `${ds.price}₫` : 'Miễn phí'}</span>
                            </div>
                            <div className="provider-info">
                                <b>Provider:</b> {ds.Provider?.name || 'N/A'}<br />
                                <b>Khu vực:</b> {ds.region} <b>Loại xe:</b> {ds.vehicleType}
                            </div>
                            <button className="view-details" onClick={() => handleOpenDetail(ds.id)}>Xem chi tiết</button>
                        </div>
                    ))}
                </div>
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="pagination">
                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>Trước</button>
                        <span>Trang {pagination.currentPage} / {pagination.totalPages}</span>
                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>Sau</button>
                    </div>
                )}
            </>

            {/* Dataset Detail Modal */}
            {selectedDatasetId && (
                <DatasetDetailModal datasetId={selectedDatasetId} onClose={handleCloseDetail} />
            )}
        </div>
    );
};

export default DatasetExplorer;