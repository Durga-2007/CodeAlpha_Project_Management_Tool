import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Plus,
    ChevronLeft,
    Users,
    Settings,
    Loader2,
    MoreVertical,
    Filter,
    ArrowRight
} from 'lucide-react';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { useSocket } from '../context/SocketContext';

const ProjectPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        column: 'Todo',
        priority: 'Medium',
        dueDate: '',
        assignedTo: ''
    });
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');

    const socket = useSocket();

    const fetchProjectData = useCallback(async () => {
        try {
            const projects = await projectService.getProjects();
            const currentProject = projects.find(p => p._id === projectId);
            setProject(currentProject);

            const projectTasks = await taskService.getTasks(projectId);
            setTasks(projectTasks);
        } catch (error) {
            console.error('Failed to fetch project data', error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectData();

        if (socket) {
            socket.emit('joinProject', projectId);

            socket.on('taskCreated', (task) => {
                setTasks((prev) => [...prev, task]);
            });

            socket.on('taskUpdated', (updatedTask) => {
                setTasks((prev) => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
                if (selectedTask?._id === updatedTask._id) setSelectedTask(updatedTask);
            });

            socket.on('taskMoved', (updatedTask) => {
                setTasks((prev) => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
            });

            socket.on('taskDeleted', (taskId) => {
                setTasks((prev) => prev.filter(t => t._id !== taskId));
                if (selectedTask?._id === taskId) setSelectedTask(null);
            });

            return () => {
                socket.emit('leaveProject', projectId);
                socket.off('taskCreated');
                socket.off('taskUpdated');
                socket.off('taskMoved');
                socket.off('taskDeleted');
            };
        }
    }, [projectId, socket, fetchProjectData, selectedTask?._id]);

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = async (e, column) => {
        const taskId = e.dataTransfer.getData('taskId');
        const task = tasks.find(t => t._id === taskId);

        if (task && task.column !== column) {
            // Optimistic update
            const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, column } : t);
            setTasks(updatedTasks);

            try {
                await taskService.updateTask(taskId, { column });
            } catch (error) {
                // Rollback on error
                setTasks(tasks);
                console.error('Failed to move task', error);
            }
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            alert('Please enter a task title');
            return;
        }
        try {
            await taskService.createTask({ ...newTask, projectId });
            setShowCreateModal(false);
            setNewTask({ title: '', description: '', column: 'Todo', priority: 'Medium', dueDate: '', assignedTo: '' });
        } catch (error) {
            console.error('Failed to create task', error);
            alert(error.response?.data?.message || 'Failed to create task. Please try again.');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const updated = await projectService.addMember(projectId, memberEmail);
            setProject(updated);
            setShowMemberModal(false);
            setMemberEmail('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add member');
        }
    };

    const handleTaskDelete = async (taskId) => {
        try {
            await taskService.deleteTask(taskId);
            setTasks(tasks.filter(t => t._id !== taskId));
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const columns = ['Todo', 'InProgress', 'Done'];
    const columnTitles = {
        Todo: 'To Do',
        InProgress: 'In Progress',
        Done: 'Completed'
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-400 font-medium italic">Assembling your board...</p>
            </div>
        );
    }

    if (!project) return <div>Project not found</div>;

    return (
        <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <Link to="/dashboard" className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary-600 hover:shadow-md transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{project.title}</h1>
                            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-widest">Active</span>
                        </div>
                        <p className="text-gray-500 font-medium text-sm">{project.description}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex -space-x-3 items-center mr-4">
                        {project.members?.map((member) => (
                            <div key={member._id} className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-primary-700 text-xs font-bold" title={member.name}>
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        <button
                            onClick={() => setShowMemberModal(true)}
                            className="w-10 h-10 rounded-full bg-gray-50 border-2 border-white shadow-sm flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Task</span>
                    </button>
                </div>
            </div>

            {/* Board Layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 overflow-x-auto min-h-[600px]">
                {columns.map((col) => (
                    <div
                        key={col}
                        className="flex flex-col bg-gray-100/40 rounded-[2.5rem] p-6 border border-transparent hover:border-gray-200 transition-all min-w-[320px]"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, col)}
                    >
                        <div className="flex items-center justify-between mb-8 px-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${col === 'Todo' ? 'bg-gray-400' : col === 'InProgress' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                <h3 className="text-sm font-black text-gray-600 uppercase tracking-[0.2em]">{columnTitles[col]}</h3>
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                                {tasks.filter(t => t.column === col).length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-6">
                            {tasks
                                .filter(t => t.column === col)
                                .map((task) => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onClick={setSelectedTask}
                                    />
                                ))}
                        </div>

                        <button
                            onClick={() => {
                                setNewTask({ ...newTask, column: col });
                                setShowCreateModal(true);
                            }}
                            className="mt-6 w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm font-bold flex items-center justify-center space-x-2 hover:bg-white hover:border-primary-200 hover:text-primary-500 transition-all group"
                        >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>New Task</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {
                selectedTask && (
                    <TaskModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        onUpdate={(updated) => setTasks(tasks.map(t => t._id === updated._id ? updated : t))}
                        onDelete={handleTaskDelete}
                    />
                )
            }

            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                            <div className="bg-primary-600 p-8 text-white relative shrink-0">
                                <h2 className="text-2xl font-black">Add New Task</h2>
                                <p className="text-primary-100 text-sm mt-1">What needs to be done next?</p>
                                <button onClick={() => setShowCreateModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleCreateTask} className="p-8 space-y-6 overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-primary-600 uppercase tracking-widest ml-1">Task Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter task title here..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Priority</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-semibold appearance-none"
                                                value={newTask.priority}
                                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Due Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                            value={newTask.dueDate}
                                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Assign To</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-semibold appearance-none"
                                        value={newTask.assignedTo}
                                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                    >
                                        <option value="">Unassigned</option>
                                        {project.members?.map(m => (
                                            <option key={m._id} value={m._id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Additional Details</label>
                                    <textarea
                                        placeholder="Add more context or requirements..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium resize-none"
                                        rows="4"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 transition-all transform hover:scale-[1.02] active:scale-95"
                                    >
                                        Create Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showMemberModal && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                            <div className="bg-primary-600 p-8 text-white relative shrink-0">
                                <h2 className="text-2xl font-black">Invite Member</h2>
                                <p className="text-primary-100 text-sm mt-1">Add a collaborator to this project</p>
                                <button onClick={() => setShowMemberModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleAddMember} className="p-8 space-y-5 overflow-y-auto">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="colleague@company.com"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowMemberModal(false)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 transition-all transform hover:scale-[1.02]"
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const X = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default ProjectPage;
