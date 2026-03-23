import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import VideoUpload from '../components/VideoUpload';
import '../styles/dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { projects, fetchProjects, createProject, deleteProject, isLoading } = useProjectStore();
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleVideoUpload = async (file) => {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

        try {
            const project = await createProject(formData);
            navigate(`/project/${project.id}`);
        } catch (error) {
            alert('Upload failed: ' + error.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>🎬 SMS AI Video Editor</h1>
                    <p>Welcome, {user?.name}!</p>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </header>

            <div className="dashboard-main">
                {!showUpload ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="start-section">
                            <h2>Get Started</h2>
                            <button onClick={() => setShowUpload(true)} className="upload-trigger-btn">
                                <span className="icon">🎬</span>
                                <span>Create New Project</span>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <button onClick={() => setShowUpload(false)} className="back-btn">
                            ← Back
                        </button>
                        <VideoUpload onUpload={handleVideoUpload} isLoading={isLoading} />
                    </motion.div>
                )}

                {projects.length > 0 && (
                    <motion.div className="projects-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2>📁 Your Projects</h2>
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    className="project-card"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="project-thumbnail">
                                        {project.thumbnailUrl ? (
                                            <img src={project.thumbnailUrl} alt={project.title} />
                                        ) : (
                                            <div className="placeholder">🎬</div>
                                        )}
                                    </div>
                                    <div className="project-info">
                                        <h3>{project.title}</h3>
                                        <p className="status">{project.status}</p>
                                        <p className="timestamp">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="project-actions">
                                        <button
                                            onClick={() => navigate(`/project/${project.id}`)}
                                            className="edit-btn"
                                        >
                                            Continue
                                        </button>
                                        <button
                                            onClick={() => deleteProject(project.id)}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
