import { useState, useEffect } from 'react';
import { X, Calendar, User, AlignLeft, Send, Trash2, Clock, AlertTriangle } from 'lucide-react';
import commentService from '../services/commentService';
import taskService from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const TaskModal = ({ task, project, onClose, onUpdate, onDelete }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({ ...task });
    const { user } = useAuth();
    const socket = useSocket();

    useEffect(() => {
        fetchComments();
        if (socket) {
            socket.on('commentAdded', ({ taskId, comment }) => {
                if (taskId === task._id) {
                    setComments((prev) => [...prev, comment]);
                }
            });
            return () => socket.off('commentAdded');
        }
    }, [task._id, socket]);

    const fetchComments = async () => {
        try {
            const data = await commentService.getComments(task._id);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const added = await commentService.addComment({ taskId: task._id, message: newComment });
            setComments([...comments, added]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment', error);
        }
    };

    const handleDeleteComment = async (id) => {
        try {
            await commentService.deleteComment(id);
            setComments(comments.filter(c => c._id !== id));
        } catch (error) {
            console.error('Failed to delete comment', error);
        }
    };

    const handleUpdate = async () => {
        try {
            const updated = await taskService.updateTask(task._id, editedTask);
            onUpdate(updated);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    const priorityColors = {
        Low: 'bg-green-100 text-green-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        High: 'bg-red-100 text-red-700',
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 lg:p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div className="flex-1 mr-8">
                        {isEditing ? (
                            <input
                                type="text"
                                className="text-2xl font-black text-gray-900 bg-white border border-gray-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                value={editedTask.title}
                                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                            />
                        ) : (
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{task.title}</h2>
                        )}
                        <div className="flex items-center space-x-4 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${priorityColors[task.priority]}`}>
                                {task.priority} Priority
                            </span>
                            <span className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest pl-4 border-l border-gray-200">
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                {task.column}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-3 text-gray-500 hover:text-primary-600 hover:bg-white rounded-2xl transition-all shadow-sm hover:shadow-md"
                            >
                                Edit
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-3 bg-white text-gray-400 hover:text-gray-600 rounded-2xl shadow-sm hover:shadow-md transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Main Info */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 border-r border-gray-50">
                        {/* Description */}
                        <div className="space-y-4">
                            <div className="flex items-center text-gray-900 font-bold uppercase tracking-wider text-xs">
                                <AlignLeft className="w-4 h-4 mr-2 text-primary-500" />
                                Description
                            </div>
                            {isEditing ? (
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium min-h-[150px] resize-none"
                                    value={editedTask.description}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                />
                            ) : (
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    {task.description || 'No description provided.'}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        {isEditing && (
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-primary-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-100 text-gray-600 font-bold py-3 px-8 rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {isEditing && (
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center text-gray-900 font-bold uppercase tracking-wider text-xs">
                                    <User className="w-4 h-4 mr-2 text-primary-500" />
                                    Change Assignee
                                </div>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none"
                                    value={editedTask.assignedTo || ''}
                                    onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {project?.members?.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Danger Zone */}
                        <div className="pt-10 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this task?')) {
                                        onDelete(task._id);
                                        onClose();
                                    }
                                }}
                                className="flex items-center text-red-500 text-xs font-bold uppercase tracking-wider hover:text-red-600 group transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Delete Task
                            </button>
                        </div>
                    </div>

                    {/* Side Info / Comments */}
                    <div className="w-full lg:w-96 flex flex-col bg-gray-50/30 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-widest">
                                    <User className="w-4 h-4 mr-2 text-primary-500" />
                                    Assigned To
                                </div>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold mr-2">
                                        {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{task.assignedTo?.name || 'Unassigned'}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-xs font-bold text-gray-700 uppercase tracking-widest">
                                    <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                                    Due Date
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}
                                </span>
                            </div>
                        </div>

                        {/* Comments Area */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Activity</h3>
                                <span className="text-[10px] font-bold text-primary-600 px-2 py-0.5 bg-primary-50 rounded-full">{comments.length}</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex space-x-3 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 text-[10px] font-bold flex-shrink-0">
                                            {comment.userId?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 group relative">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-gray-900">{comment.userId?.name}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">{comment.message}</p>
                                            {comment.userId?._id === user?._id && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className="text-center py-10 opacity-30 italic text-sm text-gray-500">
                                        No comments yet. Start the conversation!
                                    </div>
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className="p-6 bg-white border-t border-gray-100">
                                <form onSubmit={handleAddComment} className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-100 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
