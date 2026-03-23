import React from 'react';
import { motion } from 'framer-motion';
import '../styles/pose-guide.css';

const PoseGuide = ({ analysisData }) => {
    if (!analysisData || !analysisData.requiredPoses) {
        return null;
    }

    return (
        <motion.div
            className="pose-guide-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2>📸 Reference Photos Needed</h2>
            <p className="guide-subtitle">Upload photos matching these poses and angles:</p>

            <div className="poses-grid">
                {analysisData.requiredPoses.map((pose, index) => (
                    <motion.div
                        key={index}
                        className="pose-card"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="pose-number">{index + 1}</div>
                        <div className="pose-info">
                            <h4>{pose.description}</h4>
                            <div className="pose-details">
                                <p><strong>Frame:</strong> {pose.frameNumber}</p>
                                <p><strong>Time:</strong> {pose.timestamp}</p>
                                <p><strong>Angle:</strong> {pose.angle || 'Front view'}</p>
                                <p><strong>Expression:</strong> {pose.expression || 'Neutral'}</p>
                            </div>
                            <div className="confidence">
                                <div className="confidence-bar">
                                    <div
                                        className="confidence-fill"
                                        style={{ width: `${pose.confidence * 100}%` }}
                                    ></div>
                                </div>
                                <small>{(pose.confidence * 100).toFixed(1)}% match</small>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="tips-section">
                <h3>💡 Photography Tips</h3>
                <ul>
                    <li>Use good lighting to match the original video</li>
                    <li>Maintain consistent background (prefer matching original)</li>
                    <li>Take multiple shots from different angles for best results</li>
                    <li>Match clothing if possible to the original video</li>
                    <li>Use the same camera or similar resolution</li>
                </ul>
            </div>
        </motion.div>
    );
};

export default PoseGuide;
