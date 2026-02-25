import api from './api';

const commentService = {
    getComments: async (taskId) => {
        const response = await api.get(`/comments/${taskId}`);
        return response.data;
    },
    addComment: async (commentData) => {
        const response = await api.post('/comments', commentData);
        return response.data;
    },
    deleteComment: async (commentId) => {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },
};

export default commentService;
