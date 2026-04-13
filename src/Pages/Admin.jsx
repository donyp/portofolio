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
    Heart,
    Award,
    Code2,
    UserCircle,
    Instagram,
    Linkedin,
    Github,
    Edit2,
    Upload,
    Globe,
    TrendingUp,
    MessageSquare,
    Briefcase,
    Zap,
    Clock,
    Palette,
    Monitor,
    Smartphone,
    ArrowUp,
    ArrowDown,
    Reply,
    Send,
    Mail
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
        meta_description: "",
        about_image: ""
    });
    const [isEditingBlog, setIsEditingBlog] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [newBlog, setNewBlog] = useState({ title: "", content: "", image_url: "", category: "Tech" });
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [newProject, setNewProject] = useState({ Title: "", Description: "", Link: "", Img: "", category: "Design", video_url: "", lottie_url: "" });
    // New feature states
    const [testimonials, setTestimonials] = useState([]);
    const [services, setServices] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [pageViews, setPageViews] = useState([]);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [newTestimonial, setNewTestimonial] = useState({ client_name: "", client_role: "", client_photo: "", rating: 5, review_text: "", is_featured: false });
    const [editingService, setEditingService] = useState(null);
    const [newService, setNewService] = useState({ title: "", description: "", icon: "Palette", price_text: "", whatsapp_template: "", whatsapp_number: "", sort_order: 0, is_active: true });
    const [editingExperience, setEditingExperience] = useState(null);
    const [newExperience, setNewExperience] = useState({ year: "", title: "", company: "", description: "", sort_order: 0 });
    const [allComments, setAllComments] = useState([]);
    const [allGeneralComments, setAllGeneralComments] = useState([]);
    const [adminReplyingTo, setAdminReplyingTo] = useState(null);
    const [adminReplyContent, setAdminReplyContent] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [serviceOrders, setServiceOrders] = useState([]);

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

    const fetchExtendedData = async () => {
        try {
            const [testRes, svcRes, expRes, logRes, pvRes, commentsRes, ordersRes] = await Promise.all([
                supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
                supabase.from("services").select("*").order("sort_order", { ascending: true }),
                supabase.from("experiences").select("*").order("sort_order", { ascending: true }),
                supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(50),
                supabase.from("page_views").select("*").order("created_at", { ascending: false }).limit(500),
                supabase.from("comments").select("*, blogs(title)").order("created_at", { ascending: false }),
                supabase.from("service_orders").select("*").order("created_at", { ascending: false })
            ]);
            if (testRes.data) setTestimonials(testRes.data);
            if (svcRes.data) setServices(svcRes.data);
            if (expRes.data) setExperiences(expRes.data);
            if (logRes.data) setActivityLogs(logRes.data);
            if (pvRes.data) setPageViews(pvRes.data);
            if (commentsRes.data) setAllComments(commentsRes.data);
            if (ordersRes.data) setServiceOrders(ordersRes.data);
        } catch (err) {
            console.error("Extended data fetch:", err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchExtendedData();
    }, [isAuthenticated]);

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

    const logActivity = async (action, entity_type, entity_name) => {
        try {
            await supabase.from("activity_logs").insert({ action, entity_type, entity_name });
            fetchExtendedData();
        } catch (err) { console.error(err); }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        const { error } = await supabase.from("service_orders").update({ status }).eq("id", id);
        if (error) Swal.fire("Error", error.message, "error");
        else fetchExtendedData();
    };

    const handleDeleteOrder = async (id, name) => {
        const result = await Swal.fire({
            title: "Delete order from " + name + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            background: "#030014",
            color: "#fff"
        });
        if (result.isConfirmed) {
            await supabase.from("service_orders").delete().eq("id", id);
            fetchExtendedData();
        }
    };

    // Testimonial CRUD
    const handleSaveTestimonial = async () => {
        if (!newTestimonial.client_name || !newTestimonial.review_text) return;
        setLoading(true);
        const { error } = editingTestimonial
            ? await supabase.from("testimonials").update(newTestimonial).eq("id", editingTestimonial.id)
            : await supabase.from("testimonials").insert([newTestimonial]);
        if (error) Swal.fire("Error", error.message, "error");
        else {
            Swal.fire("Success", editingTestimonial ? "Testimonial updated!" : "Testimonial added!", "success");
            logActivity(editingTestimonial ? "Updated" : "Created", "Testimonial", newTestimonial.client_name);
            setNewTestimonial({ client_name: "", client_role: "", client_photo: "", rating: 5, review_text: "", is_featured: false });
            setEditingTestimonial(null);
            fetchExtendedData();
        }
        setLoading(false);
    };

    const handleDeleteTestimonial = async (id, name) => {
        const result = await Swal.fire({ title: "Delete testimonial?", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", background: "#030014", color: "#fff" });
        if (result.isConfirmed) {
            await supabase.from("testimonials").delete().eq("id", id);
            logActivity("Deleted", "Testimonial", name);
            fetchExtendedData();
        }
    };

    // Service CRUD
    const handleSaveService = async () => {
        if (!newService.title) return;
        setLoading(true);
        const { error } = editingService
            ? await supabase.from("services").update(newService).eq("id", editingService.id)
            : await supabase.from("services").insert([newService]);
        if (error) Swal.fire("Error", error.message, "error");
        else {
            Swal.fire("Success", editingService ? "Service updated!" : "Service added!", "success");
            logActivity(editingService ? "Updated" : "Created", "Service", newService.title);
            setNewService({ title: "", description: "", icon: "Palette", price_text: "", whatsapp_template: "", whatsapp_number: "", sort_order: 0, is_active: true });
            setEditingService(null);
            fetchExtendedData();
        }
        setLoading(false);
    };

    const handleDeleteService = async (id, title) => {
        const result = await Swal.fire({ title: "Delete service?", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", background: "#030014", color: "#fff" });
        if (result.isConfirmed) {
            await supabase.from("services").delete().eq("id", id);
            logActivity("Deleted", "Service", title);
            fetchExtendedData();
        }
    };

    // Experience CRUD
    const handleSaveExperience = async () => {
        if (!newExperience.title || !newExperience.year) return;
        setLoading(true);
        const { error } = editingExperience
            ? await supabase.from("experiences").update(newExperience).eq("id", editingExperience.id)
            : await supabase.from("experiences").insert([newExperience]);
        if (error) Swal.fire("Error", error.message, "error");
        else {
            Swal.fire("Success", editingExperience ? "Experience updated!" : "Experience added!", "success");
            logActivity(editingExperience ? "Updated" : "Created", "Experience", newExperience.title);
            setNewExperience({ year: "", title: "", company: "", description: "", sort_order: 0 });
            setEditingExperience(null);
            fetchExtendedData();
        }
        setLoading(false);
    };

    const handleDeleteExperience = async (id, title) => {
        const result = await Swal.fire({ title: "Delete experience?", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", background: "#030014", color: "#fff" });
        if (result.isConfirmed) {
            await supabase.from("experiences").delete().eq("id", id);
            logActivity("Deleted", "Experience", title);
            fetchExtendedData();
        }
    };

    const renderAdminComments = (blogId, parentId = null, depth = 0) => {
        const thread = allComments.filter(c => c.blog_id === blogId && c.parent_id === parentId);
        if (thread.length === 0) return null;

        return (
            <div className={`space-y-3 ${depth > 0 ? 'ml-6 border-l-2 border-white/10 pl-4 mt-3' : ''}`}>
                {thread.map(c => {
                    const isCreator = c.user_name.toLowerCase().trim() === 'doni';
                    return (
                        <div key={c.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2 relative transition-all hover:bg-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isCreator ? (
                                        <img src="/Photo.jpg" alt="Creator" className="w-6 h-6 rounded-full object-cover border border-purple-500/50" />
                                    ) : (
                                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                                            <span className="text-indigo-400 text-[10px] uppercase font-bold">{c.user_name[0]}</span>
                                        </div>
                                    )}
                                    <span className={`font-bold text-sm ${isCreator ? 'text-purple-400' : 'text-indigo-400'}`}>
                                        {c.user_name}
                                        {isCreator && <span className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-[8px] px-1.5 py-0.5 rounded-full text-white tracking-wider">CREATOR</span>}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{c.content}</p>

                            <div className="flex gap-4 mt-2">
                                <button
                                    onClick={() => setAdminReplyingTo(c)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <Reply className="w-3 h-3 inline mr-1" /> Reply
                                </button>
                                <button
                                    onClick={async () => {
                                        const result = await Swal.fire({ title: "Delete comment?", text: "This will also delete all replies.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", background: "#030014", color: "#fff" });
                                        if (result.isConfirmed) {
                                            await supabase.from("comments").delete().eq("id", c.id);
                                            logActivity("Deleted", "Comment", c.user_name);
                                            fetchExtendedData();
                                        }
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                                </button>
                            </div>

                            {adminReplyingTo?.id === c.id && !adminReplyingTo?.isGeneral && (
                                <div className="mt-3 bg-black/40 p-4 rounded-xl border border-white/10 relative">
                                    <p className="text-xs text-gray-400 mb-2">Replying to {c.user_name}</p>
                                    <textarea
                                        className="w-full bg-white/5 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 border border-white/10 resize-none h-20"
                                        value={adminReplyContent}
                                        onChange={e => setAdminReplyContent(e.target.value)}
                                        placeholder="Write your reply as Doni..."
                                    />
                                    <div className="flex justify-end gap-3 mt-3">
                                        <button onClick={() => setAdminReplyingTo(null)} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Cancel</button>
                                        <button
                                            disabled={isSubmittingReply}
                                            onClick={handleAdminSubmitReply}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium border border-indigo-500/50"
                                        >
                                            {isSubmittingReply ? "Posting..." : "Post Reply"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {renderAdminComments(blogId, c.id, depth + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderGeneralAdminComments = (parentId = null, depth = 0) => {
        const thread = allGeneralComments.filter(c => c.parent_id === parentId);
        if (thread.length === 0) return null;

        return (
            <div className={`space-y-3 ${depth > 0 ? 'ml-6 border-l-2 border-white/10 pl-4 mt-3' : ''}`}>
                {thread.map(c => {
                    const isCreator = c.user_name.toLowerCase().trim() === 'doni';
                    return (
                        <div key={c.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2 relative transition-all hover:bg-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isCreator ? (
                                        <img src="/Photo.jpg" alt="Creator" className="w-6 h-6 rounded-full object-cover border border-purple-500/50" />
                                    ) : (
                                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                                            <span className="text-indigo-400 text-[10px] uppercase font-bold">{c.user_name[0]}</span>
                                        </div>
                                    )}
                                    <span className={`font-bold text-sm ${isCreator ? 'text-purple-400' : 'text-indigo-400'}`}>
                                        {c.user_name}
                                        {isCreator && <span className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-[8px] px-1.5 py-0.5 rounded-full text-white tracking-wider">CREATOR</span>}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{c.content}</p>

                            <div className="flex gap-4 mt-2">
                                <button
                                    onClick={() => setAdminReplyingTo({ ...c, isGeneral: true })}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <Reply className="w-3 h-3 inline mr-1" /> Reply
                                </button>
                                <button
                                    onClick={async () => {
                                        const result = await Swal.fire({ title: "Delete general comment?", text: "This will also delete all replies.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", background: "#030014", color: "#fff" });
                                        if (result.isConfirmed) {
                                            await supabase.from("portfolio_comments").delete().eq("id", c.id);
                                            logActivity("Deleted", "Gen Comment", c.user_name);
                                            fetchExtendedData();
                                        }
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                                </button>
                            </div>

                            {adminReplyingTo?.id === c.id && adminReplyingTo?.isGeneral && (
                                <div className="mt-3 bg-black/40 p-4 rounded-xl border border-white/10 relative">
                                    <p className="text-xs text-gray-400 mb-2">Replying to {c.user_name} (General)</p>
                                    <textarea
                                        className="w-full bg-white/5 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 border border-white/10 resize-none h-20"
                                        value={adminReplyContent}
                                        onChange={e => setAdminReplyContent(e.target.value)}
                                        placeholder="Write your general reply as Doni..."
                                    />
                                    <div className="flex justify-end gap-3 mt-3">
                                        <button onClick={() => setAdminReplyingTo(null)} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Cancel</button>
                                        <button
                                            disabled={isSubmittingReply}
                                            onClick={async () => {
                                                if (!adminReplyContent.trim()) return;
                                                setIsSubmittingReply(true);
                                                try {
                                                    await supabase.from('portfolio_comments').insert([{
                                                        user_name: "Doni",
                                                        content: adminReplyContent,
                                                        parent_id: c.id
                                                    }]);
                                                    Swal.fire({ title: "Success", text: "Reply posted!", icon: "success", background: "#030014", color: "#fff" });
                                                    setAdminReplyContent("");
                                                    setAdminReplyingTo(null);
                                                    fetchExtendedData();
                                                } catch (err) { Swal.fire("Error", "Failed to post reply.", "error"); }
                                                finally { setIsSubmittingReply(false); }
                                            }}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium border border-indigo-500/50"
                                        >
                                            {isSubmittingReply ? "Posting..." : "Post Reply"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {renderGeneralAdminComments(c.id, depth + 1)}
                        </div>
                    );
                })}
            </div>
        );
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
                        { id: "comments", label: "Blog Comments", icon: MessageSquare },
                        { id: "gen_comments", label: "General Comments", icon: MessageSquare },
                        { id: "testimonials", label: "Testimonials", icon: Heart },
                        { id: "services", label: "Services", icon: Palette },
                        { id: "service_orders", label: "Orders", icon: Send },
                        { id: "timeline", label: "Timeline", icon: Briefcase },
                        { id: "analytics", label: "Analytics", icon: TrendingUp },
                        { id: "activity", label: "Activity Log", icon: Clock },
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
                            <span className="font-medium">{item.label}</span>
                            {item.id === "service_orders" && serviceOrders.filter(o => o.status === 'pending').length > 0 && (
                                <span className="ml-auto bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {serviceOrders.filter(o => o.status === 'pending').length}
                                </span>
                            )}
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
                {/* Header Mobile - Enhanced with Navigation */}
                <div className="md:hidden mb-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-xl tracking-tight">Admin CMS</span>
                        <button onClick={() => { sessionStorage.clear(); window.location.href = "/"; }} className="p-2 bg-white/5 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                    </div>

                    {/* Horizontal Scrolling Tabs for Mobile */}
                    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide no-scrollbar">
                        {[
                            { id: "stats", label: "Dashboard", icon: BarChart3 },
                            { id: "blogs", label: "Blog", icon: FileText },
                            { id: "projects", label: "Projects", icon: FolderKanban },
                            { id: "skills", label: "Skills", icon: Code2 },
                            { id: "comments", label: "Blog Comm", icon: MessageSquare },
                            { id: "gen_comments", label: "Gen Comm", icon: MessageSquare },
                            { id: "testimonials", label: "Reviews", icon: Heart },
                            { id: "services", label: "Services", icon: Palette },
                            { id: "service_orders", label: "Orders", icon: Send },
                            { id: "timeline", label: "Timeline", icon: Briefcase },
                            { id: "analytics", label: "Analytics", icon: TrendingUp },
                            { id: "activity", label: "Logs", icon: Clock },
                            { id: "settings", label: "Settings", icon: UserCircle },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border ${activeTab === item.id
                                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                                    : "bg-white/5 text-gray-400 border-transparent hover:border-white/10"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.label}</span>
                                {item.id === "service_orders" && serviceOrders.filter(o => o.status === 'pending').length > 0 && (
                                    <span className="bg-pink-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center leading-none">
                                        {serviceOrders.filter(o => o.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
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
                                <div key={blog.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <img src={blog.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-white/10 shrink-0" />
                                        <div className="min-w-0">
                                            <h4 className="font-bold truncate">{blog.title}</h4>
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
                                <div key={project.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <img src={project.Img} alt="" className="w-12 h-12 rounded-lg object-cover bg-white/10 shrink-0" />
                                        <div className="min-w-0">
                                            <h4 className="font-bold truncate">{project.Title}</h4>
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

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="font-bold text-gray-300">About Me Photo</h3>
                                <div className="flex gap-4">
                                    <input
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                                        placeholder="About Photo URL"
                                        value={siteSettings.about_image}
                                        onChange={e => setSiteSettings({ ...siteSettings, about_image: e.target.value })}
                                    />
                                    <label className="cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-6 py-3 rounded-xl transition-all flex items-center gap-2">
                                        <Upload className="w-5 h-5" />
                                        <span>Upload Photo</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = await handleFileUpload(file);
                                                    if (url) setSiteSettings({ ...siteSettings, about_image: url });
                                                }
                                            }}
                                        />
                                    </label>
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

                {/* Quick Actions in Dashboard */}
                {activeTab === "stats" && (
                    <div className="mt-8 bg-white/5 border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "New Blog", action: () => setActiveTab("blogs"), icon: FileText, color: "text-purple-400" },
                                { label: "New Project", action: () => setActiveTab("projects"), icon: FolderKanban, color: "text-blue-400" },
                                { label: "Add Review", action: () => setActiveTab("testimonials"), icon: MessageSquare, color: "text-green-400" },
                                { label: "Add Service", action: () => setActiveTab("services"), icon: Palette, color: "text-pink-400" },
                            ].map((item, i) => (
                                <button key={i} onClick={item.action} className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm">
                                    <item.icon className={`w-4 h-4 ${item.color}`} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Testimonials Tab */}
                {activeTab === "testimonials" && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Testimonials</h2>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                            <h3 className="font-bold">{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="Client Name" value={newTestimonial.client_name} onChange={e => setNewTestimonial({ ...newTestimonial, client_name: e.target.value })} />
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="Client Role / Company" value={newTestimonial.client_role} onChange={e => setNewTestimonial({ ...newTestimonial, client_role: e.target.value })} />
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="Photo URL" value={newTestimonial.client_photo} onChange={e => setNewTestimonial({ ...newTestimonial, client_photo: e.target.value })} />
                                <select className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500 text-white" value={newTestimonial.rating} onChange={e => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}>
                                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r} className="bg-gray-900">{r} Stars</option>)}
                                </select>
                            </div>
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24 outline-none focus:border-indigo-500" placeholder="Review text..." value={newTestimonial.review_text} onChange={e => setNewTestimonial({ ...newTestimonial, review_text: e.target.value })} />
                            <div className="flex gap-3">
                                <button onClick={handleSaveTestimonial} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 rounded-xl hover:bg-indigo-500 hover:text-white transition-all font-bold flex items-center gap-2">
                                    <Save className="w-4 h-4" /> {editingTestimonial ? "Update" : "Add"}
                                </button>
                                {editingTestimonial && <button onClick={() => { setEditingTestimonial(null); setNewTestimonial({ client_name: "", client_role: "", client_photo: "", rating: 5, review_text: "", is_featured: false }); }} className="text-gray-400 hover:text-white px-4 py-2">Cancel</button>}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {testimonials.map(t => (
                                <div key={t.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold">{t.client_name} <span className="text-gray-500 text-sm">— {t.client_role}</span></p>
                                        <p className="text-gray-400 text-sm line-clamp-1">"{t.review_text}"</p>
                                        <div className="flex items-center gap-1 mt-1">{[...Array(t.rating || 5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button onClick={() => { setEditingTestimonial(t); setNewTestimonial(t); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4 text-blue-400" /></button>
                                        <button onClick={() => handleDeleteTestimonial(t.id, t.client_name)} className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4 text-red-400" /></button>
                                    </div>
                                </div>
                            ))}
                            {testimonials.length === 0 && <p className="text-gray-500 text-center py-8">No testimonials yet.</p>}
                        </div>
                    </div>
                )}

                {/* Comments Manager Tab */}
                {activeTab === "comments" && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Blog Comments</h2>
                        </div>
                        <div className="space-y-6">
                            {allComments.length === 0 && <p className="text-gray-500 text-center py-8">No comments yet.</p>}

                            {[...new Set(allComments.map(c => c.blog_id))].map(blogId => {
                                const title = allComments.find(c => c.blog_id === blogId)?.blogs?.title || "Unknown Blog";
                                return (
                                    <div key={blogId} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                        <h3 className="font-bold text-lg mb-6 text-purple-400 border-b border-white/10 pb-3 flex items-center gap-2">
                                            <FileText className="w-5 h-5" /> {title}
                                        </h3>
                                        <div className="mt-4">
                                            {renderAdminComments(blogId, null, 0)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === "services" && (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-2xl font-bold">Services Manager</h2>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                            <h3 className="font-bold">{editingService ? "Edit Service" : "Add Service"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="Service Title" value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })} />
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="Price (e.g. Rp 500.000)" value={newService.price_text} onChange={e => setNewService({ ...newService, price_text: e.target.value })} />
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="WhatsApp Number (e.g. 085117778351)" value={newService.whatsapp_number} onChange={e => setNewService({ ...newService, whatsapp_number: e.target.value })} />
                                <select className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white" value={newService.icon} onChange={e => setNewService({ ...newService, icon: e.target.value })}>
                                    {["Palette", "PenTool", "Layout", "Film", "Camera", "Monitor", "Sparkles"].map(ic => <option key={ic} value={ic} className="bg-gray-900">{ic}</option>)}
                                </select>
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" type="number" placeholder="Sort Order" value={newService.sort_order} onChange={e => setNewService({ ...newService, sort_order: parseInt(e.target.value) || 0 })} />
                            </div>
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-20 outline-none focus:border-indigo-500" placeholder="Description" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} />
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-16 outline-none focus:border-indigo-500" placeholder="WhatsApp template message" value={newService.whatsapp_template} onChange={e => setNewService({ ...newService, whatsapp_template: e.target.value })} />
                            <div className="flex gap-3">
                                <button onClick={handleSaveService} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 rounded-xl hover:bg-indigo-500 hover:text-white transition-all font-bold flex items-center gap-2">
                                    <Save className="w-4 h-4" /> {editingService ? "Update" : "Add"}
                                </button>
                                {editingService && <button onClick={() => { setEditingService(null); setNewService({ title: "", description: "", icon: "Palette", price_text: "", whatsapp_template: "", whatsapp_number: "", sort_order: 0, is_active: true }); }} className="text-gray-400 hover:text-white px-4 py-2">Cancel</button>}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {services.map(s => (
                                <div key={s.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                    <div><p className="font-semibold">{s.title}</p><p className="text-sm text-gray-400">{s.price_text || "No price set"} • Order #{s.sort_order}</p></div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingService(s); setNewService(s); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4 text-blue-400" /></button>
                                        <button onClick={() => handleDeleteService(s.id, s.title)} className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4 text-red-400" /></button>
                                    </div>
                                </div>
                            ))}
                            {services.length === 0 && <p className="text-gray-500 text-center py-8">No services yet.</p>}
                        </div>
                    </div>
                )}

                {/* Timeline Tab */}
                {activeTab === "timeline" && (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-2xl font-bold">Timeline / Experience</h2>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                            <h3 className="font-bold">{editingExperience ? "Edit Experience" : "Add Experience"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="Year (e.g. 2024)" value={newExperience.year} onChange={e => setNewExperience({ ...newExperience, year: e.target.value })} />
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="Title / Position" value={newExperience.title} onChange={e => setNewExperience({ ...newExperience, title: e.target.value })} />
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" placeholder="Company / Organization" value={newExperience.company} onChange={e => setNewExperience({ ...newExperience, company: e.target.value })} />
                                <input className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-indigo-500" type="number" placeholder="Sort Order" value={newExperience.sort_order} onChange={e => setNewExperience({ ...newExperience, sort_order: parseInt(e.target.value) || 0 })} />
                            </div>
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-20 outline-none focus:border-indigo-500" placeholder="Description" value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })} />
                            <div className="flex gap-3">
                                <button onClick={handleSaveExperience} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 rounded-xl hover:bg-indigo-500 hover:text-white transition-all font-bold flex items-center gap-2">
                                    <Save className="w-4 h-4" /> {editingExperience ? "Update" : "Add"}
                                </button>
                                {editingExperience && <button onClick={() => { setEditingExperience(null); setNewExperience({ year: "", title: "", company: "", description: "", sort_order: 0 }); }} className="text-gray-400 hover:text-white px-4 py-2">Cancel</button>}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {experiences.map(ex => (
                                <div key={ex.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                    <div><p className="font-semibold">{ex.year} — {ex.title}</p><p className="text-sm text-gray-400">{ex.company}</p></div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingExperience(ex); setNewExperience(ex); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4 text-blue-400" /></button>
                                        <button onClick={() => handleDeleteExperience(ex.id, ex.title)} className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4 text-red-400" /></button>
                                    </div>
                                </div>
                            ))}
                            {experiences.length === 0 && <p className="text-gray-500 text-center py-8">No experiences yet.</p>}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-2xl font-bold">Visitor Analytics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2"><Eye className="w-5 h-5 text-blue-400" /><span className="text-gray-400 text-sm">Total Page Views</span></div>
                                <p className="text-3xl font-bold">{pageViews.length}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2"><Monitor className="w-5 h-5 text-green-400" /><span className="text-gray-400 text-sm">Desktop</span></div>
                                <p className="text-3xl font-bold">{pageViews.filter(pv => pv.device_type === "desktop").length}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2"><Smartphone className="w-5 h-5 text-orange-400" /><span className="text-gray-400 text-sm">Mobile</span></div>
                                <p className="text-3xl font-bold">{pageViews.filter(pv => pv.device_type === "mobile").length}</p>
                            </div>
                        </div>
                        {/* Top Pages */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <h3 className="font-bold mb-4">Top Pages</h3>
                            <div className="space-y-2">
                                {Object.entries(pageViews.reduce((acc, pv) => { acc[pv.page_path] = (acc[pv.page_path] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count], i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-gray-300 text-sm">{path}</span>
                                        <span className="text-indigo-400 font-bold text-sm">{count} views</span>
                                    </div>
                                ))}
                                {pageViews.length === 0 && <p className="text-gray-500 text-center py-4">No page views recorded yet.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* General Comments Tab */}
                {activeTab === "gen_comments" && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <MessageSquare className="w-8 h-8 text-indigo-400" />
                                Home Page Comments
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {allGeneralComments.filter(c => !c.parent_id).map(comment => (
                                <div key={comment.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            {comment.user_name.toLowerCase().trim() === 'doni' ? (
                                                <img src="/Photo.jpg" alt="Creator" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50" />
                                            ) : (
                                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                                    <UserCircle className="w-5 h-5 text-indigo-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                                                    {comment.user_name}
                                                    {comment.user_name.toLowerCase().trim() === 'doni' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold tracking-widest uppercase">CREATOR</span>}
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setAdminReplyingTo({ ...comment, isGeneral: true })}
                                                className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg shadow-indigo-500/20"
                                                title="Reply"
                                            >
                                                <Reply className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const result = await Swal.fire({ title: "Delete comment?", text: "This will also delete all replies.", icon: "warning", background: "#030014", color: "#fff", showCancelButton: true });
                                                    if (result.isConfirmed) {
                                                        await supabase.from("portfolio_comments").delete().eq("id", comment.id);
                                                        fetchExtendedData();
                                                    }
                                                }}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/20"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed bg-black/20 p-4 rounded-2xl italic">"{comment.content}"</p>

                                    {/* Threaded Replies */}
                                    {renderGeneralAdminComments(comment.id)}

                                    {/* Main Reply Input */}
                                    {adminReplyingTo?.id === comment.id && adminReplyingTo?.isGeneral && (
                                        <div className="mt-4 bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-2xl animate-fadeIn">
                                            <p className="text-xs font-semibold text-indigo-400 mb-2 tracking-wider">REPLYING AS DONI</p>
                                            <textarea
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-indigo-500 outline-none resize-none h-28 transition-all"
                                                placeholder="Write your answer..."
                                                value={adminReplyContent}
                                                onChange={e => setAdminReplyContent(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-3 mt-4">
                                                <button onClick={() => setAdminReplyingTo(null)} className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                                                <button
                                                    disabled={isSubmittingReply}
                                                    onClick={async () => {
                                                        if (!adminReplyContent.trim()) return;
                                                        setIsSubmittingReply(true);
                                                        try {
                                                            await supabase.from('portfolio_comments').insert([{
                                                                user_name: "Doni",
                                                                content: adminReplyContent,
                                                                parent_id: comment.id
                                                            }]);
                                                            Swal.fire({ title: "Success", text: "Reply posted!", icon: "success", background: "#030014", color: "#fff" });
                                                            setAdminReplyContent("");
                                                            setAdminReplyingTo(null);
                                                            fetchExtendedData();
                                                        } catch (err) { Swal.fire("Error", "Failed to post reply.", "error"); }
                                                        finally { setIsSubmittingReply(false); }
                                                    }}
                                                    className="bg-indigo-500 hover:bg-indigo-600 px-8 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/25"
                                                >
                                                    {isSubmittingReply ? "Posting..." : "Send Reply"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {allGeneralComments.length === 0 && (
                                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-500 font-medium">No general comments found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Blog Comments Tab */}
                {activeTab === "comments" && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FileText className="w-8 h-8 text-purple-400" />
                                Blog Comments Moderation
                            </h2>
                        </div>

                        <div className="space-y-8">
                            {blogs.map(blog => {
                                const blogComments = allComments.filter(c => c.blog_id === blog.id && !c.parent_id);
                                if (blogComments.length === 0) return null;

                                return (
                                    <div key={blog.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                            <div className="p-2 bg-purple-500/20 rounded-xl">
                                                <FileText className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <h3 className="font-bold text-lg text-white truncate max-w-md">{blog.title}</h3>
                                        </div>

                                        <div className="space-y-6 pl-2 md:pl-6 border-l-2 border-white/5">
                                            {blogComments.map(comment => (
                                                <div key={comment.id} className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {comment.user_name.toLowerCase().trim() === 'doni' ? (
                                                                <img src="/Photo.jpg" alt="Creator" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50" />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                                                                    <span className="text-indigo-400 text-xs font-bold">{comment.user_name[0].toUpperCase()}</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-bold text-white text-sm flex items-center gap-2">
                                                                    {comment.user_name}
                                                                    {comment.user_name.toLowerCase().trim() === 'doni' && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold uppercase tracking-tighter">CREATOR</span>}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setAdminReplyingTo(comment)}
                                                                className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-md shadow-indigo-500/20"
                                                                title="Reply"
                                                            >
                                                                <Reply className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    const result = await Swal.fire({ title: "Delete comment?", text: "This will also delete all replies.", icon: "warning", background: "#030014", color: "#fff", showCancelButton: true });
                                                                    if (result.isConfirmed) {
                                                                        await supabase.from("comments").delete().eq("id", comment.id);
                                                                        fetchExtendedData();
                                                                    }
                                                                }}
                                                                className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-md shadow-red-500/20"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-300 text-sm leading-relaxed pl-13 select-none">"{comment.content}"</p>

                                                    {/* Threaded Replies for Blogs */}
                                                    {renderAdminComments(blog.id, comment.id)}

                                                    {/* Blog Reply Input */}
                                                    {adminReplyingTo?.id === comment.id && !adminReplyingTo?.isGeneral && (
                                                        <div className="mt-4 bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-2xl animate-fadeIn ml-8">
                                                            <textarea
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-indigo-500 outline-none resize-none h-20 transition-all font-mono"
                                                                placeholder="Type reply..."
                                                                value={adminReplyContent}
                                                                onChange={e => setAdminReplyContent(e.target.value)}
                                                            />
                                                            <div className="flex justify-end gap-3 mt-3">
                                                                <button onClick={() => setAdminReplyingTo(null)} className="px-4 py-1 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                                                                <button
                                                                    disabled={isSubmittingReply}
                                                                    onClick={handleAdminSubmitReply}
                                                                    className="bg-indigo-500 hover:bg-indigo-600 px-6 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/25"
                                                                >
                                                                    {isSubmittingReply ? "Posting..." : "Send Reply"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {!allComments.some(c => !c.parent_id) && (
                                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-500 font-medium">No blog comments found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Service Orders Tab */}
                {activeTab === "service_orders" && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Send className="w-8 h-8 text-pink-400" />
                                Service Orders
                            </h2>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs font-bold border border-pink-500/30">
                                    {serviceOrders.filter(o => o.status === 'pending').length} PENDING
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {serviceOrders.map(order => (
                                <div key={order.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 hover:border-pink-500/30 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                                                order.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                <Send className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-white">{order.name}</p>
                                                <p className="text-pink-400 font-medium text-sm">{order.service_title}</p>
                                                <p className="text-gray-500 text-xs mt-1">{new Date(order.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                                            >
                                                <option value="pending" className="bg-gray-900">Pending</option>
                                                <option value="contacted" className="bg-gray-900">Contacted</option>
                                                <option value="completed" className="bg-gray-900">Completed</option>
                                            </select>
                                            <button
                                                onClick={() => handleDeleteOrder(order.id, order.name)}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Contact Info</p>
                                            <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm">
                                                <Mail className="w-4 h-4" />
                                                {order.contact}
                                            </div>
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Message</p>
                                            <p className="text-gray-300 text-sm italic line-clamp-2">"{order.message || 'No message provided'}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {serviceOrders.length === 0 && (
                                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                                    <Send className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-500 font-medium">No service orders yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
