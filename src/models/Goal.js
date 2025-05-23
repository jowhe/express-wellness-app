class Goal{
  constructor(id, userId, goalType, targetWeight){
    this.id = this.setId(id);
    this.userId = this.setUserId(userId);
    this.goalType = this.setGoalType(goalType);
    this.targetWeight = this.setTargetWeight(targetWeight);
  }

  //#region Setters
  setId(id){
    return this.id = id;
  }

  setUserId(userId){
    return this.userId = userId;
  }

  setGoalType(goalType){
    return this.goalType = goalType;
  }

  setTargetWeight(targetWeight){
    return this.targetWeight = targetWeight;
  }
  //#endregion

  //#region Getters
  getId(){
    return this.id;
  }

  getUserId(){
    return this.userId;
  }

  getGoalType(){
    return this.goalType;
  }

  getTargetWeight(){
    return this.targetWeight;
  }
  //#endregion

  // Convert the Goal object to a json object.
  asObject(){
    return {
      id: this.getId(),
      userId: this.getUserId(),
      goalType: this.getGoalType(),
      targetWeight: this.getTargetWeight()
    }
  }
}

module.exports = Goal;