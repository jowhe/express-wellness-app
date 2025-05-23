class Recommendation {
  constructor(id, userId, recDate, recText){
    this.id = this.setId(id);
    this.userId = this.setUserId(userId);
    this.recDate = this.setRecDate(recDate);
    this.recText = this.setRecText(recText);
  }

  //#region Setters
  setId(id){
    return this.id = id;
  }

  setUserId(userId){
    return this.userId = userId;
  }

  setRecDate(recDate){
    return this.recDate = recDate;
  }

  setRecText(recText){
    return this.recText = recText;
  }
  //#endregion

  //#region Getters
  getId(){
    return this.id;
  }

  getUserId(){
    return this.userId;
  }

  getRecDate(){
    return this.recDate;
  }

  getRecText(){
    return this.recText;
  }
  //#endregion

  // Convert the Recommendation object to a json object.
  asObject(){
    return {
      id: this.getId(),
      userId: this.getUserId(),
      recDate: this.getRecDate(),
      recText: this.getRecText()
    }
  }
}

module.exports = Recommendation;