import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

export const useProjectStore = create((set, get) => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    analysisProgress: 0,

    fetchProjects: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/projects`);
            set({ projects: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    createProject: async (formData) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/projects`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            set((state) => ({
                projects: [...state.projects, response.data],
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    fetchProject: async (projectId) => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}`);
            set({ currentProject: response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    analyzeVideo: async (projectId) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/projects/${projectId}/analyze`);
            set({ currentProject: response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    uploadReferencePhotos: async (projectId, formData) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(
                `${API_URL}/projects/${projectId}/upload-photos`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            set({ currentProject: response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    generateFinalVideo: async (projectId) => {
        set({ isLoading: true });
        try {
            const response = await axios.post(`${API_URL}/projects/${projectId}/generate`);
            set({ currentProject: response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteProject: async (projectId) => {
        try {
            await axios.delete(`${API_URL}/projects/${projectId}`);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== projectId)
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    }
}));
