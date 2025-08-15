const Passenger = require('../models/passengerModel'); // Your passenger mongoose model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logAudit = require('../utils/auditLogger');

const generateAccessToken = (passenger) => {
  return jwt.sign({ id: passenger._id, role: 'passenger' }, process.env.PASSENGER_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (passenger) => {
  return jwt.sign({ id: passenger._id, role: 'passenger' }, process.env.PASSENGER_REFRESH_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, aadharLast4, mobileNumber, password } = req.body;

    if (!name || !aadharLast4 || !mobileNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (aadharLast4.length !== 4) {
      return res.status(400).json({ message: 'Aadhar must be last 4 digits only' });
    }

    const existingPassenger = await Passenger.findOne({ mobileNumber });
    if (existingPassenger) return res.status(400).json({ message: 'Passenger already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPassenger = new Passenger({
      name,
      aadharLast4,
      mobileNumber,
      passwordHash: hashedPassword,
    });

    await newPassenger.save();

    res.status(201).json({ message: 'Registration successful' });

    await logAudit({
      action: 'PASSENGER_REGISTER',
      performedBy: newPassenger._id,
      role: 'passenger',
      metadata: { mobileNumber },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'low',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required' });
    }

    const passenger = await Passenger.findOne({ mobileNumber });
    if (!passenger) { return res.status(400).json({ message: 'Passenger not found' }); }

    if (!passenger.passwordHash) {
      return res.status(400).json({ message: 'Passenger must complete onboarding before login' });
    }

    const isMatch = await bcrypt.compare(password, passenger.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Passenger must complete onboarding before login' });

    const accessToken = generateAccessToken(passenger);
    const refreshToken = generateRefreshToken(passenger);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // Use HTTPS
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    try {
      await logAudit({
        action: 'PASSENGER_LOGIN',
        performedBy: passenger._id,
        role: 'passenger',
        metadata: { mobileNumber },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'SUCCESS',
        severity: 'low',
      });
    } catch (err) {
      console.warn("Audit logging failed:", err);
    }

    return res.status(200).json({
      message: 'Login successful',
      token: accessToken,
      user: {
        id: passenger._id,
        name: passenger.name,
        mobileNumber: passenger.mobileNumber,
        role: 'passenger',
      },
    });


  } catch (err) {
    console.error("Passenger login error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const payload = jwt.verify(token, PASSENGER_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.resetPassword = async (req, res) => {
  const { mobileNumber, newPassword } = req.body;
  if (!mobileNumber || !newPassword) return res.status(400).json({ message: 'mobileNumber and newPassword required' });

  try {
    const passenger = await Passenger.findOne({ mobileNumber });
    if (!passenger) return res.status(404).json({ message: 'Passenger not found' });
    const hash = await bcrypt.hash(newPassword, 10);
    passenger.passwordHash = hash;
    await passenger.save();

    res.json({ message: 'Password reset successfully by staff.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};
