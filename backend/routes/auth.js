import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { run, get } from '../database/init.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new AppError('Missing required fields', 400);
    }

    const existingUser = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await run(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [userId, name, email, hashedPassword]
    );

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
        user: { id: userId, name, email },
        token
    });
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Email and password required', 400);
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token
    });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
    const user = await get('SELECT id, name, email FROM users WHERE id = ?', [req.userId]);
    res.json(user);
});

export default router;
