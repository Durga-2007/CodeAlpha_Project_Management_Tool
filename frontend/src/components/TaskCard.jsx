import { Calendar, User, MessageSquare, AlertCircle } from 'lucide-react';

const TaskCard = ({ task, onClick, onDragStart }) => {
    const priorityColors = {
        Low: 'border-green-400 bg-green-50/30 text-green-700',
        Medium: 'border-yellow-400 bg-yellow-50/30 text-yellow-700',
        High: 'border-red-400 bg-red-50/30 text-red-700',
    };

    const priorityDot = {
        Low: 'bg-green-500',
        Medium: 'bg-yellow-500',
        High: 'bg-red-500',
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData('taskId', task._id);
        onDragStart?.(e, task);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onClick={() => onClick(task)}
            className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300 cursor-grab active:cursor-grabbing group animate-in zoom-in-95 duration-500"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-dashed ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`w-2 h-2 rounded-full ${priorityDot[task.priority]} animate-pulse`} />
                </div>
            </div>

            <h4 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-3 line-clamp-2">
                {task.title}
            </h4>

            {task.description && (
                <p className="text-xs text-gray-500 mb-5 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-primary-100 border-2 border-white flex items-center justify-center text-primary-700 text-[10px] font-bold shadow-sm">
                        {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-400">
                    {task.dueDate && (
                        <div className="flex items-center text-[10px] font-bold">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-gray-300" />
                            {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                    )}
                    <div className="flex items-center text-[10px] font-bold space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-300" />
                        <span>0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
