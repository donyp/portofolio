import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import React, { useState } from 'react';
import "./index.css";
import Home from "./Pages/Home";
import About from "./Pages/About";
import AnimatedBackground from "./components/Background";
import Navbar from "./components/Navbar";
import Portofolio from "./Pages/Portofolio";
import ContactPage from "./Pages/Contact";
import ProjectDetails from "./components/ProjectDetail";
import WelcomeScreen from "./Pages/WelcomeScreen";
import { AnimatePresence } from 'framer-motion';
import NotFoundPage from "./Pages/404";
import Blog from "./Pages/Blog";
import BlogDetail from "./Pages/BlogDetail";
import LatestBlog from "./components/LatestBlog";
import Admin from "./Pages/Admin";

const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
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
          <Home />
          <LatestBlog />
          <About />
          <Portofolio />
          <ContactPage />
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
                {/* Hidden Admin Button */}
                <Link to="/admin" className="opacity-0 hover:opacity-10 transition-opacity cursor-default w-4 h-4 mb-4">.</Link>
              </div>
            </center>
          </footer>
        </>
      )}
    </>
  );
};

const ProjectPageLayout = () => (
  <>
    <Navbar />
    <ProjectDetails />
    <footer>
      <center>
        <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
        <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
          © 2026{" "}
          <a href="/" className="hover:underline">
            Doni Sugiharto
          </a>
          . All Rights Reserved.
        </span>
      </center>
    </footer>
  </>
);

const BlogPageLayout = () => (
  <>
    <Navbar />
    <Blog />
    <footer>
      <center>
        <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
        <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
          © 2026{" "}
          <a href="/" className="hover:underline">
            Doni Sugiharto
          </a>
          . All Rights Reserved.
        </span>
      </center>
    </footer>
  </>
);

const BlogDetailLayout = () => (
  <>
    <Navbar />
    <BlogDetail />
    <footer>
      <center>
        <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
        <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
          © 2026{" "}
          <a href="/" className="hover:underline">
            Doni Sugiharto
          </a>
          . All Rights Reserved.
        </span>
      </center>
    </footer>
  </>
);



function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />} />
        <Route path="/project/:id" element={<ProjectPageLayout />} />
        <Route path="/blog" element={<BlogPageLayout />} />
        <Route path="/blog/:id" element={<BlogDetailLayout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFoundPage />} /> {/* Ini route 404 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;