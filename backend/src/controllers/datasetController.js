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

        if (dataCategory && dataCategory !== '' && dataCategory !== 'Tất cả') {
            whereConditions.dataCategory = dataCategory;
        }
        if (region && region !== '' && region !== 'Tất cả') {
            whereConditions.region = region.trim();
        }
        if (vehicleType && vehicleType !== '' && vehicleType !== 'Tất cả') {
            whereConditions.vehicleType = vehicleType.trim();
        }
        if (batteryType && batteryType !== '' && batteryType !== 'Tất cả') {
            whereConditions.batteryType = batteryType.trim();
        }
        if (dataFormat && dataFormat !== '' && dataFormat !== 'Tất cả') {
            whereConditions.dataFormat = dataFormat.trim();
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