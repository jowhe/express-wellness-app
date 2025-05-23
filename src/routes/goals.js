const goals = require('express').Router();
const GoalController = require('../controllers/GoalController');
const { authenticateToken } = require('../middleware/authentication');
const goalController = new GoalController();

goals.get('/', authenticateToken, (req, res) => goalController.getGoals(req, res));
goals.post('/', authenticateToken, (req, res) => goalController.createGoal(req, res));
goals.patch('/', authenticateToken, (req, res) => goalController.updateGoal(req, res));
goals.delete('/:goal', authenticateToken, (req, res) => goalController.deleteGoal(req, res));

// Admin routes.
goals.get('/:user', authenticateToken, (req, res) => goalController.getUserGoals(req, res));

module.exports = goals;