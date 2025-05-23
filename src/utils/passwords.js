const bcrypt = require('bcrypt');

// Hash a password.
function hashPassword(password){
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

// Verify a hash.
function comparePassword(password, hashedPassword){
    return bcrypt.compare(password, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePassword
}