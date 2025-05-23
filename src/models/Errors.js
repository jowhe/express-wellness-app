class UserException extends Error {
  constructor(message) {
    super(message);
    this.name = "UserException";
  }
}

class DatabaseException extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseException";
  }
}

class WorkoutException extends Error {
  constructor(message) {
    super(message);
    this.name = "WorkoutException";
  }
}

module.exports = {
  UserException,
  DatabaseException,
  WorkoutException
};