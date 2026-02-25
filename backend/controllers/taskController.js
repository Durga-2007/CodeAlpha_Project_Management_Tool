const Task = require('../models/Task');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get tasks for a project
// @route   GET /api/tasks/:projectId
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({ projectId: req.params.projectId })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name');

    res.json(tasks);
});

const createTask = asyncHandler(async (req, res) => {
    const { title, description, projectId, column, assignedTo, priority, dueDate } = req.body;

    const task = new Task({
        title,
        description,
        projectId,
        column: column || 'Todo',
        assignedTo: assignedTo || null,
        priority: priority || 'Medium',
        dueDate: dueDate || null,
        createdBy: req.user._id,
    });

    const createdTask = await task.save();

    // Notify assigned user if exists and not the creator
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
        const notification = await Notification.create({
            userId: assignedTo,
            message: `You have been assigned a new task: ${title}`,
        });

        const io = req.app.get('socketio');
        if (io) io.to(assignedTo.toString()).emit('notification', notification);
    }

    // Socket update for the project room
    const io = req.app.get('socketio');
    if (io) io.to(projectId.toString()).emit('taskCreated', createdTask);

    res.status(201).json(createdTask);
});

const updateTask = asyncHandler(async (req, res) => {
    const { title, description, column, assignedTo, priority, dueDate } = req.body;

    const task = await Task.findById(req.params.id);

    if (task) {
        const oldColumn = task.column;

        task.title = title || task.title;
        task.description = description || task.description;
        task.column = column || task.column;
        task.assignedTo = assignedTo === '' ? null : (assignedTo || task.assignedTo);
        task.priority = priority || task.priority;
        task.dueDate = dueDate === '' ? null : (dueDate || task.dueDate);

        const updatedTask = await task.save();

        const io = req.app.get('socketio');

        // Notify if moved columns
        if (io && column && column !== oldColumn) {
            io.to(task.projectId.toString()).emit('taskMoved', updatedTask);

            // Notify creator if someone else moved it
            if (task.createdBy.toString() !== req.user._id.toString()) {
                await Notification.create({
                    userId: task.createdBy,
                    message: `Task "${task.title}" was moved to ${column}`,
                });
                io.to(task.createdBy.toString()).emit('notification', { message: `Task "${task.title}" was moved to ${column}` });
            }
        } else if (io) {
            io.to(task.projectId.toString()).emit('taskUpdated', updatedTask);
        }

        res.json(updatedTask);
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});

const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        const projectId = task.projectId;
        await Task.deleteOne({ _id: task._id });

        const io = req.app.get('socketio');
        if (io) io.to(projectId.toString()).emit('taskDeleted', req.params.id);

        res.json({ message: 'Task removed' });
    } else {
        res.status(404);
        throw new Error('Task not found');
    }
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};
