import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import '../styles/video-upload.css';

const VideoUpload = ({ onUpload, isLoading }) => {
    const onDrop = useCallback(
        (acceptedFiles) => {
            const videoFile = acceptedFiles.find((file) => file.type.startsWith('video/'));
            if (videoFile) {
                onUpload(videoFile);
            }
        },
        [onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv'] }
    });

    return (
        <motion.div
            className={`upload-container ${isDragActive ? 'active' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            {...getRootProps()}
        >
            <input {...getInputProps()} />
            <div className="upload-content">
                <div className="upload-icon">🎬</div>
                <h3>Upload Your Video</h3>
                <p>Drag and drop your video file here or click to browse</p>
                <p className="file-formats">Supported: MP4, MOV, AVI, MKV</p>
                {isLoading && <div className="loading">Uploading and analyzing...</div>}
            </div>
        </motion.div>
    );
};

export default VideoUpload;
