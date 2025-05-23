const Controller = require('../models/Controller');
const Recommendation = require('../models/Recommendation');
const {sendResponse, generateUUID} = require('../utils/functions');

class RecommendationController extends Controller{
  constructor(){
    super();
  }

  // Get recommendations by token.
  async getRecommendations(req, res){
    try{
      const user = req.user;
      
      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Pull data from database.
      const [recData] = await this.database.select("SELECT * FROM Recommendations WHERE user_id = ?", [user.id]);
      if(recData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No recommendations found!");
      }

      // Create a new recommendation object with each recommendation from database.
      const recList = recData.map((rec) => {
        const recObj = new Recommendation(rec.id, rec.user_id, rec.recommendation_date, rec.recommendation_text);
        return {...recObj.asObject()};
      });

      // Send the response.
      return sendResponse(req, res, 200, true, "� Recommendation(s) found!", {recommendations: {...recList}});
    }catch(error){
      // Log the error.
      console.error(error);
      return sendResponse(req, res, 500, false, "⛔ Error retrieving recommendations!");
    }
  }

  // Get recommendations by user.
  async getUserRecommendations(req, res){
    try{
      const user = req.user;
      const userId = req.params.user;
      
      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if user is admin.
      if(user.role !== 'admin'){
        return sendResponse(req, res, 403, false, "⛔ You are not authorized to view this user's recommendations!");
      }

      // Pull user data from database.
      const [recData] = await this.database.select("SELECT * FROM Recommendations WHERE user_id = ?", [userId]);
      if(recData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ No recommendations found!");
      }

      // Create a new recommendation object with each recommendation from database.
      const recList = recData.map((rec) => {
        const recObj = new Recommendation(rec.id, rec.user_id, rec.recommendation_date, rec.recommendation_text);
        return {...recObj.asObject()};
      });

      // Send the response.
      return sendResponse(req, res, 200, true, "✅ Recommendation(s) found!", {recommendations: {...recList}});
    }catch(error){
      // Log the error.
      console.error(error);
      return sendResponse(req, res, 500, false, "⛔ Error retrieving recommendations!");
    }
  }

  // Create a recommendation.
  async createRecommendation(req, res){
    try{
      const user = req.user;
      const {recDate = new Date(), recText} = req.body;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if data is missing.
      if(!recText){
        return sendResponse(req, res, 400, false, "⛔ Missing data!");
      }

      // Create a new recommendation object.
      const recObj = new Recommendation(generateUUID(), user.id, recDate, recText);
      
      // Insert the recommendation into the database.
      const result = await this.database.insert("INSERT INTO Recommendations (id, user_id, recommendation_date, recommendation_text) VALUES (?, ?, ?, ?)", [recObj.getId(), recObj.getUserId(), recObj.getRecDate(), recObj.getRecText()]);
      if(result.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error creating recommendation!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "✅ Recommendation created!", {recommendation: {...recObj.asObject()}});
    }catch(error){
      // Log the error.
      console.error(error);
      return sendResponse(req, res, 500, false, "⛔ Error retrieving recommendations!");
    }
  }

  // Update a recommendation.
  async updateRecommendation(req, res){
    try{
      const user = req.user;
      const {recId, recDate, recText} = req.body;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      // Check if recommendation relates to user.
      const [recData] = await this.database.select("SELECT * FROM Recommendations WHERE id = ? AND user_id = ?", [recId, user.id]);
      if(recData.length === 0){
        return sendResponse(req, res, 404, false, "⛔ Recommendation not found!");
      }

      // Create a new recommendation object.
      const recObj = new Recommendation(recId ?? recData[0].id, user.id ?? recData[0].user_id, recDate ?? recData[0].recommendation_date, recText ?? recData[0].recommendation_text);

      // Update the recommendation in the database.
      const result = await this.database.update("UPDATE Recommendations SET recommendation_date = ?, recommendation_text = ? WHERE id = ?", [recObj.getRecDate(), recObj.getRecText(), recObj.getId()]);
      if(result.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error updating recommendation!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "✅ Recommendation updated!", {recommendation: {...recObj.asObject()}});
    }catch(error){
      // Log the error.
      console.error(error);
      return sendResponse(req, res, 500, false, "⛔ Error retrieving recommendations!");
    }
  }

  // Delete a recommendation.
  async deleteRecommendation(req, res){
    try{
      const user = req.user;
      const recId = req.params.rec;

      // Check if user is logged in.
      if(!user){
        return sendResponse(req, res, 404, false, "⛔ You are not logged in!");
      }

      if(user.role !== 'admin'){
        // Pull recommendation data from database.
        const [recData] = await this.database.select("SELECT * FROM Recommendations WHERE id = ? AND user_id = ?", [recId, user.id]);
        if(recData.length === 0){
          return sendResponse(req, res, 404, false, "⛔ Recommendation not found!");
        }

        // Check if recommendation relates to the user.
        if(recData[0].user_id !== user.id){
          return sendResponse(req, res, 403, false, "⛔ You are not authorized to delete this recommendation!");
        }

        // Delete the recommendation from the database.
        const [result] = await this.database.delete("DELETE FROM Recommendations WHERE id = ?", [recId]);
        if(result.affectedRows === 0){
          return sendResponse(req, res, 500, false, "⛔ Error deleting recommendation!");
        }

        // Send the response.
        return sendResponse(req, res, 200, true, "✅ Recommendation deleted!", {recommendationId: recId});
      }

      // Delete the recommendation from the database.
      const [result] = await this.database.delete("DELETE FROM Recommendations WHERE id = ?", [recId]);
      if(result.affectedRows === 0){
        return sendResponse(req, res, 500, false, "⛔ Error deleting recommendation!");
      }

      // Send the response.
      return sendResponse(req, res, 200, true, "✅ Recommendation deleted!", {recommendationId: recId});
    }catch(error){
      // Log the error.
      console.error(error);
      return sendResponse(req, res, 500, false, "⛔ Error retrieving recommendations!");
    }
  }

}

module.exports = RecommendationController;