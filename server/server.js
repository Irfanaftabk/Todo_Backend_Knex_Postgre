const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./database/connection');
const todoRoutes = require('./server-routes');
// Add auth routes import at the top with other requires
const authRoutes = require('./auth/routes/authRoutes');
// Add auth middleware import
const authMiddleware = require('./auth/middleware/authMiddleware');

const app = express();
if (process.env.NODE_ENV !== 'test'){
db.raw('SELECT 1').then(() => {
    console.log("Database connected successfully");
})
.catch((err) => {
    console.error("Database connection failed", err);
});
}
//Middleware setup
app.use(cors()); //1
app.use(morgan('dev')); //2
app.use(express.json());

// Add auth routes before todo routes
app.use('/auth', authRoutes);

// Protect todo routes with auth middleware
app.use('/todos', authMiddleware, todoRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: 'Internal Server Error'});
});
if (process.env.NODE_ENV !== 'test'){
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
}

module.exports = app;