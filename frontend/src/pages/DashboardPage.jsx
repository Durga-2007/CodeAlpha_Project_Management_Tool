import { useState, useEffect } from 'react';
import projectService from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import { Plus, LayoutGrid, Search, Loader2 } from 'lucide-react';

const DashboardPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await projectService.getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const newProject = await projectService.createProject({ title, description });
            setProjects([newProject, ...projects]);
            setShowModal(false);
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Failed to create project', error);
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(id);
                setProjects(projects.filter(p => p._id !== id));
            } catch (error) {
                console.error('Failed to delete project', error);
            }
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Project Dashboard</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage and collaborate on your team projects</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                </button>
            </div>

            {/* Stats/Filters Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm py-4 pl-14 pr-6 font-medium text-gray-600 placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-4 px-4 border-l border-gray-100 lg:w-auto w-full justify-between">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{filteredProjects.length} Projects</span>
                    <div className="flex bg-gray-50 p-1 rounded-xl">
                        <button className="p-2 bg-white text-primary-600 rounded-lg shadow-sm"><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                    <p className="text-gray-400 font-medium italic">Loading your workspace...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-200 py-32 text-center group">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Plus className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">Click "New Project" to start your first collaborative workspace.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project._id} project={project} onDelete={handleDeleteProject} />
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-primary-600 p-8 text-white relative">
                            <h2 className="text-2xl font-black">Create New Project</h2>
                            <p className="text-primary-100 text-sm mt-1">Define your team's next goal</p>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        </div>

                        <form onSubmit={handleCreateProject} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Website Redesign 2024"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Description (Optional)</label>
                                <textarea
                                    placeholder="What is this project about?"
                                    rows="4"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 transition-all transform hover:scale-[1.02] active:scale-98"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
