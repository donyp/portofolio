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
    Github,
    Edit2,
    Upload,
    Globe,
    TrendingUp
} from "lucide-react";
import Swal from "sweetalert2";

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState("stats");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ projects: 0, blogs: 0, likes: 0, views: 0 });
    const [blogs, setBlogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [techStacks, setTechStacks] = useState([]);
    const [siteSettings, setSiteSettings] = useState({
        full_name: "",
        role: "",
        typing_words: "",
        linkedin_url: "",
        instagram_url: "",
        github_url: "",
        meta_title: "",
        meta_description: ""
    });
    const [isEditingBlog, setIsEditingBlog] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [newBlog, setNewBlog] = useState({ title: "", content: "", image_url: "", category: "Tech" });
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [newProject, setNewProject] = useState({ Title: "", Description: "", Link: "", Img: "", category: "Design", video_url: "", lottie_url: "" });

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
            const [pRes, bRes, cRes, tRes, sRes] = await Promise.all([
                supabase.from("projects").select("*").order("id", { ascending: false }),
                supabase.from("blogs").select("*").order("created_at", { ascending: false }),
                supabase.from("certificates").select("*").order("id", { ascending: false }),
                supabase.from("tech_stacks").select("*").order("id", { ascending: true }),
                supabase.from("site_settings").select("*").single()
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
            if (cRes.data) setCertificates(cRes.data);
            if (tRes.data) setTechStacks(tRes.data);
            if (sRes.data) setSiteSettings(sRes.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleFileUpload = async (file, bucket = "portfolio") => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            Swal.fire("Upload Error", error.message, "error");
            return null;
        }
    };

    const handleCreateBlog = async () => {
        if (!newBlog.title || !newBlog.content) return;
        setLoading(true);
        const { error } = editingBlog
            ? await supabase.from("blogs").update(newBlog).eq("id", editingBlog.id)
            : await supabase.from("blogs").insert([newBlog]);

        if (error) {
            Swal.fire("Error", error.message, "error");
        } else {
            Swal.fire("Success", editingBlog ? "Blog updated!" : "Blog post created!", "success");
            setNewBlog({ title: "", content: "", image_url: "", category: "Tech" });
            setIsEditingBlog(false);
            setEditingBlog(null);
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

    const handleCreateProject = async () => {
        if (!newProject.Title || !newProject.Img) return;
        setLoading(true);
        const { error } = editingProject
            ? await supabase.from("projects").update(newProject).eq("id", editingProject.id)
            : await supabase.from("projects").insert([newProject]);

        if (error) {
            Swal.fire("Error", error.message, "error");
        } else {
            Swal.fire("Success", editingProject ? "Project updated!" : "Project created!", "success");
            setNewProject({ Title: "", Description: "", Link: "", Img: "", category: "Design", video_url: "", lottie_url: "" });
            setIsEditingProject(false);
            setEditingProject(null);
            fetchData();
        }
        setLoading(false);
    };

    const handleDeleteProject = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This project will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            background: "#030014",
            color: "#ffffff"
        });
        if (result.isConfirmed) {
            const { error } = await supabase.from("projects").delete().eq("id", id);
            if (error) Swal.fire("Error", error.message, "error");
            else fetchData();
        }
    };

    const handleUpdateSiteSettings = async () => {
        setLoading(true);
        const { error } = await supabase.from("site_settings").update(siteSettings).eq("id", siteSettings.id);
        if (error) {
            Swal.fire("Error", error.message, "error");
        } else {
            Swal.fire("Success", "Site settings updated!", "success");
            fetchData();
        }
        setLoading(false);
    };

    const handleCreateCertificate = async (Img) => {
        if (!Img) return;
        const { error } = await supabase.from("certificates").insert([{ Img }]);
        if (error) Swal.fire("Error", error.message, "error");
        else fetchData();
    };

    const handleDeleteCertificate = async (id) => {
        const { error } = await supabase.from("certificates").delete().eq("id", id);
        if (error) Swal.fire("Error", error.message, "error");
        else fetchData();
    };

    const handleCreateTechStack = async (name, icon) => {
        if (!name || !icon) return;
        const { error } = await supabase.from("tech_stacks").insert([{ name, icon }]);
        if (error) Swal.fire("Error", error.message, "error");
        else fetchData();
    };

    const handleDeleteTechStack = async (id) => {
        const { error } = await supabase.from("tech_stacks").delete().eq("id", id);
        if (error) Swal.fire("Error", error.message, "error");
        else fetchData();
    };

    const handleUpdateProjectMedia = async (id, video_url, lottie_url) => {
        const { error } = await supabase.from("projects").update({ video_url, lottie_url }).eq("id", id);
        if (error) Swal.fire("Error", error.message, "error");
        else Swal.fire("Updated", "Project media updated!", "success");
    };

    const handleUpdateSEO = async () => {
        setLoading(true);
        const { error } = await supabase.from("site_settings").update({
            meta_title: siteSettings.meta_title,
            meta_description: siteSettings.meta_description
        }).eq("id", siteSettings.id);
        if (error) Swal.fire("Error", error.message, "error");
        else Swal.fire("Success", "SEO settings updated!", "success");
        setLoading(false);
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
                        { id: "skills", label: "Skills & More", icon: Code2 },
                        { id: "settings", label: "Settings", icon: UserCircle },
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
                                { label: "Total Projects", value: stats.projects, icon: FolderKanban, color: "text-blue-400", bg: "bg-blue-500/10" },
                                { label: "Total Blogs", value: stats.blogs, icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
                                { label: "Total Likes", value: stats.likes, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10" },
                                { label: "Project Views", value: stats.views, icon: Eye, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 ${stat.bg} rounded-xl ${stat.color}`}>
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
                                onClick={() => {
                                    setEditingBlog(null);
                                    setNewBlog({ title: "", content: "", image_url: "", category: "Tech" });
                                    setIsEditingBlog(true);
                                }}
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
                                <div className="space-y-4">
                                    <label className="text-sm text-gray-400">Thumbnail Image</label>
                                    <div className="flex gap-4">
                                        <input
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                            placeholder="Thumbnail URL"
                                            value={newBlog.image_url}
                                            onChange={e => setNewBlog({ ...newBlog, image_url: e.target.value })}
                                        />
                                        <label className="cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-6 py-3 rounded-xl transition-all flex items-center gap-2">
                                            <Upload className="w-5 h-5" />
                                            <span>Upload</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const url = await handleFileUpload(file);
                                                        if (url) setNewBlog({ ...newBlog, image_url: url });
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-40 focus:outline-none focus:border-indigo-500"
                                    placeholder="Content (Markdown/Text)"
                                    value={newBlog.content}
                                    onChange={e => setNewBlog({ ...newBlog, content: e.target.value })}
                                />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => { setIsEditingBlog(false); setEditingBlog(null); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                    <button onClick={handleCreateBlog} className="bg-indigo-500 px-6 py-2 rounded-xl font-bold">
                                        {editingBlog ? "Update Post" : "Create Post"}
                                    </button>
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
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> {blog.views || 0}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Heart className="w-3 h-3 text-pink-500/50" /> {blog.likes || 0}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-2">{new Date(blog.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingBlog(blog);
                                                setNewBlog({ title: blog.title, content: blog.content, image_url: blog.image_url, category: blog.category });
                                                setIsEditingBlog(true);
                                                window.scrollTo(0, 0);
                                            }}
                                            className="p-2 text-gray-500 hover:text-indigo-400 transition-colors"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBlog(blog.id)}
                                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "projects" && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Manage Projects</h2>
                            <button
                                onClick={() => {
                                    setEditingProject(null);
                                    setNewProject({ Title: "", Description: "", Link: "", Img: "", category: "Design", video_url: "", lottie_url: "" });
                                    setIsEditingProject(true);
                                }}
                                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all"
                            >
                                <Plus className="w-4 h-4" /> New Project
                            </button>
                        </div>

                        {isEditingProject && (
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Project Title"
                                        value={newProject.Title}
                                        onChange={e => setNewProject({ ...newProject, Title: e.target.value })}
                                    />
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Category"
                                        value={newProject.category}
                                        onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24 focus:outline-none focus:border-indigo-500"
                                    placeholder="Description"
                                    value={newProject.Description}
                                    onChange={e => setNewProject({ ...newProject, Description: e.target.value })}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                                placeholder="Main Image URL"
                                                value={newProject.Img}
                                                onChange={e => setNewProject({ ...newProject, Img: e.target.value })}
                                            />
                                            <label className="cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-3 rounded-xl transition-all">
                                                <Upload className="w-5 h-5" />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const url = await handleFileUpload(file);
                                                            if (url) setNewProject({ ...newProject, Img: url });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Project Link (Optional)"
                                        value={newProject.Link}
                                        onChange={e => setNewProject({ ...newProject, Link: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Video URL (Hover)"
                                        value={newProject.video_url}
                                        onChange={e => setNewProject({ ...newProject, video_url: e.target.value })}
                                    />
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="Lottie JSON URL"
                                        value={newProject.lottie_url}
                                        onChange={e => setNewProject({ ...newProject, lottie_url: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => { setIsEditingProject(false); setEditingProject(null); }} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                    <button onClick={handleCreateProject} className="bg-indigo-500 px-6 py-2 rounded-xl font-bold">
                                        {editingProject ? "Update Project" : "Save Project"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {projects.map(project => (
                                <div key={project.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={project.Img} alt="" className="w-12 h-12 rounded-lg object-cover bg-white/10" />
                                        <div>
                                            <h4 className="font-bold">{project.Title}</h4>
                                            <span className="text-xs text-indigo-400">{project.category}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProject(project);
                                                setNewProject({
                                                    Title: project.Title,
                                                    Description: project.Description,
                                                    Link: project.Link,
                                                    Img: project.Img,
                                                    category: project.category,
                                                    video_url: project.video_url,
                                                    lottie_url: project.lottie_url
                                                });
                                                setIsEditingProject(true);
                                                window.scrollTo(0, 0);
                                            }}
                                            className="p-2 text-gray-500 hover:text-indigo-400 transition-colors"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "skills" && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Tech Stack Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Code2 className="w-5 h-5 text-indigo-400" /> Tech Stack
                                    </h2>
                                    <button
                                        onClick={async () => {
                                            const { value: formValues } = await Swal.fire({
                                                title: 'Add Skill',
                                                html:
                                                    '<input id="swal-input1" class="swal2-input" placeholder="Skill Name">' +
                                                    '<input id="swal-input2" class="swal2-input" placeholder="Icon URL (Optional)">',
                                                focusConfirm: false,
                                                background: "#030014",
                                                color: "#ffffff",
                                                preConfirm: () => [
                                                    document.getElementById('swal-input1').value,
                                                    document.getElementById('swal-input2').value
                                                ]
                                            });
                                            if (formValues) handleCreateTechStack(formValues[0], formValues[1]);
                                        }}
                                        className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {techStacks.map(skill => (
                                        <div key={skill.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                            <span className="text-sm">{skill.name}</span>
                                            <button onClick={() => handleDeleteTechStack(skill.id)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Certificates Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Award className="w-5 h-5 text-purple-400" /> Certificates
                                    </h2>
                                    <button
                                        onClick={async () => {
                                            const { value: url } = await Swal.fire({
                                                title: 'Add Certificate',
                                                input: 'url',
                                                inputPlaceholder: 'Certificate Image URL',
                                                background: "#030014",
                                                color: "#ffffff"
                                            });
                                            if (url) handleCreateCertificate(url);
                                        }}
                                        className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {certificates.map(cert => (
                                        <div key={cert.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img src={cert.Img} alt="" className="w-10 h-10 rounded bg-white/10 object-cover" />
                                                <span className="text-xs text-gray-400 truncate max-w-[150px]">{cert.Img}</span>
                                            </div>
                                            <button onClick={() => handleDeleteCertificate(cert.id)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="max-w-2xl space-y-8 animate-fadeIn">
                        <h2 className="text-2xl font-bold">Site Settings</h2>

                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Full Name</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                        value={siteSettings.full_name}
                                        onChange={e => setSiteSettings({ ...siteSettings, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Primary Role</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                        value={siteSettings.role}
                                        onChange={e => setSiteSettings({ ...siteSettings, role: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Typing Words (Comma separated)</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                    value={siteSettings.typing_words}
                                    onChange={e => setSiteSettings({ ...siteSettings, typing_words: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="font-bold text-gray-300">Social Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                                        <Linkedin className="w-5 h-5 text-blue-400" />
                                        <input
                                            className="bg-transparent border-none outline-none text-sm w-full"
                                            placeholder="LinkedIn URL"
                                            value={siteSettings.linkedin_url}
                                            onChange={e => setSiteSettings({ ...siteSettings, linkedin_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                                        <Instagram className="w-5 h-5 text-pink-400" />
                                        <input
                                            className="bg-transparent border-none outline-none text-sm w-full"
                                            placeholder="Instagram URL"
                                            value={siteSettings.instagram_url}
                                            onChange={e => setSiteSettings({ ...siteSettings, instagram_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                                        <Github className="w-5 h-5 text-white" />
                                        <input
                                            className="bg-transparent border-none outline-none text-sm w-full"
                                            placeholder="GitHub URL"
                                            value={siteSettings.github_url}
                                            onChange={e => setSiteSettings({ ...siteSettings, github_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleUpdateSiteSettings}
                                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                            </div>
                        </div>

                        {/* SEO Section */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-400" /> SEO Metadata
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Meta Title</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                        placeholder="Site Title (for Google)"
                                        value={siteSettings.meta_title}
                                        onChange={e => setSiteSettings({ ...siteSettings, meta_title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Meta Description</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24 focus:border-indigo-500 outline-none"
                                        placeholder="Brief description of your site"
                                        value={siteSettings.meta_description}
                                        onChange={e => setSiteSettings({ ...siteSettings, meta_description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleUpdateSEO}
                                    className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 rounded-xl hover:bg-indigo-500 hover:text-white transition-all font-bold"
                                >
                                    <Save className="w-4 h-4" /> Save SEO
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
