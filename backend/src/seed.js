const User = require('./models/User');
const Dataset = require('./models/Dataset');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        // Xóa dữ liệu cũ
        await Dataset.destroy({ where: {} });
        await User.destroy({ where: {} });

        console.log('✅ Cleaned old data');
        // Tạo provider mẫu
        const providerPassword = await bcrypt.hash('123456', 10);
        const provider = await User.create({
            name: 'VinFast Data Provider',
            email: 'provider@vinfast.com',
            password: providerPassword,
            role: 'provider'
        });

        // Tạo consumer mẫu
        const consumerPassword = await bcrypt.hash('123456', 10);
        await User.create({
            name: 'EV Research Lab',
            email: 'researcher@evlab.com',
            password: consumerPassword,
            role: 'consumer'
        });

        // Tạo datasets mẫu
        const sampleDatasets = [
            {
                title: 'Dữ liệu Hành vi Lái xe EV Sedan 2023',
                description: 'Bộ dữ liệu chi tiết về hành vi lái xe của người dùng EV Sedan trong năm 2023, bao gồm thói quen tăng tốc, phanh, và tiêu thụ năng lượng.',
                price: 299.99,
                dataCategory: 'driving_behavior',
                region: 'Hà Nội',
                vehicleType: 'EV Sedan',
                batteryType: 'Li-ion',
                dataFormat: 'CSV',
                timeRange: JSON.stringify({
                    start: '2023-01',
                    end: '2023-12'
                }),
                usageRights: 'research_only',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id
            },
            {
                title: 'Phân tích Hiệu suất Pin EV SUV 2023',
                description: 'Dữ liệu phân tích về hiệu suất và độ bền pin của EV SUV, bao gồm các chỉ số SoH, chu kỳ sạc và nhiệt độ pin.',
                price: 499.99,
                dataCategory: 'battery_performance',
                region: 'TP.HCM',
                vehicleType: 'EV SUV',
                batteryType: 'LFP',
                dataFormat: 'Parquet',
                timeRange: JSON.stringify({
                    start: '2023-06',
                    end: '2023-12'
                }),
                usageRights: 'commercial',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id
            },
            {
                title: 'Dữ liệu Trạm sạc VinFast 2023',
                description: 'Thống kê chi tiết về việc sử dụng trạm sạc, bao gồm thời gian sạc, công suất, và lưu lượng người dùng.',
                price: 399.99,
                dataCategory: 'charging_station',
                region: 'Toàn quốc',
                vehicleType: 'EV Truck',
                batteryType: 'Li-ion',
                dataFormat: 'Timeseries',
                timeRange: JSON.stringify({
                    start: '2023-01',
                    end: '2023-12'
                }),
                usageRights: 'commercial',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id
            },
            {
                title: 'Dữ liệu Giao dịch V2G EV Sedan',
                description: 'Dữ liệu về các giao dịch Vehicle-to-Grid của EV Sedan, bao gồm thời gian, công suất và giá trị trao đổi điện năng.',
                price: 599.99,
                dataCategory: 'v2g_transaction',
                region: 'Đà Nẵng',
                vehicleType: 'EV Sedan',
                batteryType: 'LFP',
                dataFormat: 'CSV',
                timeRange: JSON.stringify({
                    start: '2023-09',
                    end: '2023-12'
                }),
                usageRights: 'research_only',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id
            }
        ];

        await Dataset.bulkCreate(sampleDatasets);

        console.log('✅ Seeded database successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();