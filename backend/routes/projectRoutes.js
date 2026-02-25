const express = require('express');
const { getProjects, createProject, deleteProject, addMember } = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .delete(protect, deleteProject);

router.route('/:id/members')
    .post(protect, addMember);

module.exports = router;
