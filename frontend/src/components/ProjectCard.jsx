import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProjectCard = ({ project, onDelete }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || project.createdBy === user?._id;

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
            {/* Decorative Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    {project.title.charAt(0).toUpperCase()}
                </div>
                {isAdmin && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete(project._id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex-1 relative z-10">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">{project.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-400 text-sm">
                        <Users className="w-4 h-4 mr-1.5" />
                        <span>{project.members?.length || 0}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <Link
                    to={`/projects/${project._id}`}
                    className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1"
                >
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
};

export default ProjectCard;
