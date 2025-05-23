const workouts = require('express').Router();
const WorkoutController = require('../controllers/WorkoutController');
const { authenticateToken } = require('../middleware/authentication');
const workoutController = new WorkoutController();

workouts.get('/', authenticateToken, (req, res) => workoutController.getWorkouts(req, res));
workouts.post('/', authenticateToken, (req, res) => workoutController.createWorkout(req, res));
workouts.patch('/:workout', authenticateToken, (req, res) => workoutController.updateWorkout(req, res));
workouts.delete('/', authenticateToken, (req, res) => workoutController.deleteWorkout(req, res));

// Admin routes
workouts.get('/:user', authenticateToken, (req, res) => workoutController.getUserWorkouts(req, res));

module.exports = workouts;