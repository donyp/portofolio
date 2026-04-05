import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Heart, Eye, Star } from 'lucide-react';
import { supabase } from '../supabase';

const CardProject = ({ Img, Title, Description, Link: ProjectLink, id, likes = 0, views = 0, video_url = null, average_rating = 0 }) => {
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setLikeCount(likes);
    const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
    if (likedProjects.includes(id)) {
      setIsLiked(true);
    }
  }, [id, likes]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) return;

    try {
      const newLikes = likeCount + 1;
      setLikeCount(newLikes);
      setIsLiked(true);

      const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
      localStorage.setItem('likedProjects', JSON.stringify([...likedProjects, id]));

      const cachedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const updatedProjects = cachedProjects.map(p =>
        p.id === id ? { ...p, likes: newLikes } : p
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      const { error } = await supabase.from('projects').update({ likes: newLikes }).eq('id', id);
      if (error) console.error("Supabase update error:", error);
    } catch (err) {
      console.error("Error updating likes:", err);
    }
  };

  const handleLiveDemo = (e) => {
    if (!ProjectLink) {
      e.preventDefault();
      alert("Live demo link is not available");
    }
  };

  const handleDetails = (e) => {
    if (!id) {
      e.preventDefault();
      alert("Project details are not available");
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num;
  };

  return (
    <div className="group relative w-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-lg border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

        <div className="relative p-5 z-10">
          {/* Image / Video */}
          <div className="relative overflow-hidden rounded-lg aspect-video">
            {video_url && isHovered ? (
              <video
                src={video_url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-500 scale-105"
              />
            ) : (
              <img
                src={Img}
                alt={Title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            )}
          </div>

          {/* Title & Description */}
          <div className="mt-4 space-y-3">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {Title}
            </h3>

            <p className="text-gray-300/80 text-sm leading-relaxed line-clamp-2">
              {Description}
            </p>

            {/* Footer: Live Demo | Stats | Details */}
            <div className="pt-4 flex items-center justify-between gap-2">
              {ProjectLink ? (
                <a
                  href={ProjectLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLiveDemo}
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 shrink-0"
                >
                  <span className="text-sm font-medium">Live Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="text-gray-500 text-sm shrink-0">Demo Not Available</span>
              )}

              <div className="flex items-center gap-4">
                {/* Metrics */}
                <div className="flex items-center gap-2.5 text-gray-400">
                  {average_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-medium">{average_rating}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-medium">{formatNumber(views)}</span>
                  </div>
                  <button
                    onClick={handleLike}
                    disabled={isLiked}
                    className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{formatNumber(likeCount)}</span>
                  </button>
                </div>

                {/* Details Button */}
                {id ? (
                  <Link
                    to={`/project/${id}`}
                    onClick={handleDetails}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 transition-all duration-200 border border-white/10 hover:border-purple-500/30 shrink-0"
                  >
                    <span className="text-sm font-medium">Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="text-gray-500 text-sm">Details Not Available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 border border-white/0 group-hover:border-purple-500/50 rounded-xl transition-colors duration-300 -z-50"></div>
      </div>
    </div>
  );
};

export default CardProject;
