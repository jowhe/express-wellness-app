class User{

  constructor(id, username, email, weight, height, age){
    // Set the properties of the user object.
    this.id = this.setId(id);
    this.username = this.setUsername(username);
    this.email = this.setEmail(email);
    this.weight = this.setWeight(weight);
    this.height = this.setHeight(height);
    this.age = this.setAge(age);
  }

  //#region Setters
  setId(id){
    return this.id = id;    
  }

  setUsername(username){
    return this.username = username;
  }

  setEmail(email){
    return this.email = email;
  }

  setWeight(weight){
    return this.weight = weight;
  }

  setHeight(height){
    return this.height = height;
  }

  setAge(age){
    return this.age = age;
  }
  //#endregion
 
  //#region Getters
  getId(){
    return this.id;
  }

  getUsername(){
    return this.username;
  }

  getEmail(){
    return this.email;
  }

  getWeight(){
    return this.weight;
  }

  getHeight(){
    return this.height;
  }

  getAge(){
    return this.age;
  }
  //#endregion

  // Method to get the user object as a JSON object.
  asObject(){
    return {
      id: this.getId(),
      username: this.getUsername(),
      email: this.getEmail(),
      weight: this.getWeight(),
      height: this.getHeight(),
      age: this.getAge()
    };
  }

}

module.exports = User;