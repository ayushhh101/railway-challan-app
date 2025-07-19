const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;

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

exports.isTTE = (req, res, next) => {
  if (req.user.role !== 'tte') {
    return res.status(403).json({ message: 'Access denied. TTEs only.' });
  }
  next();
};