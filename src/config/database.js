const mysql = require('mysql2');
const env = require('./env');

const pool = mysql.createPool({
  host: env.databaseConfig.DB_HOST,
  user: env.databaseConfig.DB_USER,
  password: env.databaseConfig.DB_PASSWORD,
  database: env.databaseConfig.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const promise = pool.promise();

module.exports = promise;