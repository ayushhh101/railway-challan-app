const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET 

exports.register = async (req, res) => {
  try {
    if (!req.body.name || !req.body.employeeId || !req.body.password || !req.body.role || !req.body.zone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { name, employeeId, password, role, zone } = req.body;

    //Checking if user already exists
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

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        zone: user.zone
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};