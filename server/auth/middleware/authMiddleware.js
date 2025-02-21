const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
         console.log(req.header);
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false, 
                message: 'No authentication token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request object
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({
            success: false, 
            message: 'Invalid authentication token' 
        });
    }
};

module.exports = authMiddleware;