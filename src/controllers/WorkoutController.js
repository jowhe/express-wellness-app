const Controller = require('../models/Controller');
const Workout = require('../models/Workout');
const {sendResponse, generateUUID} = require('../utils/functions');

class WorkoutController extends Controller{
  constructor(){
    super();
  }

  async getWorkouts(req, res){
    try{
      const user = req.user;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Pull user data from database.
      const [workoutData] = await this.database.select("SELECT * FROM Workouts WHERE user_id = ?", [user.id]);

      // Check if user data is empty.
      if(workoutData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No workouts found!");
      }

      // Create a new workout object with each workout from database.
      const workoutList = workoutData.map((workout) => {
        const workoutObj = new Workout(workout.id, workout.user_id, workout.workout_date, workout.duration, workout.calories_burned, workout.type);
        return {...workoutObj.asObject()};
      });

      // Send the response.
      return sendResponse(req, res, 200, true, "� Workout(s) found!", {workouts: {...workoutList}});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in getWorkouts: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in getWorkouts!", {error: error.message});
    }
  }

  async getUserWorkouts(req, res){
    try{
      const user = req.user;
      const userId = req.params.user;
      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if user is admin.
      if(user.role !== 'admin'){
        return sendResponse(req, res, 403, false, "⛔ You are not authorized to view this user's workouts!");
      }

      // Pull user data from database.
      const [workoutData] = await this.database.select("SELECT * FROM Workouts WHERE user_id = ?", [userId]);

      // Check if user data is empty.
      if(workoutData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No workouts found!");
      }

      // Create a new workout object with each workout from database.
      const workoutList = workoutData.map((workout) => {
        const workoutObj = new Workout(workout.id, workout.user_id, workout.workout_date, workout.duration, workout.calories_burned, workout.type);
        return {...workoutObj.asObject()};
      });

      // Send the response.
      return sendResponse(req, res, 200, true, "� Workout(s) found!", {workouts: {...workoutList}});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in getUserWorkouts: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in getUserWorkouts!", {error: error.message});
    }
  }

  async createWorkout(req, res){
    try{
      const user = req.user;

      if(!req.body){
        return sendResponse(req, res, 400, false, "⛔ Error; Missing data!");
      }

      const {workoutDate = new Date(), duration, calories_burned, type} = req.body; 

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if data is missing.
      if(!workoutDate || !duration || !calories_burned || !type){
        return sendResponse(req, res, 400, false, "⛔ Error; Missing data!");
      }

      // Create a new workout object.
      const workout = new Workout(generateUUID(), user.id, workoutDate, duration, calories_burned, type);

      // Insert the workout into the database.
      const [workoutData] = await this.database.insert("INSERT INTO Workouts (id, user_id, workout_date, duration, calories_burned, type) VALUES (?, ?, ?, ?, ?, ?)", [workout.getId(), workout.getUserId(), workout.getWorkoutDate(), workout.getDuration(), workout.getCaloriesBurned(), workout.getType()]);
      if(workoutData.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error; Workout not created!");
      }

      // Send the response.
      return sendResponse(req, res, 201, true, "✅ Workout created!", {workout: workout.asObject()});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in createWorkout: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in createWorkout!", {error: error.message});
    }
  }

  async updateWorkout(req, res){
    try{
      const user = req.user;
      const workoutId = req.params.workout;
      const {duration, calories_burned, type} = req.body;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Pull existing data from database.
      const [workoutData] = await this.database.select("SELECT * FROM Workouts WHERE id = ?", [workoutId]);
      if(workoutData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ Workout not found!");
      }
      
      // Check if workout relates to user
      if(workoutData[0].user_id !== user.id){
        return sendResponse(req, res, 403, false, "⛔ You are not authorized to update this workout!");
      }

      // Create a new workout object.
      const workoutObj = new Workout(workoutId ?? workoutData[0].id, user.id ?? workoutData[0].user_id, workoutData[0].workout_date, duration ?? workoutData[0].workout_date, calories_burned ?? workoutData[0].calories_burned, type ?? workoutData[0].type);
      
      // Update the workout in the database.
      const [updateData] = await this.database.update("UPDATE Workouts SET duration = ?, calories_burned = ?, type = ? WHERE id = ?", [workoutObj.getDuration(), workoutObj.getCaloriesBurned(), workoutObj.getType(), workoutObj.getId()]);
      if(updateData.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error; Workout not updated!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "✅ Workout updated!", {workout: workoutObj.asObject()});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in updateWorkout: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in updateWorkout!", {error: error.message});
    }
  }

  async deleteWorkout(req, res){
    try{
      const user = req.user;
      const {workoutId} = req.body;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if user is admin.
      if(req.user.role !== 'admin'){
        // Pull existing data from database.
        const [workoutData] = await this.database.select("SELECT * FROM Workouts WHERE id = ?", [workoutId]);
        if(workoutData.length === 0){
          return sendResponse(req, res, 404, false, "⛔ Workout not found!");
        }
        
        // Check if workout relates to user
        if(workoutData[0].user_id !== user.id){
          return sendResponse(req, res, 403, false, "⛔ You are not authorized to delete this workout!");
        }

        // Delete the workout from the database.
        const [deleteData] = await this.database.delete("DELETE FROM Workouts WHERE id = ?", [workoutId]);
        if(deleteData.affectedRows === 0){
          return sendResponse(req, res, 500, false, "⛔ Error; Workout not deleted!");
        }

        // Send the response.
        return sendResponse(req, res, 200, true, "✅ Workout deleted!", {workout: workoutId});
      }

      // Delete the workout from the database.
      const [deleteData] = await this.database.delete("DELETE FROM Workouts WHERE id = ?", [workoutId]);
      if(deleteData.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error; Workout not deleted!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "✅ Workout deleted!", {workout: workoutId});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in deleteWorkout: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in deleteWorkout!", {error: error.message});
    }
  }
}

module.exports = WorkoutController;