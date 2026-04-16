import { BrowserRouter, Routes, Route, Link, useLocation, Outlet } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import "./index.css";
import Home from "./Pages/Home";
import About from "./Pages/About";
import AnimatedBackground from "./components/Background";
import Navbar from "./components/Navbar";
import Portofolio from "./Pages/Portofolio";
import ContactPage from "./Pages/Contact";
import ProjectDetails from "./components/ProjectDetail";
import WelcomeScreen from "./Pages/WelcomeScreen";
import { AnimatePresence, motion } from 'framer-motion';
import NotFoundPage from "./Pages/404";
import Blog from "./Pages/Blog";
import BlogDetail from "./Pages/BlogDetail";
import LatestBlog from "./components/LatestBlog";
import Admin from "./Pages/Admin";
import Services from "./Pages/Services";
import Testimonials from "./components/Testimonials";
import { supabase } from "./supabase";

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// Footer Component
const Footer = () => (
  <footer>
    <center>
      <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
      <div className="flex justify-center items-center gap-2">
        <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
          © 2026{" "}
          <Link to="/" className="hover:underline">
            Doni Sugiharto
          </Link>
          . All Rights Reserved.
        </span>
        <Link to="/admin" className="opacity-0 hover:opacity-10 transition-opacity cursor-default w-4 h-4 mb-4">.</Link>
      </div>
    </center>
  </footer>
);

// Layout Component
const Layout = ({ showWelcome, setShowWelcome }) => (
  <>
    <AnimatePresence mode="wait">
      {showWelcome && (
        <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
      )}
    </AnimatePresence>

    {!showWelcome && (
      <>
        <Navbar />
        <AnimatedBackground />
        <PageTransition>
          <Outlet />
        </PageTransition>
        <Footer />
      </>
    )}
  </>
);

// Page view tracker
const usePageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const visitorId = localStorage.getItem("visitor_id") || (() => {
          const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2, 11);
          localStorage.setItem("visitor_id", id);
          return id;
        })();

        const deviceType = window.innerWidth < 768 ? "mobile" : "desktop";

        await supabase.from("page_views").insert({
          page_path: location.pathname,
          visitor_id: visitorId,
          device_type: deviceType
        });
      } catch (err) {
        // Silently fail
      }
    };

    trackPageView();
  }, [location.pathname]);
};

const PageViewTracker = () => {
  usePageViewTracker();
  return null;
};

const HomePage = () => (
  <>
    <Home />
    <LatestBlog />
    <About />
    <Portofolio />
    <Testimonials />
    <ContactPage />
  </>
);

function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    return window.location.pathname === "/";
  });

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const { data } = await supabase.from("site_settings").select("meta_title, meta_description").single();
        if (data) {
          if (data.meta_title) document.title = data.meta_title;
          if (data.meta_description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.name = "description";
              document.head.appendChild(metaDesc);
            }
            metaDesc.content = data.meta_description;
          }
        }
      } catch (err) {
        console.error("SEO Fetch Error:", err);
      }
    };
    fetchSEO();
  }, []);

  return (
    <BrowserRouter>
      <PageViewTracker />
      <Routes>
        <Route element={<Layout showWelcome={showWelcome} setShowWelcome={() => setShowWelcome(false)} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/services" element={<Services />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;