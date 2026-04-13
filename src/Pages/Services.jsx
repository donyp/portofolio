import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { ArrowLeft, MessageCircle, Palette, PenTool, Layout, Film, Camera, Monitor, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const iconMap = {
    Palette, PenTool, Layout, Film, Camera, Monitor, Sparkles, MessageCircle
};

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        AOS.init({ once: false });
        fetchServices();
    }, []);

    const fetchServices = async () => {
        const { data, error } = await supabase
            .from("services")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        if (error) console.error("Error fetching services:", error);
        else setServices(data || []);
        setLoading(false);
    };

    const handleOrder = (service) => {
        let template = service.whatsapp_template ||
            `Halo Kak Doni! Saya tertarik dengan layanan ${service.title}. Bisa info lebih lanjut?`;

        // If template is a full WhatsApp URL, extract the text parameter
        if (template.includes("wa.me") || template.includes("whatsapp.com")) {
            try {
                const url = new URL(template);
                const params = new URLSearchParams(url.search);
                const extractedText = params.get("text");
                if (extractedText) template = extractedText;
            } catch (e) {
                // If URL parsing fails, just use it as is
            }
        }

        // Use custom number from DB if available, otherwise use default
        let phone = service.whatsapp_number || "085117778351";

        // Format phone: remove spaces/dashes, ensure it starts with 62
        phone = phone.replace(/[^0-9]/g, "");
        if (phone.startsWith("0")) {
            phone = "62" + phone.substring(1);
        } else if (!phone.startsWith("62")) {
            phone = "62" + phone;
        }

        const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(template)}`;
        window.open(waUrl, "_blank");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-28 pb-16 px-[5%] md:px-[10%]">
            <div className="max-w-6xl mx-auto">
                {/* Back */}
                <Link
                    to="/"
                    className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10"
                    data-aos="fade-right"
                >
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="text-center mb-16" data-aos="fade-up">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent mb-4">
                        Services
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Layanan desain profesional untuk kebutuhan visual brand Anda.
                    </p>
                </div>

                {/* Services Grid */}
                {services.length === 0 ? (
                    <div className="text-center py-20" data-aos="fade-up">
                        <Sparkles className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Layanan akan segera tersedia. Stay tuned!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => {
                            const IconComponent = iconMap[service.icon] || Palette;
                            return (
                                <div
                                    key={service.id}
                                    className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2"
                                    data-aos="fade-up"
                                    data-aos-delay={index * 100}
                                >
                                    {/* Gradient glow */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>

                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <IconComponent className="w-7 h-7 text-purple-400" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                        {service.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                        {service.description}
                                    </p>

                                    {/* Price */}
                                    {service.price_text && (
                                        <div className="mb-6">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Mulai dari</span>
                                            <p className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                                {service.price_text}
                                            </p>
                                        </div>
                                    )}

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleOrder(service)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white font-medium text-sm hover:from-purple-600/40 hover:to-blue-600/40 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Order via WhatsApp
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
