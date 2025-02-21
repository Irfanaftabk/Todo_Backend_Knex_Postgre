const db = require('../../database/connection');
const authService = require('../services/authService');

class AuthController {
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide username, email and password'
                });
            }

            // Check if user already exists
            const existingUser = await db('users')
                .where('email', email)
                .orWhere('username', username)
                .first();

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }

            // Hash password
            const hashedPassword = await authService.hashPassword(password);

            // Create user
            const [newUser] = await db('users').insert({
                username,
                email,
                password: hashedPassword
            }).returning(['id', 'username', 'email']);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email
                    }
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error registering user'
            });
        }
    }
// login api method
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }

            // Find user
            const user = await db('users')
                .where('email', email)
                .first();

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Verify password
            const isValidPassword = await authService.comparePasswords(
                password,
                user.password
            );

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate token
            const token = authService.generateToken(user);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Error logging in'
            });
        }
    }
}

module.exports = new AuthController();