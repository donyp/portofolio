import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Calendar, Tag, ArrowLeft, Clock, Share2, Twitter, Instagram, MessageCircle, Eye, Heart, User, MessageSquare, Reply, Send } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commenterName, setCommenterName] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);

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
            setLikeCount(data.likes || 0);

            // Check if liked
            const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
            if (likedBlogs.includes(id)) setIsLiked(true);

            // Increment views if not seen this session
            const viewedBlogs = JSON.parse(sessionStorage.getItem('viewedBlogs') || '[]');
            if (!viewedBlogs.includes(id)) {
                const newViews = (data.views || 0) + 1;
                await supabase.from('blogs').update({ views: newViews }).eq('id', id);
                sessionStorage.setItem('viewedBlogs', JSON.stringify([...viewedBlogs, id]));
            }

            // Fetch comments
            const { data: commentsData, error: commentsError } = await supabase
                .from("comments")
                .select("*")
                .eq("blog_id", id)
                .order("created_at", { ascending: true });

            if (commentsError) console.error("Error fetching comments:", commentsError);
            else setComments(commentsData || []);
        }
        setLoading(false);
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !commenterName.trim()) return;

        const isAdmin = sessionStorage.getItem('admin_auth') === 'true';
        if (!isAdmin && commenterName.trim().toLowerCase() === 'doni') {
            alert("Nama 'Doni' dilindungi. Silakan gunakan nama lain.");
            return;
        }

        setIsSubmittingComment(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert([{
                    blog_id: id,
                    user_name: commenterName,
                    content: newComment,
                    parent_id: replyingTo ? replyingTo.id : null
                }])
                .select();

            if (error) throw error;

            if (data) {
                setComments([...comments, data[0]]);
                setNewComment("");
                setReplyingTo(null);
            }
        } catch (err) {
            console.error("Error posting comment:", err);
            alert("Failed to post comment. Please try again.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const renderComments = (parentId = null, depth = 0) => {
        let threadComments = comments.filter(c => c.parent_id === parentId);

        if (parentId === null && !showAllComments) {
            threadComments = threadComments.slice(0, 2);
        }

        if (threadComments.length === 0) return null;

        return (
            <div className={`space-y-4 ${depth > 0 ? 'ml-4 sm:ml-8 border-l border-white/10 pl-4 mt-4' : ''}`}>
                {threadComments.map(comment => {
                    const isCreator = comment.user_name.toLowerCase() === 'doni';
                    return (
                        <div key={comment.id} className={`bg-white/5 border ${isCreator ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-white/10'} rounded-xl p-4 transition-all hover:bg-white/10`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`font-bold flex items-center gap-2 ${isCreator ? 'text-purple-400' : 'text-indigo-400'}`}>
                                    {isCreator ? (
                                        <div className="w-8 h-8 rounded-full border-2 border-purple-500/50 overflow-hidden shrink-0">
                                            <img
                                                src="/Photo.jpg"
                                                alt="Creator"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm md:text-base">{comment.user_name}</span>
                                        {isCreator && (
                                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">
                                                Creator
                                            </span>
                                        )}
                                    </div>
                                </span>
                                <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
                            <button
                                onClick={() => {
                                    setReplyingTo(comment);
                                    document.getElementById("comment-form").scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                            >
                                <Reply className="w-3 h-3" /> Reply
                            </button>

                            {renderComments(comment.id, depth + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleLike = async () => {
        if (isLiked) return;

        const newLikes = likeCount + 1;
        setLikeCount(newLikes);
        setIsLiked(true);

        const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
        localStorage.setItem('likedBlogs', JSON.stringify([...likedBlogs, id]));

        await supabase.from('blogs').update({ likes: newLikes }).eq('id', id);
    };

    const shareOnSocial = (platform) => {
        const url = window.location.href;
        const text = `Cek artikel keren dari Doni ini: ${blog?.title}\n\nBaca selengkapnya di: ${url}`;
        let shareUrl = "";

        switch (platform) {
            case "whatsapp":
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                break;
            case "instagram":
                navigator.clipboard.writeText(text);
                alert("Teks dan link sudah dicopy! IG belum support direct link share via web, silakan paste di story/post IG kamu ya.");
                return;
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
                            <User className="w-5 h-5 text-gray-500" />
                            Doni
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            {new Date(blog.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-5 h-5 text-gray-500" />
                            {Math.ceil((blog.content || '').length / 500)} min read
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-gray-500" />
                                {blog.views || 0}
                            </div>
                            <button
                                onClick={handleLike}
                                disabled={isLiked}
                                className={`flex items-center gap-2 transition-all ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                {likeCount}
                            </button>
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
                            { id: "whatsapp", icon: MessageCircle, color: "hover:bg-green-600", name: "WhatsApp" },
                            { id: "twitter", icon: Twitter, color: "hover:bg-sky-500", name: "Twitter" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => shareOnSocial(item.id)}
                                title={`Share to ${item.name}`}
                                className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ${item.color} hover:border-transparent hover:scale-110`}
                            >
                                <item.icon className="w-5 h-5" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-12 pt-12 border-t border-white/10" id="comment-form" data-aos="fade-up">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                        Comments ({comments.length})
                    </h3>

                    {/* Comment Form */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                        <h4 className="font-semibold text-white mb-4">
                            {replyingTo ? `Replying to ${replyingTo.user_name}` : "Leave a Comment"}
                        </h4>
                        <form onSubmit={handleSubmitComment} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={commenterName}
                                onChange={(e) => setCommenterName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                                required
                            />
                            <textarea
                                placeholder="Write your comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors h-24 resize-none"
                                required
                            ></textarea>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmittingComment}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmittingComment ? "Posting..." : <><Send className="w-4 h-4" /> Post Comment</>}
                                </button>
                                {replyingTo && (
                                    <button
                                        type="button"
                                        onClick={() => setReplyingTo(null)}
                                        className="text-gray-400 hover:text-white text-sm"
                                    >
                                        Cancel Reply
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length > 0 ? (
                            <>
                                {renderComments(null, 0)}
                                {comments.filter(c => c.parent_id === null).length > 2 && !showAllComments && (
                                    <button
                                        onClick={() => setShowAllComments(true)}
                                        className="w-full py-3 mt-4 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
                                    >
                                        Show More Comments
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Be the first to comment!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
