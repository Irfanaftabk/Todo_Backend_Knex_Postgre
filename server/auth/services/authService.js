const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

class AuthService {
    // Generate JWT token
    generateToken(user) {
        // Creating token with user id and username, valid for 24 hours
        return jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    // Hash password before saving to database
    async hashPassword(password) {
        if (!password || typeof password !== 'string' || password.trim().length === 0) {
            throw new Error('Password must be a non-empty string');
        }
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    // Compare password with hashed password
    async comparePasswords(password, hashedPassword) {
        //validate inputs
        if (!password || !hashedPassword) {
            throw new Error('Both password and hashedPassword are required');
        }

        if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
            throw new Error('Both password and hashedPassword must be strings');
        }
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw new Error(`Password comparison failed: ${error.message}`);
        }
    }
}

module.exports = new AuthService();