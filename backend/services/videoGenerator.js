import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { uploadToS3 } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateVideo = async (videoUrl, referencePhotos, analysis) => {
    try {
        const projectId = `project-${Date.now()}`;
        const tempDir = path.join(__dirname, '..', 'temp', projectId);

        // Create temp directory
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Download original video
        const videoPath = path.join(tempDir, 'original.mp4');
        await downloadFile(videoUrl, videoPath);

        // Download and process reference photos
        const processedPhotos = [];
        for (let i = 0; i < referencePhotos.length && i < analysis.requiredPoses.length; i++) {
            const photoPath = path.join(tempDir, `photo-${i}.jpg`);
            await downloadFile(referencePhotos[i], photoPath);

            // Resize and optimize photo
            const processedPath = path.join(tempDir, `processed-${i}.jpg`);
            await sharp(photoPath)
                .resize(1280, 720, { fit: 'cover' })
                .toFile(processedPath);

            processedPhotos.push(processedPath);
            fs.unlinkSync(photoPath);
        }

        // Create simple output with overlays (simplified for containerized environment)
        const outputPath = path.join(tempDir, 'output.mp4');
        await createIntegratedVideo(videoPath, processedPhotos, analysis, outputPath);

        // Upload to S3
        const fileBuffer = fs.readFileSync(outputPath);
        const outputUrl = await uploadToS3(fileBuffer, `videos/${projectId}-output.mp4`, 'video/mp4');

        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });

        return outputUrl;
    } catch (error) {
        console.error('Video generation error:', error);
        throw error;
    }
};

const downloadFile = async (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', err => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

const createIntegratedVideo = async (videoPath, photosPaths, analysis, outputPath) => {
    return new Promise((resolve, reject) => {
        // For simplified containerized processing, we'll create a video with photo overlays
        // using a more reliable FFmpeg approach that works in containers
        
        try {
            const command = ffmpeg(videoPath);
            
            // Add input for each photo
            photosPaths.forEach(photoPath => {
                command.input(photoPath);
            });

            // Build a simpler filter that overlays photos at key timestamps
            // [0:v] = original video
            // [1:v], [2:v], etc = each photo input
            
            let filterComplex = '';
            
            photosPaths.forEach((_, index) => {
                const startTime = analysis.requiredPoses[index]?.frameNumber || index * 5;
                const duration = 2;
                
                // Scale photo to video resolution and overlay
                const photoIndex = index + 1;
                filterComplex += `[${photoIndex}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p[photo${index}];`;
            });
            
            // Combine all overlays with video
            filterComplex += '[0:v]';
            photosPaths.forEach((_, index) => {
                const startTime = analysis.requiredPoses[index]?.frameNumber || index * 5;
                filterComplex += `[photo${index}]overlay=0:0:enable='between(t,${startTime},${startTime + 2})'`;
                if (index < photosPaths.length - 1) {
                    filterComplex += ',';
                }
            });
            filterComplex += '[vout]';

            command
                .complexFilter(filterComplex, ['vout'])
                .output(outputPath)
                .format('mp4')
                .videoCodec('libx264')
                .audioCodec('aac')
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(err);
                })
                .on('end', () => {
                    console.log('Video generation completed');
                    resolve();
                })
                .run();
        } catch (error) {
            reject(error);
        }
    });
};
