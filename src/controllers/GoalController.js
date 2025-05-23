const Controller = require('../models/Controller');
const Goal = require('../models/Goal');
const {sendResponse, generateUUID} = require('../utils/functions');

class GoalController extends Controller{
  constructor(){
    super();
  }

  // Get goals by user token.
  async getGoals(req, res){
    try{
      const user = req.user;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Pull user data from database.
      const [goalData] = await this.database.select("SELECT id, user_id, goal_type, target_weight FROM Goals WHERE user_id = ?", [user.id]);

      // Check if user data is empty.
      if(goalData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No goals found!");
      }

      // Create a new goal object with each goal from database.
      const goalList = goalData.map((goal) => {
        const goalObj = new Goal(goal.id, goal.user_id, goal.goal_type, goal.target_weight);
        return {...goalObj.asObject()};
      });

      // Send the response.
      return sendResponse(req, res, 200, true, "🎯 Goal(s) found!", {goals: {...goalList}});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in getGoals: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in getGoals!", {error: error.message});
    }
  }

  async getUserGoals(req, res){
    try{
      const user = req.user;
      const userId = req.params.user;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if user is admin.
      if(user.role !== 'admin'){
        return sendResponse(req, res, 403, false, "⛔ You are not authorized to view this user's goals!");
      }

      // Pull user data from database.
      const [goalData] = await this.database.select("SELECT * FROM Goals WHERE user_id = ?", [userId]);

      // Check if user data is empty.
      if(goalData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No goals found!");
      }

      // Create a new goal object with each goal from database.
      const goalList = goalData.map((goal) => {
        const goalObj = new Goal(goal.id, goal.user_id, goal.goal_type, goal.target_weight);
        return {...goalObj.asObject()};
      });

      // Send the response.
      return sendResponse(req, res, 200, true, "🎯 Goal(s) found!", {goals: {...goalList}});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in getUserGoals: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in getUserGoals!", {error: error.message});
    }
  }

  async createGoal(req, res){
    try{
      const user = req.user;
      const {goalType, targetWeight} = req.body;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Create a new goal object.
      const goal = new Goal(generateUUID(), user.id, goalType, targetWeight);

      // Insert the goal into the database.
      const [insertedGoal] = await this.database.insert("INSERT INTO Goals (id, user_id, goal_type, target_weight) VALUES (?, ?, ?, ?)", [goal.getId(), goal.getUserId(), goal.getGoalType(), goal.getTargetWeight()]);
      if(insertedGoal.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error; Goal not created!");
      }

      // Send the response.
      return sendResponse(req, res, 201, true, "🎯 Goal created successfully!", {goal: goal.asObject()});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in createGoal: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in createGoal!", {error: error.message});
    }
  }

  async updateGoal(req, res){
    try{
      const user = req.user;
      const {id, goalType, targetWeight} = req.body;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      if(!id){
        return sendResponse(req, res, 400, false, "⛔ Missing id field!");
      }

      // Check if goal relates to the user.
      const [goalData] = await this.database.select("SELECT * FROM Goals WHERE id = ? AND user_id = ?", [id, user.id]);
      if(goalData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No goals found!");
      }

      // Create a new goal object.
      const goal = new Goal(id, user.id ?? goalData[0].user_id, goalType ?? goalData[0].goal_type, targetWeight ?? goalData[0].target_weight);

      // Update the goal in the database.
      const [updatedGoal] = await this.database.update("UPDATE Goals SET goal_type = ?, target_weight = ? WHERE id = ?", 
        [goal.getGoalType(), goal.getTargetWeight(), goal.getId()]);
      if(updatedGoal.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error; Goal not updated!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "✅ Goal updated successfully!", {goal: goal.asObject()});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in updateGoal: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in updateGoal!", {error: error.message});
    }
  }

  async deleteGoal(req, res){
    try{
      const user = req.user;
      const goalId = req.params.goal;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      if(user.role !== 'admin'){
        // Pull existing data from database.
        const [goalData] = await this.database.select("SELECT * FROM Goals WHERE id = ?", [goalId]);
        if(goalData.length === 0){
          return sendResponse(req, res, 404, false, "⛔ No goals found!");
        }

        // Check if goal relates to the user.
        if(goalData[0].user_id !== user.id){
          return sendResponse(req, res, 403, false, "⛔ You are not authorized to delete this goal!");
        }

        // Delete the goal from the database.
        const [deletedGoal] = await this.database.delete("DELETE FROM Goals WHERE id = ?", [goalId]);
        if(deletedGoal.affectedRows === 0){
          return sendResponse(req, res, 404, false, "⛔ Failed to delete goal!");
        }

        // Send the response.
        return sendResponse(req, res, 200, true, "✅ Goal deleted successfully!", {goalId: goalId});
      }

      // Delete the goal from the database.
      const [deletedGoal] = await this.database.delete("DELETE FROM Goals WHERE id = ?", [goalId]);
      if(deletedGoal.affectedRows === 0){
        return sendResponse(req, res, 404, false, "⛔ Failed to delete goal!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "✅ Goal deleted successfully!", {goalId: goalId});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in deleteGoal: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in deleteGoal!", {error: error.message});
    }
  }
}

module.exports = GoalController;