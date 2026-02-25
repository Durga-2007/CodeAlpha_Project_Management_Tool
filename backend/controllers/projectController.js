const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({
        $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).populate('members', 'name email');

    res.json(projects);
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const { title, description, members } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Project title is required');
    }

    const project = new Project({
        title,
        description,
        createdBy: req.user._id,
        members: members || [],
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
});

// @desc    Add a member to a project
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const project = await Project.findById(req.params.id);

    if (project) {
        // Check if user is creator or already a member with admin rights
        if (project.createdBy.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Only project creator can add members');
        }

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            res.status(404);
            throw new Error('User not found with this email');
        }

        if (project.members.includes(userToAdd._id)) {
            res.status(400);
            throw new Error('User is already a member of this project');
        }

        project.members.push(userToAdd._id);
        await project.save();

        const updatedProject = await Project.findById(project._id).populate('members', 'name email');
        res.json(updatedProject);
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized to delete this project');
        }

        await Project.deleteOne({ _id: project._id });
        res.json({ message: 'Project removed' });
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

module.exports = {
    getProjects,
    createProject,
    deleteProject,
    addMember,
};
