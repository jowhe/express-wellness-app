require('dotenv').config();

const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  databaseConfig: {
    DB_HOST: process.env.DATABASE_HOST,
    DB_USER: process.env.DATABASE_USER,
    DB_PASSWORD: process.env.DATABASE_PASS,
    DB_NAME: process.env.DATABASE_NAME,
  },
  rateLimitConfig: {
    WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  }
}

module.exports = env;