require('dotenv').config();
const jwt = require('jsonwebtoken');
const {sendResponse} = require('../utils/functions');

// Authenticate JWT token.
async function authenticateToken(req, res, next){

  // Retreive the token from the request header.
  const authHeader = req.headers['authorization'];

  // Split the token from Bearer.
  const token = authHeader && authHeader.split(' ')[1];
  if(!token){
      sendResponse(req, res, 401, false, '⛔ Error; Authentication Token Required!');
  }

  // Verify the token, if it is valid, then proceed to the next middleware.
  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
      if(error){
        console.error('⛔ Error; Token verification error; ', error.message);
        return sendResponse(req, res, 403, false, '⛔ Error; Invalid or expired token!');
      }

      req.user = user;
      req.token = token;
      next();
  })  
}

// Sign JWT token.
async function signToken(user){
  try{
    // Token payload.
    const token = jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN});

    // Return token.
    return token;
  }catch(error){
    return error;
  }
}

module.exports = {
    authenticateToken,
    signToken,
}