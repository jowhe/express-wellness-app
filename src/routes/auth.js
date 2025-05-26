const auth = require('express').Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/authentication');
const authController = new AuthController();

auth.post('/register', authenticateToken, (req, res) => authController.register(req, res));
auth.post('/login', (req, res) => authController.login(req, res));
auth.get('/logout', authenticateToken, (req, res) => authController.logout(req, res));

module.exports = auth;