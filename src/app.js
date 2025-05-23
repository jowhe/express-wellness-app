require('dotenv').config();

// Importing required modules
const cors = require('cors');
const express = require('express');
const app = express();

// Route Imports
const auth = require('./routes/auth');
const goals = require('./routes/goals');
const meals = require('./routes/meals');
const users = require('./routes/users');
const workouts = require('./routes/workouts');
const recommendations = require('./routes/recommendations');
const limiter = require('./middleware/limiter');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Routes Setup
app.use('/api/v1/auth', auth);
app.use('/api/v1/goals', goals);
app.use('/api/v1/meals', meals);
app.use('/api/v1/users', users);
app.use('/api/v1/workouts', workouts);
app.use('/api/v1/recommendations', recommendations);

// 404 Return
app.use((req, res) => {
  const response = new Response(404, false, '🔍 Error; Resource Not Found');
  response.send(res);
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server Running on http://localhost:${process.env.PORT}`);
});
