import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Interceptor to add auth token if it exists in localStorage
api.interceptors.request.use((config) => {
    const savedUser = localStorage.getItem('taskflow_user');
    if (savedUser) {
        const { token } = JSON.parse(savedUser);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
