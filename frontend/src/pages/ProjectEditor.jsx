import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjectStore } from '../store/projectStore';
import PoseGuide from '../components/PoseGuide';
import '../styles/project-editor.css';

const ProjectEditor = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const {
        currentProject,
        fetchProject,
        analyzeVideo,
        uploadReferencePhotos,
        generateFinalVideo,
        isLoading
    } = useProjectStore();

    const [step, setStep] = useState('upload'); // upload, analyzing, pose-guide, generate, complete
    const [selectedPhotos, setSelectedPhotos] = useState([]);

    useEffect(() => {
        fetchProject(projectId);
    }, [projectId]);

    const handleAnalyze = async () => {
        setStep('analyzing');
        try {
            await analyzeVideo(projectId);
            setStep('pose-guide');
        } catch (error) {
            console.error('Analysis failed:', error);
        }
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        setSelectedPhotos([...selectedPhotos, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
    };

    const handleGenerateVideo = async () => {
        setStep('generate');
        const formData = new FormData();
        selectedPhotos.forEach((photo) => {
            formData.append('photos', photo.file);
        });

        try {
            await uploadReferencePhotos(projectId, formData);
            await generateFinalVideo(projectId);
            setStep('complete');
        } catch (error) {
            console.error('Generation failed:', error);
        }
    };

    if (!currentProject) {
        return <div className="loading">Loading project...</div>;
    }

    return (
        <div className="project-editor-container">
            <div className="editor-header">
                <button onClick={() => navigate('/dashboard')}>&larr; Back</button>
                <h1>{currentProject.title}</h1>
                <div className="status-badge">{currentProject.status}</div>
            </div>

            <div className="editor-content">
                {step === 'upload' && (
                    <motion.div className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2>📹 Video Uploaded Successfully</h2>
                        <div className="video-preview">
                            <video src={currentProject.videoUrl} controls style={{ width: '100%', maxHeight: 400 }} />
                        </div>
                        <button onClick={handleAnalyze} disabled={isLoading} className="action-btn">
                            {isLoading ? 'Analyzing...' : 'Analyze Video →'}
                        </button>
                    </motion.div>
                )}

                {step === 'analyzing' && (
                    <motion.div className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="analyzing-state">
                            <div className="spinner"></div>
                            <h2>🤖 Analyzing Your Video</h2>
                            <p>Detecting poses, key frames, and edit points...</p>
                            <div className="progress-bar">
                                <motion.div className="progress-fill" animate={{ width: '100%' }} transition={{ duration: 10 }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'pose-guide' && currentProject.analysis && (
                    <motion.div className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <PoseGuide analysisData={currentProject.analysis} />
                        <div className="photos-upload-section">
                            <h2>📸 Upload Reference Photos</h2>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="upload-label">
                                Select Photos
                            </label>

                            {selectedPhotos.length > 0 && (
                                <div className="selected-photos">
                                    <h3>Selected Photos ({selectedPhotos.length})</h3>
                                    <div className="photos-grid">
                                        {selectedPhotos.map((photo, index) => (
                                            <div key={index} className="photo-item">
                                                <img src={photo.preview} alt={`Selected ${index + 1}`} />
                                                <button onClick={() => setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index))}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleGenerateVideo}
                                disabled={selectedPhotos.length === 0 || isLoading}
                                className="action-btn primary"
                            >
                                {isLoading ? 'Processing...' : 'Generate Final Video →'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'generate' && (
                    <motion.div className="step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="generating-state">
                            <div className="spinner"></div>
                            <h2>✨ Generating Your Video</h2>
                            <p>Integrating photos and rendering final video...</p>
                            <div className="progress-bar">
                                <motion.div className="progress-fill" animate={{ width: '100%' }} transition={{ duration: 15 }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'complete' && (
                    <motion.div className="step-container complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="success-message">
                            <div className="success-icon">✅</div>
                            <h2>Your Video is Ready!</h2>
                            {currentProject.outputVideoUrl && (
                                <div className="final-video">
                                    <video src={currentProject.outputVideoUrl} controls style={{ width: '100%', maxHeight: 400 }} />
                                    <a href={currentProject.outputVideoUrl} download className="download-btn">
                                        ⬇️ Download Video
                                    </a>
                                </div>
                            )}
                            <button onClick={() => navigate('/dashboard')} className="action-btn">
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProjectEditor;
