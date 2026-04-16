import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Briefcase } from "lucide-react";

const Timeline = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        const { data, error } = await supabase
            .from("experiences")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) console.error("Error fetching experiences:", error);
        else setExperiences(data || []);
        setLoading(false);
    };

    if (loading) {
        return (
            <section className="py-16 relative" id="Timeline">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">Loading experiences...</p>
                </div>
            </section>
        );
    }

    if (experiences.length === 0) return null;

    return (
        <section className="py-16 relative" id="Timeline">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12" data-aos="fade-up">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent mb-3">
                        Experience
                    </h2>
                    <p className="text-gray-400">Perjalanan karir dan pengalaman profesional.</p>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-blue-500/30 to-transparent"></div>

                    {experiences.map((exp, index) => {
                        const isLeft = index % 2 === 0;
                        return (
                            <div
                                key={exp.id}
                                className={`relative flex items-start mb-4 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
                                data-aos={isLeft ? "fade-right" : "fade-left"}
                                data-aos-delay={index * 100}
                            >
                                {/* Dot */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#030014] z-10 mt-1.5"></div>

                                {/* Content */}
                                <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-8 md:text-right" : "md:pl-8 md:text-left"}`}>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-purple-500/20 transition-all duration-300 group">
                                        {/* Year badge */}
                                        <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
                                            {exp.year}
                                        </span>

                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                            {exp.title}
                                        </h3>

                                        {exp.company && (
                                            <div className={`flex items-center gap-2 text-gray-400 text-sm mb-3 ${isLeft ? "md:justify-end" : ""}`}>
                                                <Briefcase className="w-3.5 h-3.5" />
                                                {exp.company}
                                            </div>
                                        )}

                                        {exp.description && (
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Timeline;
