class Workout{
  constructor(id, userId, workoutDate, duration, caloriesBurned, type){
    // Set the properties of the workout object.
    this.id = this.setId(id);
    this.userId = this.setUserId(userId);
    this.workoutDate = this.setWorkoutDate(workoutDate);
    this.duration = this.setDuration(duration);
    this.caloriesBurned = this.setCaloriesBurned(caloriesBurned);
    this.type = this.setType(type);
  }

  //#region Setters
  setId(id){
    return this.id = id;    
  }

  setUserId(userId){
    return this.userId = userId;
  }

  setWorkoutDate(workoutDate){
    return this.workoutDate = workoutDate;
  }

  setDuration(duration){
    return this.duration = duration;
  }

  setCaloriesBurned(caloriesBurned){
    return this.caloriesBurned = caloriesBurned;
  }

  setType(type){
    return this.type = type;
  }
  //#endregion

  //#region Getters
  getId(){
    return this.id;
  }

  getUserId(){
    return this.userId;
  }

  getWorkoutDate(){
    return this.workoutDate;
  }

  getDuration(){
    return this.duration;
  }

  getCaloriesBurned(){
    return this.caloriesBurned;
  }

  getType(){
    return this.type;
  }
  //#endregion

  // Convert the workout object to a json object.
  asObject(){
    return {
      id: this.getId(),
      userId: this.getUserId(),
      workoutDate: this.getWorkoutDate(),
      duration: this.getDuration(),
      caloriesBurned: this.getCaloriesBurned(),
      type: this.getType()
    }
  }
}

module.exports = Workout;