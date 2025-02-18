const knex = require('knex');
const config = require('../knexfile');

const db = knex({
  ...config.development,  // Spread the development config
  connection: {
    ...config.development.connection,
    ssl: false  // Add SSL false to existing connection config
  }
});

// Add error handling for debugging
db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = db;