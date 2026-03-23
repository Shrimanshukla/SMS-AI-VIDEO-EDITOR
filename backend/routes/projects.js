import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { run, get, all } from '../database/init.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { analyzeVideo } from '../services/videoAnalyzer.js';
import { generateVideo } from '../services/videoGenerator.js';
import { uploadToS3 } from '../services/storage.js';

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video') {
            if (file.mimetype.startsWith('video/')) {
                cb(null, true);
            } else {
                cb(new AppError('Only video files allowed', 400));
            }
        } else if (file.fieldname === 'photos') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new AppError('Only image files allowed', 400));
            }
        } else {
            cb(null, true);
        }
    }
});

// Get all projects for user
router.get('/', authenticate, async (req, res) => {
    const projects = await all('SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC', [req.userId]);
    res.json(projects.map(p => ({
        ...p,
        analysis: p.analysis ? JSON.parse(p.analysis) : null,
        referencePhotos: p.referencePhotos ? JSON.parse(p.referencePhotos) : []
    })));
});

// Create project (upload video)
router.post('/', authenticate, upload.single('video'), async (req, res) => {
    if (!req.file) {
        throw new AppError('No video file provided', 400);
    }

    const projectId = uuidv4();
    const { title = 'Untitled Project' } = req.body;

    try {
        // Upload to S3
        const videoUrl = await uploadToS3(req.file.buffer, `videos/${projectId}.mp4`, req.file.mimetype);

        // Save project to database
        await run(
            `INSERT INTO projects (id, userId, title, videoUrl, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [projectId, req.userId, title, videoUrl, 'uploaded']
        );

        res.status(201).json({
            id: projectId,
            userId: req.userId,
            title,
            videoUrl,
            status: 'uploaded',
            analysis: null,
            referencePhotos: [],
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        throw new AppError('Failed to upload video: ' + error.message, 500);
    }
});

// Get project details
router.get('/:projectId', authenticate, async (req, res) => {
    const project = await get('SELECT * FROM projects WHERE id = ? AND userId = ?', [
        req.params.projectId,
        req.userId
    ]);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    res.json({
        ...project,
        analysis: project.analysis ? JSON.parse(project.analysis) : null,
        referencePhotos: project.referencePhotos ? JSON.parse(project.referencePhotos) : []
    });
});

// Analyze video
router.post('/:projectId/analyze', authenticate, async (req, res) => {
    const project = await get('SELECT * FROM projects WHERE id = ? AND userId = ?', [
        req.params.projectId,
        req.userId
    ]);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    try {
        // Analyze video using MediaPipe and OpenCV
        const analysis = await analyzeVideo(project.videoUrl);

        await run(
            'UPDATE projects SET analysis = ?, status = ?, updatedAt = datetime("now") WHERE id = ?',
            [JSON.stringify(analysis), 'analyzed', req.params.projectId]
        );

        res.json({
            ...project,
            analysis,
            status: 'analyzed'
        });
    } catch (error) {
        throw new AppError('Video analysis failed: ' + error.message, 500);
    }
});

// Upload reference photos
router.post('/:projectId/upload-photos', authenticate, upload.array('photos'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new AppError('No photos provided', 400);
    }

    const project = await get('SELECT * FROM projects WHERE id = ? AND userId = ?', [
        req.params.projectId,
        req.userId
    ]);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    try {
        const photos = [];

        for (const file of req.files) {
            const photoUrl = await uploadToS3(file.buffer, `photos/${req.params.projectId}/${uuidv4()}.jpg`, file.mimetype);
            photos.push(photoUrl);
        }

        const referencePhotos = [...(project.referencePhotos ? JSON.parse(project.referencePhotos) : []), ...photos];

        await run(
            'UPDATE projects SET referencePhotos = ?, updatedAt = datetime("now") WHERE id = ?',
            [JSON.stringify(referencePhotos), req.params.projectId]
        );

        res.json({
            ...project,
            referencePhotos,
            analysis: project.analysis ? JSON.parse(project.analysis) : null
        });
    } catch (error) {
        throw new AppError('Photo upload failed: ' + error.message, 500);
    }
});

// Generate final video
router.post('/:projectId/generate', authenticate, async (req, res) => {
    const project = await get('SELECT * FROM projects WHERE id = ? AND userId = ?', [
        req.params.projectId,
        req.userId
    ]);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    const analysis = JSON.parse(project.analysis || '{}');
    const referencePhotos = JSON.parse(project.referencePhotos || '[]');

    if (!analysis.requiredPoses || referencePhotos.length === 0) {
        throw new AppError('Missing analysis or reference photos', 400);
    }

    try {
        // Generate video with integrated photos
        const outputVideoUrl = await generateVideo(project.videoUrl, referencePhotos, analysis);

        await run(
            'UPDATE projects SET outputVideoUrl = ?, status = ?, updatedAt = datetime("now") WHERE id = ?',
            [outputVideoUrl, 'complete', req.params.projectId]
        );

        res.json({
            ...project,
            outputVideoUrl,
            status: 'complete',
            analysis,
            referencePhotos
        });
    } catch (error) {
        throw new AppError('Video generation failed: ' + error.message, 500);
    }
});

// Delete project
router.delete('/:projectId', authenticate, async (req, res) => {
    const project = await get('SELECT * FROM projects WHERE id = ? AND userId = ?', [
        req.params.projectId,
        req.userId
    ]);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    await run('DELETE FROM projects WHERE id = ?', [req.params.projectId]);

    res.json({ message: 'Project deleted' });
});

export default router;
