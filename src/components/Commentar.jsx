import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import toast from "react-hot-toast";
import { createClient } from '@supabase/supabase-js';
import { MessageCircle, UserCircle2, Loader2, AlertCircle, Send, ImagePlus, X, Pin } from 'lucide-react';
import AOS from "aos";
import "aos/dist/aos.css";
import { supabase } from '../supabase';


const Comment = memo(({ comment, formatDate, index, isPinned = false, onReply, isReply = false, replyToName }) => {
    const profileSrc = comment.user_name === 'Doni' ? '/Photo.jpg' : comment.profile_image;

    return (
        <div
            className={`px-4 pt-4 pb-2 rounded-xl border transition-all group hover:shadow-lg hover:-translate-y-0.5 ${isPinned
                ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30 hover:bg-gradient-to-r hover:from-indigo-500/15 hover:to-purple-500/15'
                : comment.user_name.toLowerCase() === 'doni'
                    ? 'bg-white/5 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:bg-white/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                } ${isReply ? 'ml-8 sm:ml-12 mt-2' : ''}`}
        >
            {isPinned && (
                <div className="flex items-center gap-2 mb-3 text-indigo-400">
                    <Pin className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Pinned Comment</span>
                </div>
            )}
            <div className="flex items-start gap-3">
                {profileSrc ? (
                    <img
                        src={profileSrc}
                        alt={`${comment.user_name}'s profile`}
                        className={`w-10 h-10 rounded-full object-cover border-2 flex-shrink-0  ${isPinned || comment.user_name.toLowerCase() === 'doni' ? 'border-purple-500/50' : 'border-indigo-500/30'
                            }`}
                        loading="lazy"
                    />
                ) : (
                    <div className={`p-2 rounded-full text-indigo-400 group-hover:bg-indigo-500/30 transition-colors ${isPinned ? 'bg-indigo-500/30' : 'bg-indigo-500/20'
                        }`}>
                        <UserCircle2 className="w-5 h-5" />
                    </div>
                )}
                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-medium truncate ${isPinned ? 'text-indigo-200' : 'text-white'
                                }`}>
                                {comment.user_name}
                            </h4>
                            {(isPinned || comment.user_name.toLowerCase() === 'doni') && (
                                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">
                                    Creator
                                </span>
                            )}
                            {isReply && replyToName && (
                                <span className="text-[10px] text-gray-400 italic">
                                    replied to <span className="text-indigo-400 font-medium">@{replyToName}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
                                {formatDate(comment.created_at)}
                            </span>
                            {!isReply && onReply && (
                                <button
                                    onClick={() => onReply(comment)}
                                    className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                                >
                                    Reply
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-300 text-sm break-words leading-relaxed relative bottom-2">
                        {comment.content}
                    </p>
                </div>
            </div>
        </div>
    );
});

const CommentForm = memo(({ onSubmit, isSubmitting, error, placeholder = "Write your message here...", buttonText = "Post Comment", onCancel, showNameInput = true, initialName = "" }) => {
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState(initialName);
    const textareaRef = useRef(null);

    const isAdmin = sessionStorage.getItem('admin_auth') === 'true';

    useEffect(() => {
        if (isAdmin) setUserName("Doni");
        else if (initialName) setUserName(initialName);
    }, [initialName, isAdmin]);

    const handleTextareaChange = useCallback((e) => {
        setNewComment(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!newComment.trim() || !userName.trim()) return;

        if (!isAdmin && userName.toLowerCase().trim() === 'doni') {
            toast.error("Nama tersebut tidak dapat digunakan");
            return;
        }

        onSubmit({ newComment, userName });
        setNewComment('');
        if (showNameInput && !isAdmin) setUserName('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }, [newComment, userName, onSubmit, showNameInput, isAdmin]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {showNameInput && !isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            maxLength={15}
                            placeholder="Your Name"
                            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            required
                        />
                    </div>
                </div>
            )}

            {isAdmin && (
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full border-2 border-purple-500/50 overflow-hidden">
                        <img src="/Photo.jpg" alt="Admin" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-purple-400 flex items-center gap-2">
                        Doni <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Creator Mode</span>
                    </span>
                </div>
            )}

            <div className="space-y-2">
                <textarea
                    ref={textareaRef}
                    value={newComment}
                    maxLength={200}
                    onChange={handleTextareaChange}
                    placeholder={placeholder}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none min-h-[100px] leading-relaxed"
                    required
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow h-11 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Posting...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span>{buttonText}</span>
                        </>
                    )}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 h-11 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10 text-sm font-medium"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
});

const Komentar = () => {
    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState({});
    const [pinnedComment, setPinnedComment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatorMode, setIsCreatorMode] = useState(false);
    const [error, setError] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const isAdmin = sessionStorage.getItem('admin_auth') === 'true';
        if (isAdmin) setIsCreatorMode(true);
    }, []);

    const handleLogoClick = () => {
        const isAdmin = sessionStorage.getItem('admin_auth') === 'true';
        if (isAdmin) {
            toast.success("Admin session active. Posting as Doni.");
            return;
        }
        const password = prompt("Enter Creator Access Code:");
        if (password === 'doni123') {
            setIsCreatorMode(true);
            toast.success("Creator Mode Active!");
        } else {
            toast.error("Unauthorized!");
        }
    };

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('portfolio_comments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const pinned = data.find(c => c.is_pinned);
            const regular = data.filter(c => !c.parent_id && !c.is_pinned);
            const reps = data.filter(c => c.parent_id).reduce((acc, reply) => {
                if (!acc[reply.parent_id]) acc[reply.parent_id] = [];
                acc[reply.parent_id].push(reply);
                return acc;
            }, {});

            setPinnedComment(pinned);
            setComments(regular);
            setReplies(reps);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    useEffect(() => {
        AOS.init({ once: false, duration: 1000 });
        fetchComments();

        const subscription = supabase
            .channel('portfolio_comments')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'portfolio_comments' },
                () => fetchComments()
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleCommentSubmit = useCallback(async ({ newComment, userName, parentId = null }) => {
        setError('');
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('portfolio_comments')
                .insert([
                    {
                        content: newComment,
                        user_name: userName,
                        parent_id: parentId,
                        is_pinned: false,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
            fetchComments();
            setReplyingTo(null);
            toast.success("Komentar berhasil dikirim!");
        } catch (error) {
            toast.error("Gagal mengirim komentar. Silakan coba lagi.");
            console.error('Error adding comment: ', error);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const formatDate = useCallback((timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        }).format(date);
    }, []);

    const totalComments = comments.length + (pinnedComment ? 1 : 0);

    return (
        <div className="w-full bg-gradient-to-b from-white/10 to-white/5 rounded-2xl  backdrop-blur-xl shadow-xl" data-aos="fade-up" data-aos-duration="1000">
            <div className="p-6 border-b border-white/10" data-aos="fade-down" data-aos-duration="800">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-xl bg-indigo-500/20 cursor-pointer hover:bg-indigo-500/30 transition-colors"
                        onClick={handleLogoClick}
                        title="Creator Login"
                    >
                        <MessageCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                        Comments <span className="text-indigo-400">({totalComments})</span>
                        {isCreatorMode && <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">Creator Mode</span>}
                    </h3>
                </div>
            </div>
            <div className="p-6 space-y-6">
                {error && (
                    <div className="flex items-center gap-2 p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl" data-aos="fade-in">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div>
                    <CommentForm onSubmit={handleCommentSubmit} isSubmitting={isSubmitting} error={error} />
                </div>

                <div className="space-y-4 pt-1 pr-1 overflow-y-auto max-h-[500px] custom-scrollbar" data-aos="fade-up" data-aos-delay="200">
                    {pinnedComment && (
                        <div data-aos="fade-down" data-aos-duration="800">
                            <Comment
                                comment={pinnedComment}
                                formatDate={formatDate}
                                index={0}
                                isPinned={true}
                                onReply={isCreatorMode ? (c) => setReplyingTo(c) : null}
                            />
                            {replyingTo?.id === pinnedComment.id && (
                                <div className="mt-4 ml-8 sm:ml-12 bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <CommentForm
                                        onSubmit={(data) => handleCommentSubmit({ ...data, parentId: pinnedComment.id })}
                                        isSubmitting={isSubmitting}
                                        placeholder={`Reply to ${pinnedComment.user_name}...`}
                                        buttonText="Post Reply"
                                        onCancel={() => setReplyingTo(null)}
                                        showNameInput={false}
                                        initialName="Doni"
                                    />
                                </div>
                            )}
                            {replies[pinnedComment.id]?.map((reply) => (
                                <Comment
                                    key={reply.id}
                                    comment={reply}
                                    formatDate={formatDate}
                                    isReply={true}
                                    replyToName={pinnedComment.user_name}
                                />
                            ))}
                        </div>
                    )}

                    {comments.length === 0 && !pinnedComment ? (
                        <div className="text-center py-8" data-aos="fade-in">
                            <UserCircle2 className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" />
                            <p className="text-gray-400">No comments yet. Start the conversation!</p>
                        </div>
                    ) : (() => {
                        const maxVisible = pinnedComment ? 0 : 1;
                        const hiddenCount = comments.length - maxVisible;
                        return (
                            <>
                                {(showAll ? comments : comments.slice(0, maxVisible)).map((comment, index) => (
                                    <div key={comment.id} className="space-y-4">
                                        <Comment
                                            comment={comment}
                                            formatDate={formatDate}
                                            index={index + (pinnedComment ? 1 : 0)}
                                            onReply={isCreatorMode ? (c) => setReplyingTo(c) : null}
                                        />
                                        {replyingTo?.id === comment.id && (
                                            <div className="ml-8 sm:ml-12 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <CommentForm
                                                    onSubmit={(data) => handleCommentSubmit({ ...data, parentId: comment.id })}
                                                    isSubmitting={isSubmitting}
                                                    placeholder={`Reply to ${comment.user_name}...`}
                                                    buttonText="Post Reply"
                                                    onCancel={() => setReplyingTo(null)}
                                                    showNameInput={false}
                                                    initialName="Doni"
                                                />
                                            </div>
                                        )}
                                        {replies[comment.id]?.map((reply) => (
                                            <Comment
                                                key={reply.id}
                                                comment={reply}
                                                formatDate={formatDate}
                                                isReply={true}
                                                replyToName={comment.user_name}
                                            />
                                        ))}
                                    </div>
                                ))}

                                {hiddenCount > 0 && (
                                    <button
                                        onClick={() => setShowAll(!showAll)}
                                        className="w-full py-3 mt-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all font-medium text-sm flex items-center justify-center gap-2"
                                    >
                                        {showAll ? (
                                            <>
                                                <span>See Less</span>
                                                <X className="w-4 h-4" />
                                            </>
                                        ) : (
                                            <>
                                                <span>See More ({hiddenCount} more)</span>
                                                <MessageCircle className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.5);
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.7);
                }
            `}</style>
        </div>
    );
};

export default Komentar;