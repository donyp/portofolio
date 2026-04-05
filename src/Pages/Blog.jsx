import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import { Calendar, Tag, ArrowRight, Search } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBlogs();
        AOS.init({ once: false });
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("blogs")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) console.error("Error fetching blogs:", error);
        else setBlogs(data || []);
        setLoading(false);
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-24 pb-12 px-[5%] md:px-[10%]">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12" data-aos="fade-up">
                    <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
                        Our Blog
                    </h2>
                    <p className="text-gray-400">Insights, tutorials, and updates from my creative journey.</p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md mx-auto mb-12" data-aos="fade-up" data-aos-delay="100">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors backdrop-blur-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog, index) => (
                            <Link
                                to={`/blog/${blog.id}`}
                                key={blog.id}
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
                                    <div className="absolute top-4 left-4 bg-purple-500/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {blog.category}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                                        {blog.content.substring(0, 150).replace(/[#*]/g, "")}...
                                    </p>
                                    <div className="flex items-center gap-2 text-purple-400 font-medium text-sm group/btn">
                                        Read More
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredBlogs.length === 0 && (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-gray-500">No articles found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
