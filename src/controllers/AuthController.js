const { signToken } = require('../middleware/authentication');
const Controller = require('../models/Controller');
const User = require('../models/User');
const {sendResponse, generateUUID} = require('../utils/functions');
const { hashPassword } = require('../utils/passwords');

class AuthController extends Controller{
  constructor(){
    super();
  }

  // Login user.
  async login(req, res){
    try{
      const {username, email, password} = req.body;
      
      // Check if there is an email or a username.
      if(!username && !email){
        return sendResponse(req, res, 400, false, "👤 Username or email is required!");
      }

      // Check if there is a password.
      if(!password){
        return sendResponse(req, res, 400, false, "👤 Password is required!");
      }

      // Select the user based on their email or username.
      const [user] = await this.database.select("SELECT * FROM Users WHERE username = ? OR email = ?", [username, email]);
      if(user.length === 0){
        return sendResponse(req, res, 404, false, "👤 User not found!");
      }

      // Validate the users' password.
      const isPasswordValid = await hashPassword(password, user[0].password_hash);
      if(!isPasswordValid){
        return sendResponse(req, res, 401, false, "👤 Invalid password!");
      }

      // Create a new user object and sign JWT token.
      const userObj = new User(user[0].id, user[0].username, user[0].email, user[0].weight, user[0].height, user[0].age);
      const token = await signToken({...userObj.asObject(), role: user[0].role});

      // If the token did not sign, return an error.
      if(!token){
        return sendResponse(req, res, 500, false, "👤 Error in generating token!");
      }

      // Return the response.
      return sendResponse(req, res, 200, true, '👤 Login Successful', {
        ...userObj.asObject(),
        role: user[0].role,
        token: `Bearer ${token}`
      });
    }catch(error){
      // Log the error.
      console.log('⛔ Error in login: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in login!", {error: error.message});
    }           
  }

  async register(req, res){
    try{

      // Check if user is not an admin and is already logged in.
      const user = req.user;
      if(user && user.role !== 'admin'){
        return sendResponse(req, res, 409, false, "👤 You are already logged in!");
      }

      // Check if the request body is empty.
      if(!req.body){
        return sendResponse(req, res, 400, false, '⛔ Body is missing!');
      }
      
      // Extract data from the request body.
      const {username, email, password, weight, height, age} = req.body;
      
      // Check if data is missing.
      if(!username || !email || !password || !weight || !height || !age){
        return sendResponse(req, res, 400, false, "👤 All fields are required!");
      }
      
      // Check if the user already exists.
      const [existingUser] = await this.database.select("SELECT * FROM Users WHERE username = ? OR email = ?", [username, email]);
      if(existingUser.length > 0){
        return sendResponse(req, res, 409, false, "👤 User already exists!");
      }

      // Create a new user and hash the password.
      const userObj = new User(generateUUID(), username, weight, height, age);
      const passwordHash = await hashPassword(password);

      // Insert the user into the database.
      const [insertedUser] = await this.database.insert("INSERT INTO Users (id, username, email, password_hash, weight, height, age) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [userObj.getId(), username, email, passwordHash, weight, height, age]);
      if(!insertedUser.affectedRows){
        return sendResponse(req, res, 500, false, "👤 Error in creating account!");
      }

      // Return the response.
      return sendResponse(req, res, 201, true, "👤 Account created successfully!", user.asObject());
    }catch(error){
      // Log the error.
      console.log('⛔ Error in register: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in register!", {error: error});
    }
  }

  async logout(req, res){
    try{
      // Check if user is logged in.
      const user = req.user;

      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Set headers and variables to null.
      req.headers['authorization'] = '';
      req.user = null;
      req.token = null;

      // Return the response.
      return sendResponse(req, res, 200, true, "👤 Logout successful!", {authorization: req.headers['authorization'], user: req.user, token: req.token});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in logout: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in logout!", {error: error.message});
    }
  }
}

module.exports = AuthController;