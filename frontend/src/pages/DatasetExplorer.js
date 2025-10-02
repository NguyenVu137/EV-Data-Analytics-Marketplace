import React, { useState, useEffect } from 'react';
import DatasetDetailModal from '../components/DatasetDetailModal';
import axios from 'axios';
import config from '../config';
import './DatasetExplorer.css';

const DatasetExplorer = () => {
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        dataCategory: '',
        region: '',
        vehicleType: '',
        batteryType: '',
        dataFormat: '',
        searchTerm: ''
    });

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Fetch categories when component mounts
    useEffect(() => {
        console.log('Component mounted');
        fetchCategories();
        searchDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // For debugging
    useEffect(() => {
        console.log('Current datasets:', datasets);
    }, [datasets]);

    const fetchCategories = async () => {
        try {
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories');
        }
    };

    const searchDatasets = async (page = 1) => {
        setLoading(true);
        try {
            console.log('Searching with filters:', filters);
            const validFilters = {};
            Object.keys(filters).forEach(key => {
                let value = filters[key];
                if (value && value !== '' && value !== 'Tất cả') {
                    validFilters[key] = value;
                }
            });

            const queryParams = new URLSearchParams({
                ...validFilters,
                page: page.toString(),
                limit: pagination.itemsPerPage.toString()
            });

            console.log('Request URL:', `${config.backendUrl}/api/datasets/search?${queryParams}`);
            const response = await axios.get(`${config.backendUrl}/api/datasets/search?${queryParams}`);

            setDatasets(response.data.data.datasets);
            setPagination({
                ...pagination,
                ...response.data.data.pagination
            });
            setError('');
        } catch (error) {
            console.error('Error searching datasets:', error);
            console.error('Error details:', error.response?.data || error.message);
            setError(error.response?.data?.error || error.message || 'Failed to load datasets');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchDatasets(1); // Reset to first page when searching
    };

    // Các giá trị mẫu cho dropdown
    const regionOptions = [
        '', 'Toàn quốc', 'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Tất cả'
    ];
    const vehicleTypeOptions = [
        '', 'VF e34', 'VF 8', 'VF 9', 'Tất cả'
    ];
    const batteryTypeOptions = [
        '', 'Lithium-ion', 'NMC', 'Tất cả'
    ];
    const dataFormatOptions = [
        '', 'raw', 'analyzed', 'dashboard', 'api', 'Tất cả'
    ];
    const processingLevelOptions = [
        '', 'Tất cả' // Không có trường này trong dữ liệu mẫu, để placeholder
    ];

    return (
        <div className="dataset-explorer">
            <h1>Tìm kiếm & Khám phá</h1>
            {/* Filters */}
            <form onSubmit={handleSearch} className="filters-form">
                <div className="filters-grid">
                    {/* Thời gian range đã loại bỏ để tránh lỗi backend */}
                    {/* Khu vực */}
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
                    {/* Loại xe */}
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
                    {/* Loại pin */}
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
                    {/* Định dạng */}
                    <div className="filter-item">
                        <label>Định dạng:</label>
                        <select
                            name="dataFormat"
                            value={filters.dataFormat}
                            onChange={handleFilterChange}
                        >
                            {dataFormatOptions.map(opt => (
                                <option key={opt} value={opt}>{opt || 'Tất cả'}</option>
                            ))}
                        </select>
                    </div>
                    {/* Mức xử lý */}
                    <div className="filter-item">
                        <label>Mức xử lý:</label>
                        <select
                            name="processingLevel"
                            value={filters.processingLevel || ''}
                            onChange={handleFilterChange}
                        >
                            {processingLevelOptions.map(opt => (
                                <option key={opt} value={opt}>{opt || 'Tất cả'}</option>
                            ))}
                        </select>
                    </div>
                    {/* Search term */}
                    <div className="filter-item">
                        <label>Tìm kiếm:</label>
                        <input
                            type="text"
                            name="searchTerm"
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            placeholder="Tìm kiếm datasets..."
                        />
                    </div>
                </div>
                <button type="submit" className="search-button">Tìm kiếm</button>
            </form>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Loading State */}
            {loading && <div className="loading">Loading...</div>}

            {/* Dataset Results */}
            {loading ? (
                <div className="loading">Loading...</div>
            ) : datasets.length === 0 ? (
                <div className="no-data-message">
                    <p>Không tìm thấy dữ liệu phù hợp với tiêu chí tìm kiếm</p>
                </div>
            ) : (
                <div className="datasets-grid">
                    {datasets.map(dataset => (
                        <div key={dataset.id} className="dataset-card">
                            <h3>{dataset.title}</h3>
                            <p className="description">{dataset.description}</p>
                            <div className="dataset-details">
                                <span className="category">
                                    {dataset.dataCategory?.replace('_', ' ').toUpperCase() || 'N/A'}
                                </span>
                                <span className="format">
                                    {dataset.dataFormat?.toUpperCase() || 'N/A'}
                                </span>
                                <span className="price">
                                    ${typeof dataset.price === 'number' ? dataset.price.toFixed(2) : '0.00'}
                                </span>
                            </div>
                            <div className="provider-info">
                                <span>Provider: {dataset.Provider?.name || 'Unknown'}</span>
                            </div>
                            <button className="view-details" onClick={() => setSelectedDatasetId(dataset.id)}>
                                Xem chi tiết
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="pagination">
                <button 
                    onClick={() => searchDatasets(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                >
                    Previous
                </button>
                <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button 
                    onClick={() => searchDatasets(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                >
                    Next
                </button>
            </div>
        {/* Modal xem chi tiết dataset */}
        {selectedDatasetId && (
            <DatasetDetailModal
                datasetId={selectedDatasetId}
                onClose={() => setSelectedDatasetId(null)}
            />
        )}
    </div>
    );
};

export default DatasetExplorer;