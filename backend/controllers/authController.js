const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logAudit = require('../utils/auditLogger')

const JWT_SECRET = process.env.JWT_SECRET

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
};


exports.register = async (req, res) => {
  try {
    if (!req.body.name || !req.body.employeeId || !req.body.password || !req.body.role || !req.body.zone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { name, employeeId, password, role, zone } = req.body;

    // checks if user already exists
    const existingUser = await User.findOne({ employeeId });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      employeeId,
      password: hashedPassword,
      role,
      zone
    });

    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    const user = await User.findOne({ employeeId });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // updates last login time
    user.lastLogin = new Date();
    await user.save();

    // generates JWT token with user ID and role
    // this data gets "decoded" in the middleware
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        zone: user.zone
      }
    });

    await logAudit({
      action: 'LOGGED_IN',
      performedBy: user._id,
      role: user.role,
      metadata: {
        employeeId: user.employeeId,
      },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      severity: 'low' 
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);
    const newAccessToken = jwt.sign({ id: payload.id, role: payload.role }, JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
