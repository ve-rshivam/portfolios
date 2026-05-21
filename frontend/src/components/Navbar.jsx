import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Window resize handler for mobile detection
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 1024; // Threshold for mobile view

  useEffect(() => {
    setIsDarkMode(document.body.classList.contains('dark'));
  }, []);

  const toggleTheme = (e) => {
    const nextThemeIsDark = !isDarkMode;
    if (!document.startViewTransition) {
      document.body.className = nextThemeIsDark ? 'dark' : 'light';
      setIsDarkMode(nextThemeIsDark);
      return;
    }

    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || 0;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      document.body.className = nextThemeIsDark ? 'dark' : 'light';
      setIsDarkMode(nextThemeIsDark);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 600,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  const navItems = ['Home', 'About', 'Skills', 'Projects', 'Experience', 'Services', 'Payment', 'Portal'];

  return (
    <nav style={{ 
      padding: isMobile ? '20px 5vw' : '20px 8vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--nav-bg)',
      position: 'sticky', 
      top: 0,
      zIndex: 999, // High z-index to stay above content
      backdropFilter: 'blur(10px)', 
      transition: 'background 0.3s ease, border-color 0.3s ease'
    }}>
      
      {/* 1. Logo (Always visible on left) */}
      <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0, color: 'var(--text-main)', letterSpacing: '1px' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Shivam<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
      </h1>

      {/* 2. Desktop Links / Mobile Toggles Container */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '15px' : '40px' }}>
        
        {/* DESKTOP VIEW: Navigation Links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '30px' }}>
            {navItems.map(item => (
              <Link 
                key={item} 
                to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`} 
                style={{
                  color: 'var(--text-main)', 
                  textDecoration: 'none', 
                  fontSize: '15px', 
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--accent)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-main)'}
              >
                {item}
              </Link>
            ))}
          </div>
        )}

        {/* 3. Circular Theme Toggle Button (Visible on both Mobile & Desktop) */}
        <button 
          onClick={toggleTheme} 
          style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '40px', 
            height: '40px', 
            border: '1px solid var(--border-color)', 
            borderRadius: '50%', 
            color: 'var(--text-main)', 
            background: 'var(--bg-card)',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            zIndex: 1001 // Ensure it's clickable above mobile menu
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 15px var(--accent-glow)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = 'var(--border-color)';
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'scale(1)';
          }}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* MOBILE VIEW: Hamburger Menu Icon */}
        {isMobile && (
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              width: '30px',
              height: '24px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              zIndex: 1001 // Stay above the dropdown
            }}
          >
            {/* Animated Hamburger Lines */}
            <motion.div 
              animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 10 : 0 }}
              style={{ width: '30px', height: '3px', background: 'var(--text-main)', borderRadius: '10px', transformOrigin: '1px' }} 
            />
            <motion.div 
              animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
              style={{ width: '30px', height: '3px', background: 'var(--text-main)', borderRadius: '10px' }} 
            />
            <motion.div 
              animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -10 : 0 }}
              style={{ width: '30px', height: '3px', background: 'var(--text-main)', borderRadius: '10px', transformOrigin: '1px' }} 
            />
          </button>
        )}
      </div>

      {/* MOBILE VIEW: Dropdown Menu Overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              background: 'var(--nav-bg)',
              borderBottom: '1px solid var(--border-color)',
              padding: '20px 5vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {navItems.map(item => (
              <Link 
                key={item} 
                to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`} 
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                style={{
                  color: 'var(--text-main)', 
                  textDecoration: 'none', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '10px'
                }}
              >
                {item}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
};

export default Navbar;