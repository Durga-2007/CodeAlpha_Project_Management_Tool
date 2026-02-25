const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get comments for a task
// @route   GET /api/comments/:taskId
// @access  Private
const getComments = async (req, res) => {
    const comments = await Comment.find({ taskId: req.params.taskId })
        .populate('userId', 'name email')
        .sort({ createdAt: 1 });

    res.json(comments);
};

// @desc    Add a comment
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
    const { taskId, message } = req.body;

    const comment = new Comment({
        taskId,
        userId: req.user._id,
        message,
    });

    const createdComment = await comment.save();
    const populatedComment = await createdComment.populate('userId', 'name email');

    // Notify task creator and assigned user
    const task = await Task.findById(taskId);
    if (task) {
        const io = req.app.get('socketio');

        // Emit to the project room
        io.to(task.projectId.toString()).emit('commentAdded', { taskId, comment: populatedComment });

        // Notify task creator if not the one commenting
        if (task.createdBy.toString() !== req.user._id.toString()) {
            await Notification.create({
                userId: task.createdBy,
                message: `${req.user.name} commented on your task: ${task.title}`,
            });
            io.to(task.createdBy.toString()).emit('notification', { message: `${req.user.name} commented on your task: ${task.title}` });
        }

        // Notify assigned user if not the one commenting
        if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString() && task.assignedTo.toString() !== task.createdBy.toString()) {
            await Notification.create({
                userId: task.assignedTo,
                message: `${req.user.name} commented on a task assigned to you: ${task.title}`,
            });
            io.to(task.assignedTo.toString()).emit('notification', { message: `${req.user.name} commented on a task assigned to you: ${task.title}` });
        }
    }

    res.status(201).json(populatedComment);
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (comment) {
        if (comment.userId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized to delete this comment');
        }

        await Comment.deleteOne({ _id: comment._id });
        res.json({ message: 'Comment removed' });
    } else {
        res.status(404);
        throw new Error('Comment not found');
    }
};

module.exports = {
    getComments,
    addComment,
    deleteComment,
};
