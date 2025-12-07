const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger/index.yaml');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { initRedis } = require('./config/redisClient.js');

const app = express();
app.use(helmet());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: {
//     error: 'Too many requests from this IP, please try again after 15 minutes.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many login attempts, please try again after 15 minutes.'
  }
});

app.use(mongoSanitize({
  replaceWith: '_',
  allowDots: false
}));

// app.use(limiter);

// middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://railwaychallan.com']
    : ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

//swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// db connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes.js'));
app.use('/api/challan', require('./routes/challanRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/pdf', require('./routes/pdfRoutes'));
app.use('/api/proofs', require('./routes/proofRoutes'));
app.use('/api/tte', require('./routes/tteRoutes.js'));
app.use('/api/passenger', require('./routes/passengerRoutes.js'));
app.use('/api/redis', require('./routes/redisRoutes.js'));

// starts the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
   await initRedis();
  console.log(`Server started on port ${PORT}`);
  console.log(`API Documentation available at https://ayushhh101.github.io/railway-challan-api-docs/`);
});
