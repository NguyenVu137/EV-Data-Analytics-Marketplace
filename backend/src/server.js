const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require('bcryptjs');
const sequelize = require("./config/database");

const app = express();

// CORS middleware - đặt trước tất cả các middleware khác
// Allow CORS from frontend dev servers running on localhost (any port)
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (curl, server-side) with no origin
    if (!origin) return callback(null, true);
    const allowedFrontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || origin === allowedFrontend) {
        return callback(null, true);
      }
    } catch (e) {
      // ignore
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

// Đảm bảo nhận đúng JSON body trước khi khai báo route AI
app.use(express.json());

// Log tất cả các requests
app.use((req, res, next) => {
  // Enable verbose request logging only when DEBUG=true
  if (process.env.DEBUG && process.env.DEBUG.toLowerCase() === 'true') {
    console.log(`${req.method} ${req.path}`, req.body);
  }
  next();
});

// Health check for quick liveness probe
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Import routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);
const seedRoutes = require('./routes/seedRoutes');
app.use('/api/seed', seedRoutes);

// Test DB connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected...");
  })
  .catch((err) => {
    console.error("❌ Error: " + err);
  });
const User = require("./models/User");

sequelize.sync()  // tạo bảng nếu chưa có (avoid alter on sqlite to prevent FK drop errors)
  .then(() => {
    console.log("✅ All models were synchronized successfully.");
  })
  .catch(err => console.error("❌ Sync error:", err));

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const datasetRoutes = require("./routes/datasetRoutes");
app.use("/api/datasets", datasetRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

// Subscription routes
const subscriptionRoutes = require('./routes/subscriptionRoutes');
app.use('/api/subscriptions', subscriptionRoutes);

// Stripe routes (scaffolded, will return 501 if keys missing)
const stripeRoutes = require('./routes/stripeRoutes');
app.use('/api/stripe', stripeRoutes);

// Thêm route analytics cho dashboard
const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);

const apiAccessRoutes = require('./routes/apiAccessRoutes');
app.use('/api', apiAccessRoutes);

// External routes for third-party integrations (API key auth)
const externalRoutes = require('./routes/externalRoutes');
app.use('/external', externalRoutes);

// Swagger UI for API documentation
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./swaggerConfig');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (e) {
  console.warn('Swagger UI not available:', e.message);
}

// Dev helper routes (only enabled in non-production)
if (process.env.NODE_ENV !== 'production') {
  const devRoutes = require('./routes/devRoutes');
  app.use('/api/dev', devRoutes);
}

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  // start a simple periodic job to process subscription renewals (every hour)
  const subCtrl = require('./controllers/subscriptionController');
  const intervalMs = (process.env.SUBSCRIPTION_RUN_INTERVAL_MINUTES ? parseInt(process.env.SUBSCRIPTION_RUN_INTERVAL_MINUTES) : 60) * 60 * 1000;
  setInterval(async () => {
    try {
      const processed = await subCtrl.processDueRenewals();
      if (processed > 0) {
        console.log(`Processed ${processed} subscription renewals`);
      }
    } catch (e) {
      console.error('Periodic renewal job failed', e);
    }
  }, intervalMs);
});
