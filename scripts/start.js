#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

async function start() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  SMS AI-Powered Video Editor - Docker Deployment          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    // Check if Docker is installed
    try {
        execSync('docker --version', { stdio: 'ignore' });
    } catch {
        console.log('✗ Docker is not installed. Please install Docker Desktop from https://www.docker.com');
        process.exit(1);
    }

    // Check if .env exists
    if (!fs.existsSync('.env')) {
        console.log('✗ .env file not found');
        console.log('Run: npm run setup');
        process.exit(1);
    }

    console.log('Starting Docker containers...');
    console.log('');

    try {
        execSync('docker-compose up -d', { stdio: 'inherit' });

        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║  Deployment Started!                                       ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log('║  Frontend: http://localhost:3000                           ║');
        console.log('║  Backend:  http://localhost:5000/api/health               ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('View logs: npm run logs');
        console.log('Stop containers: npm run stop');
        console.log('');
    } catch (error) {
        console.error('Failed to start containers:', error.message);
        process.exit(1);
    }
}

start();
