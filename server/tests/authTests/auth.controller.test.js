const request = require('supertest');
const app = require('../../server'); // Adjust based on your actual Express app path
const db = require('../../database/connection');
const authService = require('../../auth/services/authService');

jest.mock('../../database/connection'); // Mock Knex instance
jest.mock('../../auth/services/authService'); // Mock authService

describe('AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            // Properly mock Knex query chaining
            const mockInsert = jest.fn().mockReturnThis(); // Return "this" for chaining
            const mockReturning = jest.fn().mockResolvedValue([{ id: 1, username: 'testuser', email: 'test@example.com' }]);

            db.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                orWhere: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue(null), // No existing user
                insert: mockInsert,
                returning: mockReturning,
            });

            authService.hashPassword.mockResolvedValue('hashedpassword');

            const res = await request(app)
                .post('/auth/register')
                .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(expect.objectContaining({
                success: true,
                message: 'User registered successfully',
                data: expect.any(Object)
            }));
        });

        it('should return 400 if user already exists', async () => {
            db.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                orWhere: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }) // User exists
            });

            const res = await request(app)
                .post('/auth/register')
                .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });
    });
// /login tests
    describe('POST /auth/login', () => {
        it('should login successfully', async () => {
            db.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue({ id: 1, username: 'testuser', email: 'test@example.com', password: 'hashedpassword' })
            });

            authService.comparePasswords.mockResolvedValue(true);
            authService.generateToken.mockReturnValue('fake-jwt-token');

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                success: true,
                message: 'Login successful',
                data: expect.objectContaining({ token: 'fake-jwt-token' })
            }));
        });

        it('should return 401 for invalid credentials', async () => {
            db.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue({ id: 1, username: 'testuser', email: 'test@example.com', password: 'hashedpassword' })
            });

            authService.comparePasswords.mockResolvedValue(false);

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });
});
