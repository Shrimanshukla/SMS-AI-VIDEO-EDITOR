import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
            return false;
        }
    },

    register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                set({ user: response.data, token });
            } catch {
                localStorage.removeItem('token');
                set({ user: null, token: null });
            }
        }
    }
}));

// Setup axios interceptor
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
