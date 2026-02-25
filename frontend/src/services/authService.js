import api from './api';

const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    login: async (userData) => {
        const response = await api.post('/auth/login', userData);
        return response.data;
    },
};

export default authService;
