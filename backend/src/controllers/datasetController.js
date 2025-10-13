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
        if (process.env.DEBUG && process.env.DEBUG.toLowerCase() === 'true') {
            console.log('Received search request with query:', req.query);
        }
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
            limit = 10,
            lat,
            lng,
            radiusKm
        } = req.query;

        // Xây dựng query conditions
        const whereConditions = {
            status: 'approved', // Chỉ lấy các dataset đã được duyệt
        };

        // Helper ép về mảng nếu là string
        function toArray(val) {
            if (Array.isArray(val)) {
                return val;
            }
            if (typeof val === 'string') {
                if (val.includes(',')) {
                    return val.split(',').map(s => s.trim()).filter(Boolean);
                }
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

        // Phân trang (parse int)
        const pageNum = parseInt(page) || 1;
        const perPage = parseInt(limit) || 10;
        const offset = (pageNum - 1) * perPage;

        // Xác định thứ tự sắp xếp
        // Support additional sort options: price_asc, price_desc, newest, oldest
        let order = [['createdAt', 'DESC']];
        if (sortBy === 'oldest') {
            order = [['createdAt', 'ASC']];
        } else if (sortBy === 'newest') {
            order = [['createdAt', 'DESC']];
        } else if (sortBy === 'price_asc') {
            order = [['price', 'ASC']];
        } else if (sortBy === 'price_desc') {
            order = [['price', 'DESC']];
        }

        // If location filter provided, do approximate filter using lat/lng bounding box
        if (lat && lng && radiusKm) {
            const r = parseFloat(radiusKm) || 5; // km
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);
            // Approx bounding box (very small inaccuracies) ~ 111 km per degree latitude
            const latDelta = r / 111;
            const lngDelta = Math.abs(r / (111 * Math.cos((latNum * Math.PI) / 180)));
            whereConditions.locationLat = { [Op.between]: [latNum - latDelta, latNum + latDelta] };
            whereConditions.locationLng = { [Op.between]: [lngNum - lngDelta, lngNum + lngDelta] };
        }

        const datasets = await Dataset.findAndCountAll({
            where: whereConditions,
            include: [{
                model: User,
                attributes: ['name', 'email'],
                as: 'Provider'
            }],
            limit: perPage,
            offset,
            order
        });

        // Tính toán thông tin phân trang
        const totalPages = Math.ceil(datasets.count / perPage);

        res.json({
            status: 'success',
            data: {
                datasets: datasets.rows,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: datasets.count,
                    itemsPerPage: perPage
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
        if (process.env.DEBUG && process.env.DEBUG.toLowerCase() === 'true') {
            console.log('getDatasetDetails called with id=', id);
        }

        // Include Provider if exists, but don't require Provider to be present
        const dataset = await Dataset.findOne({
            where: {
                id,
                status: 'approved'
            },
            include: [{
                model: User,
                as: 'Provider',
                attributes: ['name', 'email']
            }]
        });

    if (process.env.DEBUG && process.env.DEBUG.toLowerCase() === 'true') {
        console.log('found dataset=', !!dataset, dataset && dataset.id);
    }
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