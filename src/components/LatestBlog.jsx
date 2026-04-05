import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Tag, Eye, Heart } from "lucide-react";

const LatestBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestBlogs = async () => {
            const { data, error } = await supabase
                .from("blogs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(3);

            if (error) console.error("Error fetching latest blogs:", error);
            else setBlogs(data || []);
            setLoading(false);
        };

        fetchLatestBlogs();
    }, []);

    if (loading || blogs.length === 0) return null;

    return (
        <section className="py-20 px-[5%] md:px-[10%] bg-transparent relative overflow-hidden" id="LatestBlog">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                    <div data-aos="fade-right">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                            Latest Articles
                        </h2>
                        <p className="text-gray-400 mt-2">Personal insights and thoughts in design & technology.</p>
                    </div>
                    <Link
                        to="/blog"
                        className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                        data-aos="fade-left"
                    >
                        View All Posts
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog, index) => (
                        <Link
                            key={blog.id}
                            to={`/blog/${blog.id}`}
                            className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 flex flex-col"
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={blog.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643"}
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-purple-500/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                    {blog.category}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(blog.created_at).toLocaleDateString()}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                                    {blog.title}
                                </h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-purple-400 font-medium text-xs">
                                        Read Article <ArrowRight className="w-3 h-3" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                                            <Eye className="w-3 h-3" />
                                            {blog.views || 0}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                                            <Heart className="w-3 h-3" />
                                            {blog.likes || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LatestBlog;
