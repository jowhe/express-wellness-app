class Meal{
  constructor(id, userId, mealDate, mealType, calories, protein, carbs, fats){
    this.id = this.setId(id);
    this.userId = this.setUserId(userId);
    this.mealDate = this.setMealDate(mealDate);
    this.mealType = this.setMealType(mealType);
    this.calories = this.setCalories(calories);
    this.protein = this.setProtein(protein);
    this.carbs = this.setCarbs(carbs);
    this.fats = this.setFats(fats);
  }

  //#region Setters
  setId(id){
    return this.id = id;    
  }

  setUserId(userId){
    return this.userId = userId;
  }

  setMealDate(mealDate){
    return this.mealDate = mealDate;
  }

  setMealType(mealType){
    return this.mealType = mealType;
  }

  setCalories(calories){
    return this.calories = calories;
  }

  setProtein(protein){
    return this.protein = protein;
  }

  setCarbs(carbs){
    return this.carbs = carbs;
  }

  setFats(fats){
    return this.fats = fats;
  }
  //#endregion

  //#region Getters
  getId(){
    return this.id;
  }

  getUserId(){
    return this.userId;
  }

  getMealDate(){
    return this.mealDate;
  }

  getMealType(){
    return this.mealType;
  }

  getCalories(){
    return this.calories;
  }

  getProtein(){
    return this.protein;
  }

  getCarbs(){
    return this.carbs;
  }

  getFats(){
    return this.fats;
  }
  //#endregion

  // Method to get the user object as a JSON object.
  asObject(){
    return {
      id: this.getId(),
      userId: this.getUserId(),
      mealDate: this.getMealDate(),
      mealType: this.getMealType(),
      calories: this.getCalories(),
      protein: this.getProtein(),
      carbs: this.getCarbs(),
      fats: this.getFats()
    }
  }
}

module.exports = Meal;