// Import required dependencies
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AuthService = require('../../auth/services/authService');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

describe('AuthService', () => {
    // Test data
    const mockUser = {
        id: 1,
        username: 'testuser'
    };
    const mockPassword = 'Test123!@#';

    describe('generateToken', () => {
        // Test token generation with valid user data
        test('should generate a valid JWT token with correct payload', () => {
            // Act
            const token = AuthService.generateToken(mockUser);
            
            // Assert
            expect(token).toBeDefined();
            
            // Verify token contents
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.id).toBe(mockUser.id);
            expect(decoded.username).toBe(mockUser.username);
        });

        // Test token expiration
        test('should generate token with 24h expiration', () => {
            // Act
            const token = AuthService.generateToken(mockUser);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Assert
            // Check if expiration time is set to approximately 24 hours (with 1 minute tolerance)
            const expectedExp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
            expect(decoded.exp).toBeCloseTo(expectedExp, -2);
        });

        // Test error handling
        test('should throw error for invalid user data', () => {
            // Assert
            expect(() => AuthService.generateToken(null)).toThrow();
            expect(() => AuthService.generateToken(undefined)).toThrow();
        });
    });

    describe('hashPassword', () => {
        // Test password hashing
        test('should hash password correctly', async () => {
            // Act
            const hashedPassword = await AuthService.hashPassword(mockPassword);
            
            // Assert
            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(mockPassword);
            expect(hashedPassword.length).toBeGreaterThan(0);
        });

        // Test different passwords produce different hashes
        test('should generate different hashes for different passwords', async () => {
            // Act
            const hash1 = await AuthService.hashPassword('password1');
            const hash2 = await AuthService.hashPassword('password2');
            
            // Assert
            expect(hash1).not.toBe(hash2);
        });

        // Test error handling
        test('should throw error for invalid password input', async () => {
            // Assert
            await expect(AuthService.hashPassword('')).rejects.toThrow();
            await expect(AuthService.hashPassword(null)).rejects.toThrow();
            await expect(AuthService.hashPassword(undefined)).rejects.toThrow();
        });
    });

    describe('comparePasswords', () => {
        // Test successful password comparison
        test('should return true for matching passwords', async () => {
            // Arrange
            const hashedPassword = await AuthService.hashPassword(mockPassword);
            
            // Act
            const isMatch = await AuthService.comparePasswords(mockPassword, hashedPassword);
            
            // Assert
            expect(isMatch).toBe(true);
        });

        // Test failed password comparison
        test('should return false for non-matching passwords', async () => {
            // Arrange
            const hashedPassword = await AuthService.hashPassword(mockPassword);
            
            // Act
            const isMatch = await AuthService.comparePasswords('wrongpassword', hashedPassword);
            
            // Assert
            expect(isMatch).toBe(false);
        });

        // Test error handling
        test('should throw error for invalid inputs', async () => {
            // Arrange
            const hashedPassword = await AuthService.hashPassword(mockPassword);
            
            // Assert
            await expect(AuthService.comparePasswords(null, hashedPassword)).rejects
            .toThrow('Both password and hashedPassword are required');
        
        await expect(AuthService.comparePasswords(123, hashedPassword)).rejects
            .toThrow('Both password and hashedPassword must be strings');
        });
    });
});