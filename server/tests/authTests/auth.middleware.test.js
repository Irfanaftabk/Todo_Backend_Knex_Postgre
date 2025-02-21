// authMiddleware.test.js

const jwt = require('jsonwebtoken');
const authMiddleware = require('../../auth/middleware/authMiddleware');

// Mock response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Authentication Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        // Reset mocks before each test
        mockReq = {};
        mockRes = mockResponse();
        nextFunction = jest.fn();
        process.env.JWT_SECRET = 'test-secret';
    });

    // Test 1: Valid token scenario
    it('should pass and call next() with valid token', async () => {
        // Create a valid token
        const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
        
        // Mock request with valid token
        mockReq.header = jest.fn().mockReturnValue(`Bearer ${validToken}`);

        await authMiddleware(mockReq, mockRes, nextFunction);

        // Assert next was called
        expect(nextFunction).toHaveBeenCalled();
        
        // Assert user object was set in request
        expect(mockReq.user).toBeDefined();
        expect(mockReq.user.userId).toBe(1);
    });

    // Test 2: Missing token scenario
    it('should return 401 when no token is provided', async () => {
        // Mock request with no token
        mockReq.header = jest.fn().mockReturnValue(undefined);

        await authMiddleware(mockReq, mockRes, nextFunction);

        // Assert response
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'No authentication token provided'
        });
        
        // Assert next was not called
        expect(nextFunction).not.toHaveBeenCalled();
    });

    // Test 3: Invalid token format
    it('should return 401 when token format is invalid', async () => {
        // Mock request with invalid token format
        mockReq.header = jest.fn().mockReturnValue('InvalidTokenFormat');

        await authMiddleware(mockReq, mockRes, nextFunction);

        // Assert response
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid authentication token'
        });
        
        // Assert next was not called
        expect(nextFunction).not.toHaveBeenCalled();
    });

    // Test 4: Expired token scenario
    it('should return 401 when token is expired', async () => {
        // Create an expired token
        const expiredToken = jwt.sign(
            { userId: 1 },
            process.env.JWT_SECRET,
            { expiresIn: '0s' } // Token expires immediately
        );

        // Mock request with expired token
        mockReq.header = jest.fn().mockReturnValue(`Bearer ${expiredToken}`);

        await authMiddleware(mockReq, mockRes, nextFunction);

        // Assert response
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid authentication token'
        });
        
        // Assert next was not called
        expect(nextFunction).not.toHaveBeenCalled();
    });

    // Test 5: Invalid signature
    it('should return 401 when token signature is invalid', async () => {
        // Create token with different secret
        const invalidToken = jwt.sign(
            { userId: 1 },
            'different-secret'
        );

        // Mock request with invalid token
        mockReq.header = jest.fn().mockReturnValue(`Bearer ${invalidToken}`);

        await authMiddleware(mockReq, mockRes, nextFunction);

        // Assert response
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid authentication token'
        });
        
        // Assert next was not called
        expect(nextFunction).not.toHaveBeenCalled();
    });

    // Test 6: Empty Bearer token
    it('should return 401 when Bearer token is empty', async () => {
        // Mock request with empty Bearer token
        mockReq.header = jest.fn().mockReturnValue('Bearer ');

        await authMiddleware(mockReq, mockRes, nextFunction);

        // Assert response
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'No authentication token provided'
        });
        
        // Assert next was not called
        expect(nextFunction).not.toHaveBeenCalled();
    });

    // Test 7: Malformed JWT token
    it('should return 401 when JWT token is malformed', async () => {
        // Mock request with malformed token
        mockReq.header = jest.fn().mockReturnValue('Bearer malformed.jwt.token');

        await authMiddleware(mockReq, mockRes, nextFunction);

        // Assert response
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid authentication token'
        });
        
        // Assert next was not called
        expect(nextFunction).not.toHaveBeenCalled();
    });

    // Test 8: Token with correct structure but invalid content
    it('should return 401 when token has valid structure but invalid content', async () => {
        // Create a token with valid structure but tampered content
        const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                            'eyJpbnZhbGlkIjoiY29udGVudCJ9.' +
                            'invalid_signature';

        // Mock request with tampered token
        mockReq.header = jest.fn().mockReturnValue(`Bearer ${tamperedToken}`);

        await authMiddleware(mockReq, mockRes, nextFunction);

        // Assert response
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid authentication token'
        });
        
        // Assert next was not called
        expect(nextFunction).not.toHaveBeenCalled();
    });
});