import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { ArrowLeft, MessageCircle, Palette, PenTool, Layout, Film, Camera, Monitor, Sparkles, X, User, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";

const iconMap = {
    Palette, PenTool, Layout, Film, Camera, Monitor, Sparkles, MessageCircle
};

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", contact: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        AOS.init({ once: false });
        fetchServices();
    }, []);

    const fetchServices = async () => {
        const { data, error } = await supabase
            .from("services")
            .select("id, title, description, icon, price_text, sort_order, is_active")
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        if (error) console.error("Error fetching services:", error);
        else setServices(data || []);
        setLoading(false);
    };

    const handleOrder = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
        setFormData({ name: "", contact: "", message: "" });
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.contact) {
            Swal.fire({
                title: "Error!",
                text: "Nama dan Kontak wajib diisi.",
                icon: "error",
                background: "#030014",
                color: "#ffffff"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("service_orders")
                .insert([{
                    service_id: selectedService.id,
                    service_title: selectedService.title,
                    name: formData.name,
                    contact: formData.contact,
                    message: formData.message,
                    status: 'pending'
                }]);

            if (error) throw error;

            Swal.fire({
                title: "Berhasil!",
                text: "Pesanan Anda telah terkirim. Saya akan segera menghubungi Anda.",
                icon: "success",
                background: "#030014",
                color: "#ffffff"
            });
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error submitting order:", err);
            Swal.fire({
                title: "Gagal!",
                text: "Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi.",
                icon: "error",
                background: "#030014",
                color: "#ffffff"
            });
        } finally {
            setIsSubmitting(false);
        }
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
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" /> Back to Home
                </Link>

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent mb-4">
                        Services
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const IconComponent = iconMap[service.icon] || Palette;
                        return (
                            <div key={service.id} className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-500">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-6">
                                    <IconComponent className="w-7 h-7 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">{service.description}</p>
                                <button
                                    onClick={() => handleOrder(service)}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white font-medium text-sm hover:from-purple-600/40 hover:to-blue-600/40 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4" /> Order Now
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-[#030014]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-[#110c2e] border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Order Service</h2>
                            <p className="text-gray-400 text-sm">Layanan: <span className="text-purple-400">{selectedService?.title}</span></p>
                        </div>

                        <form onSubmit={handleOrderSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Nama</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 text-white outline-none" placeholder="Nama Anda" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Kontak</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input type="text" required className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 text-white outline-none" placeholder="Email/WA" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center gap-2">
                                {isSubmitting ? "Sending..." : "Send Order"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
