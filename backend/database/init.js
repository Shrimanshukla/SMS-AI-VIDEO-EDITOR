import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use environment variable or default to ./data directory
const dbDir = process.env.DATABASE_URL ? path.dirname(process.env.DATABASE_URL) : path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DATABASE_URL || path.join(dbDir, 'sms-video-editor.db');

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db;

export const getDatabase = () => db;

export const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Database connection error:', err);
                reject(err);
            } else {
                console.log('✓ Database initialized');
                createTables();
                resolve(db);
            }
        });
    });
};

export const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

export const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

export const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
};

const createTables = async () => {
    try {
        // Users table
        await run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Projects table
        await run(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                title TEXT NOT NULL,
                videoUrl TEXT NOT NULL,
                status TEXT DEFAULT 'uploading',
                thumbnailUrl TEXT,
                analysis TEXT,
                referencePhotos TEXT,
                outputVideoUrl TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `);

        // Analysis data table
        await run(`
            CREATE TABLE IF NOT EXISTS analysis (
                id TEXT PRIMARY KEY,
                projectId TEXT NOT NULL,
                poses TEXT,
                keyFrames TEXT,
                metadata TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (projectId) REFERENCES projects(id)
            )
        `);

        console.log('✓ Database tables created');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};
