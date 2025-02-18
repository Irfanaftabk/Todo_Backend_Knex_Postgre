const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./database/connection');
const todoRoutes = require('./server-routes');

const app = express();

db.raw('SELECT 1').then(()=>{
  console.log("Database connected successfully");
})
.catch((err) => {
  console.error("Database connection failed", err);
});

//Middleware setup
app.use(cors()); //1

app.use(morgan('dev')); //2

app.use(express.json());

app.use('/todos',todoRoutes);

app.use((err,req,res,next) => {
  console.error(err.stack);
  res.status(500).json({error:'Internal Server Error'});
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
  console.log('Server running on port '+ PORT);
})

module.exports = app;