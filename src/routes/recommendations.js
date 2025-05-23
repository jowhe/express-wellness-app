const recommendations = require('express').Router();
const RecommendationController = require('../controllers/ReccomendationsController');
const { authenticateToken } = require('../middleware/authentication');
const recommendationController = new RecommendationController();

recommendations.get('/', authenticateToken, (req, res) => recommendationController.getRecommendations(req, res));
recommendations.post('/', authenticateToken, (req, res) => recommendationController.createRecommendation(req, res));
recommendations.patch('/', authenticateToken, (req, res) => recommendationController.updateRecommendation(req, res));
recommendations.delete('/:rec', authenticateToken, (req, res) => recommendationController.deleteRecommendation(req, res));

recommendations.get('/:user', authenticateToken, (req, res) => recommendationController.getUserRecommendations(req, res));
module.exports = recommendations;