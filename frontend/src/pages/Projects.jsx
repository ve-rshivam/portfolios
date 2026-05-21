import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const Projects = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 Apna username yahan zaroor daaliyega 🔥
  const githubUsername = "ve-rshivam"; 

  // --- Mouse Proximity Glow Logic ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const cursorGlowX = useTransform(mouseX, (x) => `${x - 200}px`);
  const cursorGlowY = useTransform(mouseY, (y) => `${y - 200}px`);

  useEffect(() => {
    fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      padding: '120px 8vw 80px 8vw', 
      background: 'var(--bg-main)', 
      color: 'var(--text-main)', 
      overflow: 'hidden', 
      fontFamily: 'Inter, sans-serif',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      
      {/* --- Page Body Glow (Subtle Fixed Gradient) --- */}
      <div style={{
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        background: `radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* --- Mouse Pointer Proximity Glow Element --- */}
      <motion.div style={{
        position: 'fixed',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
        pointerEvents: 'none',
        left: cursorGlowX, top: cursorGlowY,
        zIndex: 1,
      }} />

      {/* --- Content Container (z-index protects from background) --- */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 style={{ fontSize: 'clamp(35px, 5vw, 50px)', fontWeight: 'bold', margin: '0 0 15px 0' }}>
            My Live <span style={{ color: 'var(--accent)' }}>Projects</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            This data is being automatically synced in real-time from my GitHub account.
            
          </p>
        </motion.div>

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--accent)', fontSize: '18px', fontWeight: '500' }}>
            GitHub se projects load ho rahe hain...
          </p>
        )}

        {/* Projects Grid (perspective added for 3D effect) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '30px', 
          perspective: '2000px' // CRUCIAL for 3D card tilt
        }}>
          {!loading && repos.slice(0, 6).map((repo, index) => (
            <motion.div 
              key={repo.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              
              // --- Premium 3D Tilt & Glow Hover ---
              whileHover={{ 
                scale: 1.03, 
                y: -10,
                rotateX: 8,  // Tilt forward
                rotateY: -8, // Tilt left
                boxShadow: "0px 20px 50px var(--accent-glow)",
                borderColor: "var(--accent)" 
              }}
              
              style={{ 
                background: 'var(--bg-card)', 
                padding: '30px', 
                borderRadius: '16px', 
                border: '1px solid var(--border-color)', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                transformStyle: 'preserve-3d', // Ensures 3D works
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              {/* Project Title */}
              <h3 style={{ color: 'var(--text-main)', margin: '0 0 15px 0', fontSize: '20px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {repo.name.replace(/-/g, ' ')}
              </h3>
              
              {/* Project Description */}
              <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: '1.6', flexGrow: 1, marginBottom: '20px' }}>
                {repo.description ? repo.description : "No description provided for this repository."}
              </p>
              
              {/* Language Tag */}
              {repo.language && (
                <p style={{ fontSize: '14px', color: '#ffb84d', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {repo.language}
                </p>
              )}

              {/* Action Button */}
              <a href={repo.html_url} target="_blank" rel="noreferrer" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px',
                background: 'transparent', 
                color: 'var(--accent)', 
                padding: '12px 20px', 
                borderRadius: '8px', 
                fontSize: '14px', 
                border: '1px solid var(--border-color)',
                fontWeight: 'bold',
                marginTop: 'auto',
                transition: 'all 0.3s ease',
                textDecoration: 'none'
              }}>
                View Source Code ↗
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Floating Action Button (Optional, standardizing layout) --- */}
      <motion.div style={{
        position: 'fixed', bottom: '40px', right: '40px',
        width: '50px', height: '50px',
        borderRadius: '50%',
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', color: 'var(--bg-main)',
        boxShadow: `0 0 20px var(--accent-glow)`,
        cursor: 'pointer',
        zIndex: 50,
      }}
      whileHover={{ scale: 1.1, rotate: 10 }}
      >
        🚀 
      </motion.div>

    </div>
  );
};

export default Projects;