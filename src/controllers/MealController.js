const env = require('../config/env');
const Controller = require('../models/Controller');
const Meal = require('../models/Meal');
const {sendResponse, generateUUID} = require('../utils/functions');

class MealController extends Controller{
  constructor(){
    super();
  }

  // Get meals by token.
  async getMeals(req, res){
    try{
      const user = req.user;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Pull data from database.
      const [mealData] = await this.database.select("SELECT * FROM Meals WHERE user_id = ?", [user.id]);
      if(mealData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No meals found!");
      }

      // Create a new meal object with each meal from database.
      const mealList = mealData.map((meal) => {
        const mealObj = new Meal(meal.id, meal.user_id, meal.meal_date, meal.meal_type, meal.calories, meal.protein, meal.carbs, meal.fats);
        return {...mealObj.asObject(), created_at: new Date(meal.created_at), updated_at: new Date(meal.updated_at)};
      });

      // Send the response.
      return sendResponse(req, res, 200, true, "🍽️ Meal(s) found!", {meals: {...mealList}});
    }catch(error){
      // Log the error.
      console.error(error);
      return sendResponse(req, res, 500, false, "⛔ Error retrieving meals!");
    }
  }

  // Get meals by user.
  async getUserMeals(req, res){
    try{
      const user = req.user;
      const userId = req.params.user;
      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if user is admin.
      if(user.role !== 'admin'){
        return sendResponse(req, res, 403, false, "⛔ You are not authorized to view this user's meals!");
      }

      // Pull user data from database.
      const [mealData] = await this.database.select("SELECT * FROM Meals WHERE user_id = ?", [userId]);
      if(mealData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No meals found!");
      }

      // Create a new workout object with each workout from database.
      const mealList = mealData.map((meal) => {
        const mealObj = new Meal(meal.id, meal.user_id, meal.meal_date, meal.meal_type, meal.calories, meal.protein, meal.carbs, meal.fats);
        return {...mealObj.asObject()};
      });

      // Send the response.
      return sendResponse(req, res, 200, true, "🍽️ Meal(s) found!", {meals: {...mealList}});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in getUserMeals: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in getUserMeals!", {error: error.message});
    }
  }

  // Create a meal.
  async createMeal(req, res){
    try{
      const user = req.user;
      const {mealDate = new Date(), mealType, calories, protein, carbs, fats} = req.body;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if data is missing.
      if(!mealType || !calories || !protein || !carbs || !fats){
        return sendResponse(req, res, 400, false, "⛔ Missing data!");
      }

      // Create recommendation
      switch(mealType){
        case 'Breakfast':
          if(calories >= 500){
            const recText = "🍳 Try to keep your breakfast under 500 calories for a balanced start to the day.";
            const recResponse = await fetch(`${env.API_BASE}/recommendations`, {
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${req.token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({recText})
            });

            if(!recResponse.ok){
              sendResponse(req, res, 500, false, "⛔ Error; Failed to create recommendation!");
            }
          }
          break;
        case 'Lunch':
          if(calories >= 700){
            const recText = "🥗 Try to keep your lunch under 700 calories for a balanced meal.";
            const recResponse = await fetch(`${env.API_BASE}/recommendations`, {
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${req.token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({recText})
            });

            if(!recResponse.ok){
              sendResponse(req, res, 500, false, "⛔ Error; Failed to create recommendation!");
            }
          }
          break;
        case 'Dinner':
          if(calories >= 800){
            const recText = "🍽️ Try to keep your dinner under 800 calories for a balanced meal.";
            const recResponse = await fetch(`${env.API_BASE}/recommendations`, {
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${req.token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({recText})
            });

            if(!recResponse.ok){
              sendResponse(req, res, 500, false, "⛔ Error; Failed to create recommendation!");
            }
          }
          break;
      }

      // Create a new meal object.
      const meal = new Meal(generateUUID(), user.id, mealDate, mealType, calories, protein, carbs, fats);
      
      // Insert the meal into the database.
      const [mealData] = await this.database.insert("INSERT INTO Meals (id, user_id, meal_date, meal_type, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [meal.getId(), meal.getUserId(), meal.getMealDate(), meal.getMealType(), meal.getCalories(), meal.getProtein(), meal.getCarbs(), meal.getFats()]);
      if(mealData.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error; Meal not created!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "🍽️ Meal created!", {meal: meal.asObject()});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in createMeal: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in createMeal!", {error: error.message});
    }
  }

  async updateMeal(req, res){
    try{
      const user = req.user;
      const{mealId, mealDate, mealType, calories, protein, carbs, fats} = req.body;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if meal belongs to user.
      const [mealData] = await this.database.select("SELECT * FROM Meals WHERE id = ? AND user_id = ?", [mealId, user.id]);
      if(mealData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ Meal not found!");
      }
      
      // Create a new meal object.
      const meal = new Meal(mealId ?? mealData[0].id, user.id ?? mealData[0].user_id, mealDate ?? mealData[0].meal_date, mealType ?? mealData[0].meal_type, calories ?? mealData[0].calories, protein ?? mealData[0].protein, carbs ?? mealData[0].carbs, fats ?? mealData[0].fats);

      // Update the meal in the database.
      const [mealUpdate] = await this.database.update("UPDATE Meals SET meal_date = ?, meal_type = ?, calories = ?, protein = ?, carbs = ?, fats = ? WHERE id = ?", 
        [meal.getMealDate(), meal.getMealType(), meal.getCalories(), meal.getProtein(), meal.getCarbs(), meal.getFats(), meal.getId()]);
      if(mealUpdate.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error; Meal not updated!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "🍽️ Meal updated!", {meal: meal.asObject()});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in updateMeal: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in updateMeal!", {error: error.message});
    }
  }

  // Delete a meal.
  async deleteMeal(req, res){
    try{
      const user = req.user;
      const mealId = req.params.meal;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      if(user.role !== 'admin'){
        // Pull existing data from database.
        const [mealData] = await this.database.select("SELECT * FROM Meals WHERE id = ?", [mealId]);
        if(mealData.length === 0){
          return sendResponse(req, res, 404, false, "⛔ No meals found!");
        }

        // Check if meal relates to the user.
        if(mealData[0].user_id !== user.id){
          return sendResponse(req, res, 403, false, "⛔ You are not authorized to delete this meal!");
        }

        // Delete the meal from the database.
        const [mealDelete] = await this.database.delete("DELETE FROM Meals WHERE id = ?", [mealId]);
        if(mealDelete.affectedRows === 0){
          return sendResponse(req, res, 500, false, "⛔ Error; Meal not deleted!");
        }

        // Send the response.
        return sendResponse(req, res, 200, true, "🍽️ Meal deleted!", {mealId: mealId});
      }

      // Delete the meal from the database.
      const [mealDelete] = await this.database.delete("DELETE FROM Meals WHERE id = ?", [mealId]);
      if(mealDelete.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error; Meal not deleted!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "🍽️ Meal deleted!", {mealId: mealId});
    }catch(error){
      // Log the error.
      console.log('⛔ Error in deleteMeal: ', error);
      return sendResponse(req, res, 500, false, "⛔ Error in deleteMeal!", {error: error.message});
    }
  }
}

module.exports = MealController;