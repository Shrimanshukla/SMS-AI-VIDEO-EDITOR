import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new AppError('No token provided', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        throw new AppError('Invalid or expired token', 401);
    }
};
