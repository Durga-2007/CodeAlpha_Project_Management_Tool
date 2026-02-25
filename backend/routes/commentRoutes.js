const express = require('express');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, addComment);

router.route('/:taskId')
    .get(protect, getComments);

router.route('/:id')
    .delete(protect, deleteComment);

module.exports = router;
