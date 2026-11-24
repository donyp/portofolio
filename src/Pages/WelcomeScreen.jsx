import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const TypewriterEffect = ({ text }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const BackgroundEffect = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-3xl animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 via-transparent to-purple-600/10 blur-2xl animate-float" />
  </div>
);

const WelcomeScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already shown in this session
    const hasSeenWelcome = sessionStorage.getItem("welcomeSeen");
    if (hasSeenWelcome) {
      onLoadingComplete?.();
      return;
    }

    AOS.init({
      duration: 1000,
      once: false,
      mirror: false,
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        sessionStorage.setItem("welcomeSeen", "true");
        onLoadingComplete?.();
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  const handleSkip = () => {
    setIsLoading(false);
    sessionStorage.setItem("welcomeSeen", "true");
    onLoadingComplete?.();
  };

  const containerVariants = {
    exit: {
      opacity: 0,
      scale: 1.1,
      filter: "blur(10px)",
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const childVariants = {
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-[#030014] z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit="exit"
          variants={containerVariants}
        >
          <BackgroundEffect />

          {/* Skip Button */}
          <motion.button
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors flex items-center gap-2 group z-50"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-sm font-medium">Skip</span>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>

          <div className="relative min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-4xl mx-auto">
              {/* Logo Initials */}
              <motion.div
                className="flex justify-center mb-6 sm:mb-8 md:mb-12"
                variants={childVariants}
              >
                <div data-aos="zoom-in" data-aos-delay="200">
                  <div className="relative group hover:scale-110 transition-transform duration-300">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-300" />
                    <div className="relative px-6 py-4 sm:px-8 sm:py-5 bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-wider">
                        DS
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Welcome Text */}
              <motion.div
                className="text-center mb-6 sm:mb-8 md:mb-12"
                variants={childVariants}
              >
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold space-y-2 sm:space-y-4">
                  <div className="mb-2 sm:mb-4">
                    <span data-aos="fade-right" data-aos-delay="400" className="inline-block px-2 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                      Hi, I'm Doni
                    </span>
                  </div>
                  <div className="flex justify-center gap-2 md:gap-3 pb-2">
                    <span data-aos="fade-up" data-aos-delay="800" className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent pb-2">
                      Let's Create
                    </span>
                    <span data-aos="fade-up" data-aos-delay="1000" className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent pb-2">
                      Together
                    </span>
                  </div>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                className="text-center"
                variants={childVariants}
                data-aos="fade-up"
                data-aos-delay="1200"
              >
                <p className="text-lg sm:text-xl md:text-2xl">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    <TypewriterEffect text="Creative Designer & Visual Storyteller" />
                  </span>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;