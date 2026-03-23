import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import '../styles/auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, register, isLoading, error } = useAuthStore();
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = isSignup
            ? await register(formData.name, formData.email, formData.password)
            : await login(formData.email, formData.password);

        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <motion.div className="auth-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🎬 SMS AI Video Editor</h1>
                    <p>Transform Your Videos with AI</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="form-input"
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-input"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="form-input"
                        required
                    />

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={isLoading} className="auth-button">
                        {isLoading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-toggle">
                    <p>
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button onClick={() => setIsSignup(!isSignup)} className="toggle-btn">
                            {isSignup ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>

                <div className="features-list">
                    <h3>✨ Features</h3>
                    <ul>
                        <li>🤖 AI-powered video analysis</li>
                        <li>👤 Automatic pose detection</li>
                        <li>📸 Reference photo guidance</li>
                        <li>✂️ Seamless video integration</li>
                        <li>☁️ Cloud storage & processing</li>
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};

export default Login;
