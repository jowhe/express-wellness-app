const Controller = require('../models/Controller');
const User = require('../models/User');
const {sendResponse} = require('../utils/functions');

class UserController extends Controller{
    constructor(){
        super();
    }

    // Get user by token.
    async getUsers(req, res){
      try{
        const user = req.user;

        // Check if user is logged in.
        if(!user){
          return sendResponse(req, res, 404, false, "👤 Account not found!");
        }

        // Check if user is admin.
        if(user.role !== 'admin'){
          // Pull user data from database.
          const [userData] = await this.database.select("SELECT id, username, email, weight, age, height, created_at, updated_at FROM Users WHERE id = ?", [user.id]);

          // Retrieve the workouts from the workout API.
          const workouts = await fetch(`http://localhost:10101/api/v1/workouts/`, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${req.token}`,
            }
          });
          const {data: workoutData} = await workouts.json();

          // Retrieve the workouts from the workout API.
          const goals = await fetch(`http://localhost:10101/api/v1/goals/`, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${req.token}`,
            }
          });
          const {data: goalData} = await goals.json();

          const meals = await fetch(`http://localhost:10101/api/v1/meals/`, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${req.token}`,
            }
          });
          const {data: mealData} = await meals.json();

          const recommendations = await fetch(`http://localhost:10101/api/v1/recommendations/`, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${req.token}`,
            },
          });
          const {data: recommendationsData} = await recommendations.json();

          // Send the response.
          return sendResponse(req, res, 200, true, "👤 Account found!", {user: {...userData[0], ...workoutData, ...goalData, ...mealData, ...recommendationsData}});
        }

        // Pull user data from database.
        const [userData] = await this.database.select("SELECT id, username, email, weight, age, height, role, created_at, updated_at FROM Users");

        // Check if user data is empty.
        if(userData.length === 0){
          return sendResponse(req, res, 404, false, "⛔ No users found!");
        }

        // Create a new user object with each user from database.
        const userList = await Promise.all(userData.map(async (user) => {
          const userObj = new User(user.id, user.username, user.email, user.weight, user.height, user.age);

          const workouts = await fetch(`http://localhost:10101/api/v1/workouts/${user.id}`, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${req.token}`,
            }
          });
          const {data: workoutData} = await workouts.json();

          const goals = await fetch(`http://localhost:10101/api/v1/goals/${user.id}`, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${req.token}`,
            }
          });
          const {data: goalsData} = await goals.json();

          const meals = await fetch(`http://localhost:10101/api/v1/meals/${user.id}`, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${req.token}`,
            }
          });
          const {data: mealsData} = await meals.json();

          const recommendations = await fetch(`http://localhost:10101/api/v1/recommendations/${user.id}`, {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${req.token}`,
            },
          });
          const {data: recommendationsData} = await recommendations.json();

          return {...userObj.asObject(), role: user.role, ...workoutData, ...goalsData, ...mealsData, ...recommendationsData, created_at: new Date(user.created_at), updated_at: new Date(user.updated_at)};
        }));

        // Send the response.
        return sendResponse(req, res, 200, true, "👤 Account found!", {users: {...userList}});
      }catch(error){
        // Log the error.
        console.log('⛔ Error in getUser: ', error);
        return sendResponse(req, res, 500, false, "⛔ Error in getUser!", {error: error.message});
      }
    }

    // Get user by ID.
    async getUserById(req, res){
      try{
        const {id} = req.params;

        if(req.user.role !== 'admin' && req.user.id !== id){
          return sendResponse(req, res, 403, false, "❌ You are not authorized to view this user!");
        }

        // Pull data relating to user ID.
        const [user] = await this.database.select("SELECT id, username, email, weight, age, height, created_at, updated_at FROM Users WHERE id = ?", [id]);
        if(user.length === 0){
          return sendResponse(req, res, 404, false, "⛔ User not found!");
        }

        // Create a new user object.
        const userObj = new User(user[0].id, user[0].username, user[0].email, user[0].weight, user[0].height, user[0].age);

        // Send the response.
        return sendResponse(req, res, 200, true, "👤 User found!", {...userObj.asObject()});
      }catch(error){
        // Log the error.
        console.log('⛔ Error in getUserById: ', error);
        return sendResponse(req, res, 500, false, "⛔ Error in getUserById!", {error: error.message});
      }
    }

    // Update a user account.
    async updateUser(req, res){
      try{
        const user = req.user;
        const {id = null, username, email, weight, height, age} = req.body;
        const updatedat = new Date();

        // Check if user is logged in.
        if(!user){
          return sendResponse(req, res, 404, false, "❗You are not logged in to an account!");
        }

        // Check if user is admin and if a specific ID is present.
        if(id !== null){
          if(user.role !== 'admin')
            return sendResponse(req, res, 403, false, "❌ You are not authorized to update this user!");
        }
        
        // Check if there is new data present.
        if(!username && !email && !weight && !height && !age){
          return sendResponse(req, res, 400, false, "📝 At least one field is required!");
        }

        // Pull the existing user data from /api/v1/users/:id
        const existingUser = await fetch(`http://localhost:10101/api/v1/users/${id ? id : user.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${req.token}`,
            'Content-Type': 'application/json'
          }
        });

        // If the user is not found, return a 404 error.
        if(!existingUser.ok){
          return sendResponse(req, res, 404, false, "⛔ User not found!");
        }

        // Pull the existing user data from the response.
        const {data: existingData} = await existingUser.json();

        // Create a new user object.
        const newUser = new User(id ?? existingData.id, username ?? existingData.username, email ?? existingData.email, weight ?? existingData.weight, height ?? existingData.height, age ?? existingData.age);

        // Update existing data with new data.
        const [updatedUser] = await this.database.update("UPDATE Users SET username = ?, email = ?, weight = ?, height = ?, age = ?, updated_at = ? WHERE id = ?", [newUser.getUsername(), newUser.getEmail(), newUser.getWeight(), newUser.getHeight(), newUser.getAge(), updatedat, newUser.getId()]);        
        if(updatedUser.affectedRows === 0){
          return sendResponse(req, res, 404, false, "👤 Failed to update user!");
        }

        // Send the response.
        return sendResponse(req, res, 200, true, "👤 User updated successfully!", {...newUser.asObject()});
      }catch(error){
        // Log the error.
        console.log('⛔ Error in updateUser: ', error);
        return sendResponse(req, res, 500, false, "⛔ Error in updateUser!", {error: error.message});
      }
    }

    // Delete a user account.
    async deleteUser(req, res){
      try{
        const user = req.user;
        const {id, username, email} = req.body;

        // Check if user is logged in.
        if(!user){
          return sendResponse(req, res, 404, false, "❗You are not logged in to an account!");
        }

        // Check if user is admin.
        if(user.role !== 'admin'){
          return sendResponse(req, res, 403, false, "❌ You are not authorized to delete this user!");
        }

        // Check if user ID is present.
        if(!id && !username && !email){
          return sendResponse(req, res, 400, false, "📝 At least one field is required!");
        }

        // Delete user from database.
        const [deletedUser] = await this.database.delete("DELETE FROM Users WHERE id = ? OR username = ? OR email = ?", [id, username, email]);
        if(deletedUser.affectedRows === 0){
          return sendResponse(req, res, 404, false, "👤 Failed to delete user!");
        }

        // Send the response.
        return sendResponse(req, res, 200, true, "👤 User deleted successfully!", {id: id, username: username, email: email});
      }catch(error){
        // Log the error.
        console.log('⛔ Error in deleteUser: ', error);
        return sendResponse(req, res, 500, false, "⛔ Error in deleteUser!", {error: error.message});
      }
    }
}

module.exports = UserController;