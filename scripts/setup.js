#!/usr/bin/env node

import fs from 'fs';
import readline from 'readline';
import { execSync } from 'child_process';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (prompt) => {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
};

const hidden = (prompt) => {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
};

async function setup() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  SMS AI-Powered Video Editor - Setup Script               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    let shouldReconfigure = true;
    if (fs.existsSync('.env')) {
        console.log('✓ .env file already exists');
        const reconfigure = await question('Do you want to reconfigure? (y/n): ');
        shouldReconfigure = reconfigure.toLowerCase() === 'y';
    }

    if (!shouldReconfigure) {
        console.log('Keeping existing configuration');
        rl.close();
        return;
    }

    console.log('');
    console.log('AWS S3 Configuration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    let awsRegion = await question('AWS Region (default: us-east-1): ');
    awsRegion = awsRegion || 'us-east-1';

    let awsAccessKeyId = await question('AWS Access Key ID: ');
    while (!awsAccessKeyId) {
        console.log('✗ AWS Access Key ID is required');
        awsAccessKeyId = await question('AWS Access Key ID: ');
    }

    let awsSecretAccessKey = await hidden('AWS Secret Access Key: ');
    while (!awsSecretAccessKey) {
        console.log('✗ AWS Secret Access Key is required');
        awsSecretAccessKey = await hidden('AWS Secret Access Key: ');
    }
    console.log('');

    let awsS3BucketName = await question('AWS S3 Bucket Name: ');
    while (!awsS3BucketName) {
        console.log('✗ S3 Bucket Name is required');
        awsS3BucketName = await question('AWS S3 Bucket Name: ');
    }

    console.log('');
    console.log('JWT Configuration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    let jwtSecret = await question('JWT Secret (leave blank to auto-generate): ');
    if (!jwtSecret) {
        try {
            jwtSecret = execSync('openssl rand -base64 32', { encoding: 'utf-8' }).trim();
            console.log('✓ Generated JWT Secret');
        } catch {
            // Fallback if openssl not available
            jwtSecret = generateRandomString(32);
            console.log('✓ Generated JWT Secret');
        }
    }

    // Create .env file
    const envContent = `# Environment Configuration
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=./data/sms-video-editor.db

# JWT
JWT_SECRET=${jwtSecret}

# AWS Configuration
AWS_REGION=${awsRegion}
AWS_ACCESS_KEY_ID=${awsAccessKeyId}
AWS_SECRET_ACCESS_KEY=${awsSecretAccessKey}
AWS_S3_BUCKET_NAME=${awsS3BucketName}
`;

    fs.writeFileSync('.env', envContent);

    console.log('');
    console.log('✓ Configuration saved to .env');
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Setup Complete!                                           ║');
    console.log('║  Run: npm start                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    rl.close();
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

setup().catch(console.error);
