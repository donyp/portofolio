import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ExternalLink, Github, Code2, Star,
  ChevronRight, Layers, Layout, Globe, Package, Cpu, Code, Heart, Stars, Eye
} from "lucide-react";
import Swal from 'sweetalert2';
import { supabase } from "../supabase";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const TECH_ICONS = {
  React: Globe,
  Tailwind: Layout,
  Express: Cpu,
  Python: Code,
  Javascript: Code,
  HTML: Code,
  CSS: Code,
  default: Package,
};

const TechBadge = ({ tech }) => {
  const Icon = TECH_ICONS[tech] || TECH_ICONS["default"];

  return (
    <div className="group relative overflow-hidden px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300 cursor-default">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
      <div className="relative flex items-center gap-1.5 md:gap-2">
        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
        <span className="text-xs md:text-sm font-medium text-blue-300/90 group-hover:text-blue-200 transition-colors">
          {tech}
        </span>
      </div>
    </div>
  );
};

const FeatureItem = ({ feature }) => {
  return (
    <li className="group flex items-start space-x-3 p-2.5 md:p-3.5 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
      <div className="relative mt-2">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
        <div className="relative w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 group-hover:scale-125 transition-transform duration-300" />
      </div>
      <span className="text-sm md:text-base text-gray-300 group-hover:text-white transition-colors">
        {feature}
      </span>
    </li>
  );
};

const ProjectStats = ({ project }) => {
  const techStackCount = project?.TechStack?.length || 0;
  const featuresCount = project?.Features?.length || 0;

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-[#0a0a1a] rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 opacity-50 blur-2xl z-0" />

      <div className="relative z-10 flex items-center space-x-2 md:space-x-3 bg-white/5 p-2 md:p-3 rounded-lg border border-blue-500/20 transition-all duration-300 hover:scale-105 hover:border-blue-500/50 hover:shadow-lg">
        <div className="bg-blue-500/20 p-1.5 md:p-2 rounded-full">
          <Code2 className="text-blue-300 w-4 h-4 md:w-6 md:h-6" strokeWidth={1.5} />
        </div>
        <div className="flex-grow">
          <div className="text-lg md:text-xl font-semibold text-blue-200">{techStackCount}</div>
          <div className="text-[10px] md:text-xs text-gray-400">Software</div>
        </div>
      </div>

      <div className="relative z-10 flex items-center space-x-2 md:space-x-3 bg-white/5 p-2 md:p-3 rounded-lg border border-purple-500/20 transition-all duration-300 hover:scale-105 hover:border-purple-500/50 hover:shadow-lg">
        <div className="bg-purple-500/20 p-1.5 md:p-2 rounded-full">
          <Layers className="text-purple-300 w-4 h-4 md:w-6 md:h-6" strokeWidth={1.5} />
        </div>
        <div className="flex-grow">
          <div className="text-lg md:text-xl font-semibold text-purple-200">{featuresCount}</div>
          <div className="text-[10px] md:text-xs text-gray-400">Fitur Utama</div>
        </div>
      </div>
    </div>
  );
};

const handleGithubClick = (githubLink) => {
  if (githubLink === 'Private') {
    Swal.fire({
      icon: 'info',
      title: 'Source Code Private',
      text: 'Maaf, source code untuk proyek ini bersifat privat.',
      confirmButtonText: 'Mengerti',
      confirmButtonColor: '#3085d6',
      background: '#030014',
      color: '#ffffff'
    });
    return false;
  }
  return true;
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [views, setViews] = useState(0);
  const [prevProject, setPrevProject] = useState(null);
  const [nextProject, setNextProject] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const currentIndex = storedProjects.findIndex((p) => String(p.id) === id);
    const selectedProject = storedProjects[currentIndex];

    if (selectedProject) {
      const enhancedProject = {
        ...selectedProject,
        Features: selectedProject.Features || [],
        TechStack: selectedProject.TechStack || [],
        Github: selectedProject.Github || 'https://github.com/donyp',
      };
      setProject(enhancedProject);
      // Reset states
      setUserRating(0);
      setIsLiked(false);
      setLikes(enhancedProject.likes || 0);
      setAvgRating(enhancedProject.average_rating || 0);
      setTotalRatings(enhancedProject.total_ratings || 0);

      const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
      if (likedProjects.includes(enhancedProject.id)) {
        setIsLiked(true);
      }

      // Check if user already rated
      const ratedProjects = JSON.parse(localStorage.getItem('ratedProjects') || '{}');
      if (ratedProjects[enhancedProject.id]) {
        setUserRating(ratedProjects[enhancedProject.id]);
      }

      // Next / Prev navigation logic
      setPrevProject(currentIndex > 0 ? storedProjects[currentIndex - 1] : null);
      setNextProject(currentIndex < storedProjects.length - 1 ? storedProjects[currentIndex + 1] : null);

      // Views logic
      const handleView = async () => {
        const viewedProjects = JSON.parse(localStorage.getItem('viewedProjects') || '[]');
        let currentViews = enhancedProject.views || 0;

        if (!viewedProjects.includes(enhancedProject.id)) {
          currentViews += 1;
          localStorage.setItem('viewedProjects', JSON.stringify([...viewedProjects, enhancedProject.id]));

          // Update cache
          const cachedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
          const updatedProjects = cachedProjects.map(p =>
            p.id === enhancedProject.id ? { ...p, views: currentViews } : p
          );
          localStorage.setItem('projects', JSON.stringify(updatedProjects));

          await supabase.from('projects').update({ views: currentViews }).eq('id', enhancedProject.id);
        }
        setViews(currentViews);
      };
      handleView();
    }
  }, [id]);

  const handleRating = async (rating) => {
    console.log("Handle Rating trigged with:", rating);
    if (userRating > 0) {
      console.log("Rating blocked - user already rated:", userRating);
      Swal.fire({
        icon: 'info',
        title: 'Sudah Rating',
        text: 'Terimakasih! Kakak sudah memberikan rating untuk project ini sebelumnya.',
        background: '#030014',
        color: '#ffffff'
      });
      return;
    }

    try {
      const newTotalRatings = totalRatings + 1;
      const newAvgRating = ((avgRating * totalRatings) + rating) / newTotalRatings;

      setAvgRating(newAvgRating.toFixed(1));
      setTotalRatings(newTotalRatings);
      setUserRating(rating);

      const ratedProjects = JSON.parse(localStorage.getItem('ratedProjects') || '{}');
      ratedProjects[project.id] = rating;
      localStorage.setItem('ratedProjects', JSON.stringify(ratedProjects));

      // Update Supabase
      const { error } = await supabase.from('projects').update({
        average_rating: newAvgRating,
        total_ratings: newTotalRatings
      }).eq('id', project.id);

      if (error) throw error;

      // Log the rating
      await supabase.from('ratings_log').insert({
        project_id: project.id,
        rating: rating,
        user_session_id: 'anon' // Simple anon session
      });

      Swal.fire({
        icon: 'success',
        title: 'Terimakasih',
        text: 'Rating anda sangat berarti untuk saya',
        background: '#030014',
        color: '#ffffff'
      });
    } catch (err) {
      console.error("Error updating rating:", err);
    }
  };

  const handleLike = async () => {
    if (isLiked || !project) return;
    try {
      const newLikes = likes + 1;
      setLikes(newLikes);
      setIsLiked(true);

      const likedProjects = JSON.parse(localStorage.getItem('likedProjects') || '[]');
      localStorage.setItem('likedProjects', JSON.stringify([...likedProjects, project.id]));

      // Update projects array in localStorage to prevent flashing old data
      const cachedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const updatedProjects = cachedProjects.map(p =>
        p.id === project.id ? { ...p, likes: newLikes } : p
      );
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      const { error } = await supabase.from('projects').update({ likes: newLikes }).eq('id', project.id);
      if (error) console.error("Supabase update error:", error);
    } catch (err) {
      console.error("Error updating likes:", err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num;
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <h2 className="text-xl md:text-3xl font-bold text-white">Loading Project...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] px-[2%] sm:px-0 relative overflow-hidden">
      {/* Background animations remain unchanged */}
      <div className="fixed inset-0">
        <div className="absolute -inset-[10px] opacity-20">
          <div className="absolute top-0 -left-4 w-72 md:w-96 h-72 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 md:w-96 h-72 md:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 md:w-96 h-72 md:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      <div className="relative" key={id}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="flex items-center space-x-2 md:space-x-4 mb-8 md:mb-12 animate-fadeIn">
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => window.scrollTo(0, 0), 100);
              }}
              className="group inline-flex items-center space-x-1.5 md:space-x-2 px-3 md:px-5 py-2 md:py-2.5 bg-white/5 backdrop-blur-xl rounded-xl text-white/90 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-1 md:space-x-2 text-sm md:text-base text-white/50">
              <span>Projects</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-white/90 truncate">{project.Title}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
            <div className="space-y-6 md:space-y-10 animate-slideInLeft">
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
                  {project.Title}
                </h1>
                <div className="relative h-1 w-16 md:w-24">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm" />
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-base md:text-lg text-gray-300/90 leading-relaxed">
                  {project.Description}
                </p>
              </div>

              <ProjectStats project={project} />

              <div className="flex flex-wrap gap-3 md:gap-4">
                {/* Action buttons */}
                <a
                  href={project.Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2.5 md:py-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 text-blue-300 rounded-xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 backdrop-blur-xl overflow-hidden text-sm md:text-base"
                >
                  <div className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-blue-600/10 to-purple-600/10 transition-transform duration-300 group-hover:translate-y-[0%]" />
                  <ExternalLink className="relative w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                  <span className="relative font-medium">Live Demo</span>
                </a>

                <button
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`group relative inline-flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2.5 md:py-4 rounded-xl transition-all duration-300 border backdrop-blur-xl overflow-hidden text-sm md:text-base ${isLiked
                    ? 'bg-pink-500/10 border-pink-500/40 text-pink-400 cursor-default'
                    : 'bg-white/5 border-white/10 hover:bg-pink-500/10 hover:border-pink-500/40 text-gray-300 hover:text-pink-400'}`}
                >
                  <div className="absolute inset-0 translate-y-[100%] bg-pink-500/10 transition-transform duration-300 group-hover:translate-y-[0%]" />
                  <Heart className={`relative w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${isLiked ? 'fill-pink-400' : 'group-hover:block'}`} />
                  <span className="relative font-medium">{formatNumber(likes)} {likes === 1 ? 'Like' : 'Likes'}</span>
                </button>

                {/* View Counter Badge */}
                <div className="group relative inline-flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2.5 md:py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-gray-300 text-sm md:text-base">
                  <Eye className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  <span className="font-medium">{formatNumber(views)} {views === 1 ? 'View' : 'Views'}</span>
                </div>
              </div>

              {/* Rating System */}
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  Rate this Project
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className={`transition-all duration-300 transform hover:scale-125 ${userRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                      >
                        <Star className={`w-6 h-6 ${userRating >= star ? 'fill-yellow-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-gray-400">
                    {avgRating} ({formatNumber(totalRatings)} ratings)
                  </div>
                </div>
              </div>

              {/* Case Study Sections */}
              {(project.challenge || project.solution || project.result) && (
                <div className="space-y-4 md:space-y-6 mt-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white/90 flex items-center gap-2">
                    <Stars className="w-5 h-5 text-yellow-400" />
                    Case Study
                  </h3>

                  {project.challenge && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">The Challenge</h4>
                      <p className="text-gray-300/90 leading-relaxed text-sm md:text-base">{project.challenge}</p>
                    </div>
                  )}

                  {project.solution && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-purple-300 mb-2">The Solution</h4>
                      <p className="text-gray-300/90 leading-relaxed text-sm md:text-base">{project.solution}</p>
                    </div>
                  )}

                  {project.result && (
                    <div className="bg-pink-500/5 border border-pink-500/20 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-pink-300 mb-2">The Result</h4>
                      <p className="text-gray-300/90 leading-relaxed text-sm md:text-base">{project.result}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4 md:space-y-6 pt-6">
                <h3 className="text-lg md:text-xl font-semibold text-white/90 mt-[3rem] md:mt-0 flex items-center gap-2 md:gap-3">
                  <Code2 className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  Technologies Used
                </h3>
                {project.TechStack.length > 0 ? (
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {project.TechStack.map((tech, index) => (
                      <TechBadge key={index} tech={tech} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm md:text-base text-gray-400 opacity-50">No technologies added.</p>
                )}
              </div>
            </div>

            <div className="space-y-6 md:space-y-10 animate-slideInRight">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">

                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {project.lottie_url ? (
                  <div className="w-full aspect-video bg-black/20 flex items-center justify-center">
                    <DotLottieReact
                      src={project.lottie_url}
                      loop
                      autoplay
                    />
                  </div>
                ) : project.video_url ? (
                  <video
                    src={project.video_url}
                    controls
                    className="w-full object-cover"
                  />
                ) : (
                  <img
                    src={project.Img}
                    alt={project.Title}
                    className="w-full  object-cover transform transition-transform duration-700 will-change-transform group-hover:scale-105"
                    onLoad={() => setIsImageLoaded(true)}
                  />
                )}
                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-colors duration-300 rounded-2xl" />
              </div>

              {/* Fitur Utama */}
              <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-6 hover:border-white/20 transition-colors duration-300 group">
                <h3 className="text-xl font-semibold text-white/90 flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400 group-hover:rotate-[20deg] transition-transform duration-300" />
                  Key Features
                </h3>
                {project.Features.length > 0 ? (
                  <ul className="list-none space-y-2">
                    {project.Features.map((feature, index) => (
                      <FeatureItem key={index} feature={feature} />
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 opacity-50">No features added.</p>
                )}
              </div>
            </div>
          </div>

          {/* Next/Prev Navigation */}
          <div className="flex justify-between items-center mt-16 pt-8 border-t border-white/10 animate-fadeIn">
            <div className="flex-1 w-1/2 pr-4">
              {prevProject && (
                <button
                  onClick={() => navigate(`/project/${prevProject.id}`)}
                  className="group flex flex-col items-start gap-1 text-left w-full focus:outline-none"
                >
                  <span className="text-gray-400 text-xs md:text-sm flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                    <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> Previous
                  </span>
                  <span className="text-white font-medium group-hover:text-blue-300 transition-colors truncate w-full text-sm md:text-base">
                    {prevProject.Title}
                  </span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-white/10 mx-2"></div>

            <div className="flex-1 w-1/2 pl-4 flex justify-end">
              {nextProject && (
                <button
                  onClick={() => navigate(`/project/${nextProject.id}`)}
                  className="group flex flex-col items-end gap-1 text-right w-full focus:outline-none"
                >
                  <span className="text-gray-400 text-xs md:text-sm flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                    Next <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                  </span>
                  <span className="text-white font-medium group-hover:text-blue-300 transition-colors truncate w-full text-sm md:text-base">
                    {nextProject.Title}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.7s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.7s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetails;
