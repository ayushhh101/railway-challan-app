const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const PASSENGER_ACCESS_SECRET = process.env.PASSENGER_ACCESS_SECRET

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]  || req.cookies['accessToken'];;

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    //attach user info to request object
    req.user = decoded;
    next();
  });
};

exports.verifyPassengerToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, PASSENGER_ACCESS_SECRET);
    if (decoded.role !== 'passenger') {
      return res.status(403).json({ message: 'Access denied: invalid role' });
    }
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

exports.isTTE = (req, res, next) => {
  if (req.user.role !== 'tte') {
    return res.status(403).json({ message: 'Access denied. TTEs only.' });
  }
  next();
};

exports.isAdminOrTTE = (req, res, next) => {
  if (req.user.role === 'tte' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admins/TTEs only' });
};
