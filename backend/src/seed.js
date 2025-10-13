// Ensure seed uses local SQLite for development if MySQL isn't reachable
process.env.DB_USE_SQLITE = process.env.DB_USE_SQLITE || 'true';
console.log('DB_USE_SQLITE=', process.env.DB_USE_SQLITE);
const sequelize = require('./config/database');
const User = require('./models/User');
const Dataset = require('./models/Dataset');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        // Ensure tables exist (especially when using SQLite local file)
        await sequelize.sync();

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
            // Hành vi lái xe
            {
                title: 'Dữ liệu Hành vi Lái xe EV Sedan 2023',
                description: 'Bộ dữ liệu chi tiết về hành vi lái xe của người dùng EV Sedan trong năm 2023, bao gồm thói quen tăng tốc, phanh, tiêu thụ năng lượng, vị trí GPS.',
                price: 299.99,
                dataCategory: 'driving_behavior',
                region: 'Hà Nội',
                vehicleType: 'EV Sedan',
                batteryType: 'Li-ion',
                dataFormat: 'raw',
                pricingType: 'per_download',
                fileUrl: 'https://example.com/ev-sedan-driving-2023.csv',
                timeRange: JSON.stringify({ start: '2023-01', end: '2023-12' }),
                usageRights: 'research_only',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id,
                createdAt: new Date('2023-07-15')
            },
            {
                title: 'Dữ liệu Hành vi Lái xe EV SUV 2023',
                description: 'Dữ liệu hành vi lái xe của EV SUV tại TP.HCM, gồm tốc độ, tăng tốc, phanh, vị trí.',
                price: 320.00,
                dataCategory: 'driving_behavior',
                region: 'TP.HCM',
                vehicleType: 'EV SUV',
                batteryType: 'LFP',
                dataFormat: 'raw',
                pricingType: 'per_download',
                fileUrl: 'https://example.com/ev-suv-driving-2023.csv',
                timeRange: JSON.stringify({ start: '2023-01', end: '2023-12' }),
                usageRights: 'research_only',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id,
                createdAt: new Date('2024-01-10')
            },
            // Hiệu suất pin
            {
                title: 'Phân tích Hiệu suất Pin EV SUV 2023',
                description: 'Dữ liệu phân tích về hiệu suất và độ bền pin của EV SUV, gồm SoH, SoC, chu kỳ sạc, nhiệt độ pin.',
                price: 499.99,
                dataCategory: 'battery_performance',
                region: 'TP.HCM',
                vehicleType: 'EV SUV',
                batteryType: 'LFP',
                dataFormat: 'analyzed',
                pricingType: 'subscription',
                fileUrl: 'https://example.com/ev-suv-battery-2023.parquet',
                timeRange: JSON.stringify({ start: '2023-06', end: '2023-12' }),
                usageRights: 'commercial',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id,
                createdAt: new Date('2024-04-01')
            },
            {
                title: 'Hiệu suất Pin EV Truck miền Bắc',
                description: 'SoC, SoH, nhiệt độ, dòng xả của pin EV Truck tại miền Bắc.',
                price: 450.00,
                dataCategory: 'battery_performance',
                region: 'Hà Nội',
                vehicleType: 'EV Truck',
                batteryType: 'Li-ion',
                dataFormat: 'analyzed',
                pricingType: 'subscription',
                fileUrl: 'https://example.com/ev-truck-battery-north.parquet',
                timeRange: JSON.stringify({ start: '2023-01', end: '2023-12' }),
                usageRights: 'commercial',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id,
                createdAt: new Date('2024-07-01')
            },
            // Sử dụng trạm sạc
            {
                title: 'Dữ liệu Trạm sạc VinFast 2023',
                description: 'Thống kê chi tiết về việc sử dụng trạm sạc, gồm thời gian sạc, công suất, lưu lượng người dùng.',
                price: 399.99,
                dataCategory: 'charging_station',
                region: 'Toàn quốc',
                vehicleType: 'EV Truck',
                batteryType: 'Li-ion',
                dataFormat: 'dashboard',
                pricingType: 'api_access',
                fileUrl: 'https://example.com/vinfast-charging-2023.json',
                timeRange: JSON.stringify({ start: '2023-01', end: '2023-12' }),
                usageRights: 'commercial',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id,
                createdAt: new Date('2025-01-01')
            },
            {
                title: 'Sử dụng trạm sạc EV Sedan Đà Nẵng',
                description: 'Dữ liệu sử dụng trạm sạc của EV Sedan tại Đà Nẵng, gồm thời gian, công suất, vị trí.',
                price: 410.00,
                dataCategory: 'charging_station',
                region: 'Đà Nẵng',
                vehicleType: 'EV Sedan',
                batteryType: 'LFP',
                dataFormat: 'dashboard',
                pricingType: 'api_access',
                fileUrl: 'https://example.com/ev-sedan-charging-danang.json',
                timeRange: JSON.stringify({ start: '2023-03', end: '2023-12' }),
                usageRights: 'commercial',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id,
                createdAt: new Date('2025-03-15')
            },
            // Giao dịch V2G
            {
                title: 'Dữ liệu Giao dịch V2G EV Sedan',
                description: 'Dữ liệu về các giao dịch Vehicle-to-Grid của EV Sedan, gồm thời gian, công suất, giá trị trao đổi điện năng.',
                price: 599.99,
                dataCategory: 'v2g_transaction',
                region: 'Đà Nẵng',
                vehicleType: 'EV Sedan',
                batteryType: 'LFP',
                dataFormat: 'raw',
                pricingType: 'per_download',
                fileUrl: 'https://example.com/v2g-ev-sedan.csv',
                timeRange: JSON.stringify({ start: '2023-09', end: '2023-12' }),
                usageRights: 'research_only',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id,
                createdAt: new Date('2025-09-01')
            },
            {
                title: 'Giao dịch V2G EV SUV toàn quốc',
                description: 'Giao dịch V2G của EV SUV trên toàn quốc, gồm thời gian, công suất, giá trị.',
                price: 620.00,
                dataCategory: 'v2g_transaction',
                region: 'Toàn quốc',
                vehicleType: 'EV SUV',
                batteryType: 'LFP',
                dataFormat: 'raw',
                pricingType: 'per_download',
                fileUrl: 'https://example.com/v2g-ev-suv.csv',
                timeRange: JSON.stringify({ start: '2023-01', end: '2023-12' }),
                usageRights: 'commercial',
                isAnonymized: true,
                status: 'approved',
                providerId: provider.id,
                createdAt: new Date('2025-10-01')
            }
        ];


        // Thêm dataset mẫu cho phép tải file sample_dataset.csv
        sampleDatasets.push({
            title: 'Sample EV Dataset',
            description: 'Sample dataset for download testing',
            price: 0,
            dataCategory: 'driving_behavior',
            region: 'Toàn quốc',
            vehicleType: 'EV',
            batteryType: 'Li-ion',
            dataFormat: 'csv',
            pricingType: 'per_download',
            fileUrl: 'backend/provider_files/sample_dataset.csv',
            timeRange: JSON.stringify({ start: '2023-01', end: '2023-12' }),
            usageRights: 'research_only',
            isAnonymized: true,
            status: 'approved',
            providerId: provider.id,
            createdAt: new Date('2025-10-05')
        });

        await Dataset.bulkCreate(sampleDatasets);

        console.log('✅ Seeded database successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();