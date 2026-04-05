import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
    LayoutDashboard,
    FileText,
    FolderKanban,
    Plus,
    Trash2,
    BarChart3,
    ExternalLink,
    Save,
    X,
    Lock,
    Eye,
    Video,
    Star,
    Heart
} from "lucide-react";
import Swal from "sweetalert2";

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState("stats");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ projects: 0, blogs: 0, likes: 0, views: 0 });
    const [blogs, setBlogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isEditingBlog, setIsEditingBlog] = useState(false);
    const [newBlog, setNewBlog] = useState({ title: "", content: "", image_url: "", category: "Tech" });

    useEffect(() => {
        const checkAuth = () => {
            const auth = sessionStorage.getItem("admin_auth");
            if (auth === "true") {
                setIsAuthenticated(true);
                fetchData();
            } else {
                promptPasscode();
            }
        };
        checkAuth();
    }, []);

    const promptPasscode = () => {
        Swal.fire({
            title: "Admin Access",
            input: "password",
            inputPlaceholder: "Enter Passcode",
            showCancelButton: true,
            confirmButtonText: "Enter",
            allowOutsideClick: false,
            allowEscapeKey: false,
            background: "#030014",
            color: "#ffffff",
            inputAttributes: {
                autocapitalize: "off",
                autocorrect: "off"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const passcode = import.meta.env.VITE_ADMIN_PASSCODE || "admin123";
                if (result.value === passcode) {
                    sessionStorage.setItem("admin_auth", "true");
                    setIsAuthenticated(true);
                    fetchData();
                } else {
                    Swal.fire("Access Denied", "Incorrect passcode", "error");
                    window.location.href = "/";
                }
            } else {
                window.location.href = "/";
            }
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, bRes] = await Promise.all([
                supabase.from("projects").select("*").order("id", { ascending: false }),
                supabase.from("blogs").select("*").order("created_at", { ascending: false })
            ]);

            if (pRes.data) {
                setProjects(pRes.data);
                const totalLikes = pRes.data.reduce((acc, p) => acc + (p.likes || 0), 0);
                const totalViews = pRes.data.reduce((acc, p) => acc + (p.views || 0), 0);
                setStats(prev => ({ ...prev, projects: pRes.data.length, likes: totalLikes, views: totalViews }));
            }
            if (bRes.data) {
                setBlogs(bRes.data);
                setStats(prev => ({ ...prev, blogs: bRes.data.length }));
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleCreateBlog = async () => {
        if (!newBlog.title || !newBlog.content) return;
        setLoading(true);
        const { error } = await supabase.from("blogs").insert([newBlog]);
        if (error) {
            Swal.fire("Error", error.message, "error");
        } else {
            Swal.fire("Success", "Blog post created!", "success");
            setNewBlog({ title: "", content: "", image_url: "", category: "Tech" });
            setIsEditingBlog(false);
            fetchData();
        }
        setLoading(false);
    };

    const handleDeleteBlog = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This blog post will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            background: "#030014",
            color: "#ffffff"
        });

        if (result.isConfirmed) {
            const { error } = await supabase.from("blogs").delete().eq("id", id);
            if (error) Swal.fire("Error", error.message, "error");
            else fetchData();
        }
    };

    const handleUpdateProjectMedia = async (id, video_url, lottie_url) => {
        const { error } = await supabase.from("projects").update({ video_url, lottie_url }).eq("id", id);
        if (error) Swal.fire("Error", error.message, "error");
        else Swal.fire("Updated", "Project media updated!", "success");
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        }
        return num;
    };

    if (!isAuthenticated) return <div className="min-h-screen bg-[#030014]" />;

    return (
        <div className="min-h-screen bg-[#030014] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white/5 border-r border-white/10 p-6 hidden md:block">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Admin
                    </span>
                </div>

                <nav className="space-y-2">
                    {[
                        { id: "stats", label: "Dashboard", icon: BarChart3 },
                        { id: "blogs", label: "Blog Posts", icon: FileText },
                        { id: "projects", label: "Projects", icon: FolderKanban },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-6">
                    <button
                        onClick={() => { sessionStorage.clear(); window.location.href = "/"; }}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {/* Header Mobile */}
                <div className="md:hidden flex items-center justify-between mb-8">
                    <span className="font-bold text-xl tracking-tight">Admin Dashboard</span>
                    <button onClick={() => { sessionStorage.clear(); window.location.href = "/"; }}><X /></button>
                </div>

                {activeTab === "stats" && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Total Projects", value: stats.projects, icon: FolderKanban, color: "blue" },
                                { label: "Total Blogs", value: stats.blogs, icon: FileText, color: "purple" },
                                { label: "Total Likes", value: stats.likes, icon: Heart, color: "pink" },
                                { label: "Project Views", value: stats.views, icon: Eye, color: "indigo" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 bg-${stat.color}-500/10 rounded-xl text-${stat.color}-400`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                                    <p className="text-3xl font-bold mt-1">{formatNumber(stat.value)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity or Chart Placeholder */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <h3 className="text-xl font-bold mb-6">System Overview</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Welcome back, Doni. This is your private command center. You can manage your articles, update project media such as Lottie animations or hover videos, and track your metrics.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === "blogs" && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Manage Blogs</h2>
                            <button
                                onClick={() => setIsEditingBlog(true)}
                                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all"
                            >
                                <Plus className="w-4 h-4" /> New Post
                            </button>
                        </div>

                        {isEditingBlog && (
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Title"
                                        value={newBlog.title}
                                        onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
                                    />
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Category"
                                        value={newBlog.category}
                                        onChange={e => setNewBlog({ ...newBlog, category: e.target.value })}
                                    />
                                </div>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                    placeholder="Thumbnail URL"
                                    value={newBlog.image_url}
                                    onChange={e => setNewBlog({ ...newBlog, image_url: e.target.value })}
                                />
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-40 focus:outline-none focus:border-indigo-500"
                                    placeholder="Content (Markdown/Text)"
                                    value={newBlog.content}
                                    onChange={e => setNewBlog({ ...newBlog, content: e.target.value })}
                                />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsEditingBlog(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                    <button onClick={handleCreateBlog} className="bg-indigo-500 px-6 py-2 rounded-xl font-bold">Create Post</button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {blogs.map(blog => (
                                <div key={blog.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={blog.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-white/10" />
                                        <div>
                                            <h4 className="font-bold">{blog.title}</h4>
                                            <span className="text-xs text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteBlog(blog.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "projects" && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold">Manage Projects Media</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {projects.map(project => (
                                <div key={project.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-48 aspect-video bg-white/10 rounded-xl overflow-hidden">
                                        <img src={project.Img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <h3 className="text-lg font-bold">{project.Title}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 flex items-center gap-1"><Video className="w-3 h-3" /> Video URL (Hover)</label>
                                                <input
                                                    id={`v-${project.id}`}
                                                    defaultValue={project.video_url}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Lottie JSON URL</label>
                                                <input
                                                    id={`l-${project.id}`}
                                                    defaultValue={project.lottie_url}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={() => {
                                                    const v = document.getElementById(`v-${project.id}`).value;
                                                    const l = document.getElementById(`l-${project.id}`).value;
                                                    handleUpdateProjectMedia(project.id, v, l);
                                                }}
                                                className="flex items-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-500 hover:text-white transition-all"
                                            >
                                                <Save className="w-4 h-4" /> Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
