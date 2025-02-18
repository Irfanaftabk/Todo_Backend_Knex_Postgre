// /* 
//   Update with your config settings.
//   The test database and development database are by default the same.
//   Knex also allows for easy switching between databases. 
//   But the .returning() method will only work for PostgreSQL, MSSQL, and Oracle databases.
// */

require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD
    },
    pool: {
      min: 0,
      max: 7,
      acquireTimeoutMillis: 300000,
      createTimeoutMillis: 300000
    },
    migrations: {
      directory: './migrations'
    }
  }
};