const APIKey = require('../models/APIKey');
const { v4: uuidv4 } = require('uuid');
const Dataset = require('../models/Dataset');
const path = require('path');
const fs = require('fs');

// Lấy hoặc tạo API key cho user
exports.getOrCreateKey = async (req, res) => {
  try {
    const userId = req.user.id;
    let apiKey = await APIKey.findOne({ where: { userId, status: 'active' } });
    if (!apiKey) {
      apiKey = await APIKey.create({ userId, key: uuidv4(), quota: 1000, used: 0, status: 'active' });
    }
    res.json({ status: 'success', data: apiKey });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Gia hạn/quản lý quota API key
exports.renewKey = async (req, res) => {
  try {
    const userId = req.user.id;
    let apiKey = await APIKey.findOne({ where: { userId, status: 'active' } });
    if (!apiKey) return res.status(404).json({ status: 'error', message: 'No active API key' });
    apiKey.quota += 1000; // ví dụ: cộng thêm quota
    await apiKey.save();
    res.json({ status: 'success', data: apiKey });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// API cho phép bên thứ ba truy cập dữ liệu EV theo datasetId
exports.getEVDataById = async (req, res) => {
    try {
        const { datasetId } = req.params;
        const dataset = await Dataset.findByPk(datasetId);
        if (!dataset || !dataset.fileUrl) {
            return res.status(404).json({ status: 'error', message: 'Dataset or file not found' });
        }
        // Đọc file dữ liệu (giả sử fileUrl là đường dẫn tương đối từ gốc project)
        const filePath = path.isAbsolute(dataset.fileUrl)
            ? dataset.fileUrl
            : path.join(__dirname, '../../', dataset.fileUrl);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ status: 'error', message: 'File not found on server' });
        }
        // Trả về file dưới dạng attachment hoặc trả về nội dung (tùy nhu cầu)
        // Ở đây trả về nội dung file CSV (có thể mở rộng trả về JSON tuỳ loại dataset)
        const fileContent = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
        return res.send(fileContent);
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'API access failed', error: err.message });
    }
};
