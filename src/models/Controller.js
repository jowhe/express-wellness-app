const Database = require('./Database');

class Controller{
  constructor(){
    // The database connection for Controller classes.
    this.database = new Database();
  }
}

module.exports = Controller;