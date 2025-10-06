const path = require('path');
// Download dataset file (sau khi đã kiểm tra entitlement)
exports.downloadDataset = async (req, res) => {
    try {
        const { datasetId } = req.params;
        const dataset = await Dataset.findByPk(datasetId);
        if (!dataset || !dataset.fileUrl) {
            return res.status(404).json({ status: 'error', message: 'Dataset or file not found' });
        }
        // Đường dẫn tuyệt đối tới file (giả sử fileUrl là đường dẫn tương đối từ thư mục gốc dự án)
        const filePath = path.isAbsolute(dataset.fileUrl)
            ? dataset.fileUrl
            : path.join(__dirname, '../../', dataset.fileUrl);
        // Tăng download count
        dataset.downloadCount = (dataset.downloadCount || 0) + 1;
        await dataset.save();
        return res.download(filePath, path.basename(filePath));
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Download failed', error: err.message });
    }
};
const { Op } = require('sequelize');
const Dataset = require('../models/Dataset');
const User = require('../models/User');

exports.searchDatasets = async (req, res) => {
    try {
        console.log('Received search request with query:', req.query);
        const {
            dataCategory,
            region,
            vehicleType,
            batteryType,
            dataFormat,
            searchTerm,
            dateFrom,
            dateTo,
            sortBy = 'newest',
            page = 1,
            limit = 10
        } = req.query;

        // Xây dựng query conditions
        const whereConditions = {
            status: 'approved', // Chỉ lấy các dataset đã được duyệt
        };

        // Multi-select filter hỗ trợ mảng hoặc chuỗi
        const { Op } = require('sequelize');
        // Helper ép về mảng nếu là string
        function toArray(val) {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
                if (val.includes(',')) return val.split(',').map(s => s.trim()).filter(Boolean);
                return [val];
            }
            return [];
        }
        if (dataCategory && dataCategory !== '' && dataCategory !== 'Tất cả') {
            const arr = toArray(dataCategory);
            if (arr.length > 0) {
                whereConditions.dataCategory = { [Op.in]: arr };
            }
        }
        if (region && region !== '' && region !== 'Tất cả') {
            const arr = toArray(region);
            if (arr.length > 0) {
                whereConditions.region = { [Op.in]: arr };
            }
        }
        if (vehicleType && vehicleType !== '' && vehicleType !== 'Tất cả') {
            const arr = toArray(vehicleType);
            if (arr.length > 0) {
                whereConditions.vehicleType = { [Op.in]: arr };
            }
        }
        if (batteryType && batteryType !== '' && batteryType !== 'Tất cả') {
            const arr = toArray(batteryType);
            if (arr.length > 0) {
                whereConditions.batteryType = { [Op.in]: arr };
            }
        }
        if (dataFormat && dataFormat !== '' && dataFormat !== 'Tất cả') {
            const arr = toArray(dataFormat);
            if (arr.length > 0) {
                whereConditions.dataFormat = { [Op.in]: arr };
            }
        }
        if (searchTerm && searchTerm !== '') {
            whereConditions[Op.or] = [
                { title: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } }
            ];
        }
        // Lọc theo ngày đăng tải (createdAt)
        if (dateFrom && dateFrom !== '') {
            whereConditions.createdAt = { ...(whereConditions.createdAt || {}), [Op.gte]: new Date(dateFrom) };
        }
        if (dateTo && dateTo !== '') {
            whereConditions.createdAt = { ...(whereConditions.createdAt || {}), [Op.lte]: new Date(dateTo + 'T23:59:59.999Z') };
        }

        // Phân trang
        const offset = (page - 1) * limit;

        // Xác định thứ tự sắp xếp
        let order = [['createdAt', 'DESC']];
        if (sortBy === 'oldest') {
            order = [['createdAt', 'ASC']];
        } else if (sortBy === 'newest') {
            order = [['createdAt', 'DESC']];
        }

        // Thực hiện tìm kiếm
        const datasets = await Dataset.findAndCountAll({
            where: whereConditions,
            include: [{
                model: User,
                attributes: ['name', 'email'],
                as: 'Provider'
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order
        });

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(datasets.count / limit);

        res.json({
            status: 'success',
            data: {
                datasets: datasets.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: datasets.count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error in searchDatasets:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while searching datasets'
        });
    }
};

exports.getDatasetDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const dataset = await Dataset.findOne({
            where: {
                id,
                status: 'approved'
            },
            include: [{
                model: User,
                as: 'Provider',
                attributes: ['name', 'email'],
                where: {
                    role: 'provider'
                }
            }]
        });

        if (!dataset) {
            return res.status(404).json({
                status: 'error',
                message: 'Dataset not found'
            });
        }

        res.json({
            status: 'success',
            data: dataset
        });

    } catch (error) {
        console.error('Error in getDatasetDetails:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching dataset details'
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        // Trả về danh sách các danh mục cố định
        const categories = [
            'driving_behavior',
            'battery_performance',
            'charging_station',
            'v2g_transaction'
        ];

        res.json({
            status: 'success',
            data: categories
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching categories'
        });
    }
};