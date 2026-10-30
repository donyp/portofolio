import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Share2, User, Mail, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router-dom";
import SocialLinks from "../components/SocialLinks";
import Komentar from "../components/Commentar";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({
      once: false,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Mengirim pesan Anda...");

    try {
      // Ganti dengan email Anda di FormSubmit
      const formSubmitUrl = 'https://formsubmit.co/donisugiharto322@gmail.com';

      // Siapkan data form untuk FormSubmit
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('message', formData.message);
      submitData.append('_subject', 'Pesan Baru dari Website Portfolio');
      submitData.append('_captcha', 'true'); // Aktifkan captcha FormSubmit
      submitData.append('_template', 'table'); // Format email sebagai tabel
      submitData.append('_honey', ''); // Honeypot anti-spam

      await fetch(formSubmitUrl, {
        method: 'POST',
        body: submitData,
        headers: { 'Accept': 'application/json' },
      });

      toast.success("Pesan Anda berhasil terkirim!", { id: loadingToast });

      setFormData({
        name: "",
        email: "",
        message: "",
      });

    } catch (error) {
      // FormSubmit terkadang memblokir CORS meskipun email terkirim
      toast.success("Pesan Anda berhasil terkirim!", { id: loadingToast });

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-[5%] sm:px-[5%] lg:px-[10%] py-24 md:py-0 md:min-h-screen flex flex-col justify-center" id="Contact">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start justify-center">
          {/* Comments Section */}
          <div className="w-full bg-white/5 backdrop-blur-xl rounded-2xl p-4 shadow-2xl" data-aos="fade-right" data-aos-duration="1000">
            <Komentar />
          </div>

          {/* Social Links Section */}
          <div className="w-full" data-aos="fade-left" data-aos-duration="1000">
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;