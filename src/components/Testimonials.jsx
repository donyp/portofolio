import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        const { data, error } = await supabase
            .from("testimonials")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) console.error("Error fetching testimonials:", error);
        else setTestimonials(data || []);
        setLoading(false);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    if (loading) {
        return (
            <section className="py-20 px-[5%] md:px-[10%] bg-transparent relative overflow-hidden" id="Testimonials">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">Loading reviews...</p>
                </div>
            </section>
        );
    }

    if (testimonials.length === 0) return null;

    const current = testimonials[currentIndex];

    return (
        <section className="py-20 px-[5%] md:px-[10%] bg-transparent relative overflow-hidden" id="Testimonials">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16" data-aos="fade-up">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent mb-3">
                        Client Reviews
                    </h2>
                    <p className="text-gray-400">Apa kata mereka tentang hasil kerjasama kita.</p>
                </div>

                {/* Testimonial Card */}
                <div className="relative" data-aos="fade-up" data-aos-delay="100">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl relative overflow-hidden">
                        {/* Quote icon */}
                        <Quote className="absolute top-6 right-6 w-12 h-12 text-purple-500/10" />

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Photo */}
                            <div className="shrink-0">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-purple-500/30 bg-white/5">
                                    {current.client_photo ? (
                                        <img
                                            src={current.client_photo}
                                            alt={current.client_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-purple-400">
                                            {current.client_name?.charAt(0) || "?"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-left">
                                {/* Stars */}
                                <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < (current.rating || 5)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-600"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Review */}
                                <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 italic">
                                    "{current.review_text}"
                                </p>

                                {/* Name */}
                                <div>
                                    <h4 className="text-white font-semibold text-lg">{current.client_name}</h4>
                                    {current.client_role && (
                                        <p className="text-purple-400 text-sm">{current.client_role}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    {testimonials.length > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={prevSlide}
                                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Dots */}
                            <div className="flex items-center gap-2">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex
                                            ? "w-6 bg-purple-500"
                                            : "bg-white/20 hover:bg-white/40"
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
