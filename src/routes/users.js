const users = require('express').Router();
const UserController = require('../controllers/UserController');
const { authenticateToken } = require('../middleware/authentication');
const userController = new UserController();

users.get('/', authenticateToken, (req, res) => userController.getUsers(req, res));
users.get('/:id', authenticateToken, (req, res) => userController.getUserById(req, res));
users.patch('/', authenticateToken, (req, res) => userController.updateUser(req, res));
users.delete('/', authenticateToken, (req, res) => userController.deleteUser(req, res));

module.exports = users;