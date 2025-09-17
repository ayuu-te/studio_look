import express from 'express';
import { ApiResponse, LoginRequest, SignupRequest, User, AuthTokens } from '../types/index.js';

const router = express.Router();

// In-memory user store (replace with database in production)
const users: User[] = [
  {
    id: 'user-1',
    email: 'photographer@example.com',
    password: 'password123', // In real app, this would be hashed
    role: 'photographer',
    name: 'John Photographer',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user-2',
    email: 'client@example.com',
    password: 'password123',
    role: 'client',
    name: 'Jane Client',
    createdAt: new Date('2024-01-02')
  }
];

// In-memory token store (use Redis in production)
const tokens: Map<string, string> = new Map();

// Generate mock token
function generateToken(): string {
  return `token-${Math.random().toString(36).substr(2, 9)}`;
}

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  try {
    const { email, password, name, role }: SignupRequest = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, name, role'
      } as ApiResponse);
    }

    if (!['photographer', 'client'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either "photographer" or "client"'
      } as ApiResponse);
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      } as ApiResponse);
    }

    // Create new user
    const newUser: User = {
      id: `user-${users.length + 1}`,
      email,
      password, // In real app, hash this
      role,
      name,
      createdAt: new Date()
    };

    users.push(newUser);

    // Generate token
    const token = generateToken();
    tokens.set(token, newUser.id);

    const response: ApiResponse<{ user: Omit<User, 'password'>, token: string }> = {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name,
          createdAt: newUser.createdAt
        },
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse);
    }

    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
    }

    // Generate token
    const token = generateToken();
    tokens.set(token, user.id);

    const response: ApiResponse<{ user: Omit<User, 'password'>, token: string }> = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          createdAt: user.createdAt
        },
        token
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      tokens.delete(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      } as ApiResponse);
    }

    const userId = tokens.get(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    const response: ApiResponse<Omit<User, 'password'>> = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: user.createdAt
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
