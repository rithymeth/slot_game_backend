// middleware/auth.js

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;
