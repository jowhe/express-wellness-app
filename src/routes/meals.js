const meals = require('express').Router();
const MealController = require('../controllers/MealController');
const { authenticateToken } = require('../middleware/authentication');
const mealController = new MealController();

meals.get('/', authenticateToken, (req, res) => mealController.getMeals(req, res));
meals.post('/', authenticateToken, (req, res) => mealController.createMeal(req, res));
meals.patch('/', authenticateToken, (req, res) => mealController.updateMeal(req, res));
meals.delete('/:meal', authenticateToken, (req, res) => mealController.deleteMeal(req, res));

// Admin routes.
meals.get('/:user', authenticateToken, (req, res) => mealController.getUserMeals(req, res))

module.exports = meals;