import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Calendar, Tag, ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchBlog();
        AOS.init({ once: false });
    }, [id]);

    const fetchBlog = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("blogs")
            .select("*")
            .eq("id", id)
            .single();
        if (error) {
            console.error("Error fetching blog:", error);
            navigate("/blog");
        } else {
            setBlog(data);
        }
        setLoading(false);
    };

    const shareOnSocial = (platform) => {
        const url = window.location.href;
        const text = blog?.title || "Check out this blog post!";
        let shareUrl = "";

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            default:
                break;
        }

        if (shareUrl) window.open(shareUrl, "_blank");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-32 pb-12 px-[5%] md:px-[10%]">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/blog")}
                    className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                    data-aos="fade-right"
                >
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    Back to Blog
                </button>

                {/* Hero Section */}
                <div className="mb-12" data-aos="fade-up">
                    <div className="flex items-center gap-3 text-purple-400 text-sm font-semibold mb-4 uppercase tracking-wider">
                        <Tag className="w-4 h-4" />
                        {blog.category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm md:text-base border-y border-white/10 py-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            {new Date(blog.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            {Math.ceil(blog.content.length / 500)} min read
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl" data-aos="zoom-in">
                    <img
                        src={blog.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643"}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-purple max-w-none mb-12" data-aos="fade-up">
                    <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                        {blog.content}
                    </div>
                </div>

                {/* Share Section */}
                <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-6" data-aos="fade-up">
                    <div className="flex items-center gap-3">
                        <Share2 className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold text-white">Share this article:</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {[
                            { id: "facebook", icon: Facebook, color: "hover:bg-blue-600" },
                            { id: "twitter", icon: Twitter, color: "hover:bg-sky-500" },
                            { id: "linkedin", icon: Linkedin, color: "hover:bg-blue-700" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => shareOnSocial(item.id)}
                                className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ${item.color} hover:border-transparent hover:scale-110`}
                            >
                                <item.icon className="w-5 h-5" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
