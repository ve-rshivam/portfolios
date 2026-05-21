import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- Component Imports ---
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import Preloader from './components/Preloader';     
import PageWrapper from './components/PageWrapper'; 

// --- Page Imports ---
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Resume from './pages/Resume';
import Services from './pages/Services';
import Payment from './pages/Payment';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import Reviews from './pages/Reviews';
import Admin from './pages/Admin';
import ClientPortal from './pages/ClientPortal';
import Experience from './pages/Experience'; // Naya Experience page import kiya hai

// 🔥 ROUTES KO ALAG COMPONENT ME RAKHNA ZARURI HAI (For Animations) 🔥
const AnimatedRoutes = () => {
  const location = useLocation(); // Current page ki location track karne ke liye

  return (
    // mode="wait" ka matlab hai pehle purana page jayega, tab naya aayega (No overlapping)
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Har page ko PageWrapper se cover kiya hai */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/skills" element={<PageWrapper><Skills /></PageWrapper>} />
        <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
        <Route path="/resume" element={<PageWrapper><Resume /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/payment" element={<PageWrapper><Payment /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
        <Route path="/refund" element={<PageWrapper><Refund /></PageWrapper>} />
        <Route path="/reviews" element={<PageWrapper><Reviews /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        <Route path="/experience" element={<PageWrapper><Experience /></PageWrapper>} /> {/* Naya Experience route */}
        <Route path="/portal" element={<PageWrapper><ClientPortal /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  // 1.5 seconds ke liye Loader dikhana
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {loading ? (
          // Jab site reload hogi toh pehle Preloader dikhega
          <Preloader key="preloader" />
        ) : (
          // Loader jane ke baad actual website dikhegi
          <div key="main-app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Navbar />
            <Chatbot />
            <div style={{ flexGrow: 1, paddingTop: '80px' }}>
              <AnimatedRoutes />
            </div>
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </Router>
  );
}

export default App;