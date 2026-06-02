const express = require('express');
const { login } = require('../controllers/authController');
const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.path);
  console.log('Request Body:', req.body);
  next();
});

// Login route
router.post('/login', (req, res, next) => {
  console.log('Login attempt received:', req.body);
  login(req, res, next);
});

module.exports = router; 