import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    fetch("https://portfolio-px1j.onrender.com/api/resume-data")
      .then(res => res.json())
      .then(data => {
        if (data && data.experiences) {
          setExperiences(data.experiences.sort((a, b) => b._id.localeCompare(a._id)));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch experiences:", err);
        setLoading(false);
      });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '120px 5vw',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden',
      position: 'relative'
    },
    header: {
      textAlign: 'center',
      marginBottom: '80px',
      position: 'relative',
      zIndex: 5
    },
    timelineWrapper: {
      position: 'relative',
      maxWidth: '1000px',
      margin: '0 auto',
      zIndex: 5
    },
    centerLine: {
      position: 'absolute',
      left: isMobile ? '20px' : '50%',
      top: '0',
      bottom: '0',
      width: '2px', 
      background: 'linear-gradient(to bottom, transparent, var(--accent), var(--accent), transparent)',
      boxShadow: '0 0 10px var(--accent)', 
      transform: 'translateX(-50%)',
      borderRadius: '10px',
      zIndex: 1 // 🔥 Line stays behind the dots
    },
    timelineItem: (isLeft) => ({
      display: 'flex',
      justifyContent: isMobile ? 'flex-end' : (isLeft ? 'flex-start' : 'flex-end'),
      width: '100%',
      marginBottom: '80px', 
      position: 'relative'
    }),
    dot: {
      position: 'absolute',
      left: isMobile ? '20px' : '50%',
      top: '40px', 
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'var(--bg-main)', // 🔥 Background match kiya hai taki line circle ke andar na dikhe
      border: '4px solid var(--accent)',
      boxShadow: '0 0 15px var(--accent), inset 0 0 5px var(--accent)', 
      zIndex: 10
      // 🚨 यहाँ से हमने transform हटा दिया है ताकि Framer Motion उसे ख़राब ना करे
    },
    card: {
      width: isMobile ? 'calc(100% - 60px)' : 'calc(50% - 50px)',
      boxSizing: 'border-box',
      background: 'var(--bg-card)',
      padding: '30px',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      position: 'relative',
      zIndex: 5
    },
    arrow: (isLeft) => ({
      position: 'absolute',
      top: '28px', // 🔥 Arrow को परफेक्टली Dot की सीध (center) में किया गया है
      [isLeft ? 'right' : 'left']: '-12px',
      width: '24px',
      height: '24px',
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      borderRight: '1px solid var(--border-color)',
      transform: isLeft ? 'rotate(45deg)' : 'rotate(-135deg)',
      zIndex: -1
    })
  };

  return (
    <div style={styles.container}>
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={styles.header}>
        <h1 style={{ fontSize: 'clamp(35px, 5vw, 50px)', margin: '0 0 15px 0', fontWeight: 'bold' }}>
          My <span style={{ color: 'var(--accent)', textShadow: '0 0 20px var(--accent-glow)' }}>Professional Journey</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '18px' }}>Milestones that shaped my career</p>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--accent)', zIndex: 5, position: 'relative' }}>Loading timeline...</div>
      ) : experiences.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', zIndex: 5, position: 'relative' }}>No experience records found.</div>
      ) : (
        <div style={styles.timelineWrapper}>
          
          <div style={styles.centerLine} />
          
          {experiences.map((exp, index) => {
            const isLeft = !isMobile && index % 2 === 0;

            return (
              <div key={exp._id} style={styles.timelineItem(isLeft)}>
                
                {/* 🚀 FIXED GLOWING DOT: x और y को यहीं पास किया गया है! */}
                <motion.div 
                  initial={{ scale: 0, x: "-50%", y: "-50%" }} 
                  whileInView={{ scale: 1, x: "-50%", y: "-50%" }} 
                  viewport={{ once: true }} 
                  transition={{ type: 'spring', delay: index * 0.1 }}
                  style={styles.dot} 
                />

                <motion.div 
                  initial={{ opacity: 0, x: isMobile ? 50 : (isLeft ? -50 : 50) }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 100, delay: index * 0.2 }}
                  whileHover={{ scale: 1.02, borderColor: 'var(--accent)' }}
                  style={styles.card}
                >
                  {!isMobile && <div style={styles.arrow(isLeft)} />}

                  <span style={{ 
                    display: 'inline-block', padding: '6px 14px', background: 'rgba(0, 229, 255, 0.1)', 
                    color: 'var(--accent)', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', 
                    marginBottom: '15px', border: '1px solid var(--accent)', boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)'
                  }}>
                    {exp.duration || "2022 - Present"}
                  </span>
                  
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: 'bold' }}>{exp.role || "Software Engineer"}</h3>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: 'var(--accent)', fontStyle: 'italic' }}>@ {exp.company || "Tech Corp"}</h4>
                  <p style={{ margin: 0, color: 'var(--text-dim)', lineHeight: '1.7', fontSize: '15px' }}>
                  {exp.description || "Developed amazing features and improved system performance."}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Experience;