const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    //attach user info to request object
    req.user = decoded;
    next();
  });
};

exports.isTTE = (req, res, next) => {
  if (req.user.role !== 'tte') {
    return res.status(403).json({ message: 'Access denied. TTEs only.' });
  }
  next();
};