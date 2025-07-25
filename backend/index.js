const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
require('dotenv').config();

const app = express();

// middleware
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:4173'],
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser()); 

// establishes connection to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/challan', require('./routes/challanRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/pdf', require('./routes/pdfRoutes'));
app.use('/api/proofs', require('./routes/proofRoutes'));
app.use('/api/tte', require('./routes/tteRoutes.js'));

// starts the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
