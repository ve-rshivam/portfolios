import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [topProjects, setTopProjects] = useState([]);
  
  // 🔥 Pinned reviews store karne ke liye
  const [topReviews, setTopReviews] = useState([]); 
  
  // 🔥 Live Content from Database (Hero & About)
  const [homeContent, setHomeContent] = useState({
    heroTitle: "Hi, I am Shivam Singh",
    heroSubtitle: "Full-Stack Web Developer"
  });
  const [aboutContent, setAboutContent] = useState({
    description: "I am a passionate Full-Stack Developer specialized in the MERN stack. I love bringing ideas to life through code and creating seamless, interactive user experiences. When I am not debugging code, I enjoy exploring new 3D web technologies and solving complex algorithms."
  });
  
  // 🔥 Live Skills from Database
  const [previewSkills, setPreviewSkills] = useState([
    "React.js", "Node.js", "MongoDB", "Express", "Three.js", "Tailwind"
  ]);

  // 🔥 NEW: MOBILE SCROLL & CINEMATIC COLOR STATES 🔥


  // Fetch CMS Content
  useEffect(() => {
    fetch("https://portfolio-px1j.onrender.com/api/content")
      .then(res => res.json())
      .then(data => {
        if(data) {
          if(data.homeData) setHomeContent(data.homeData);
          if(data.aboutData) setAboutContent(data.aboutData); // 🔥 About text ab live update hoga
        }
      })
      .catch(err => console.log("Content fetch error", err));
  }, []);
  
  const githubUser = "ve-rshivam"; 

  const themeColors = {
    bg: 'var(--bg-main)',
    cardBg: 'var(--bg-card)',
    textMain: 'var(--text-main)',
    textDim: 'var(--text-dim)',
    accent: 'var(--accent)',
    border: 'var(--border-color)',
    buttonBorder: 'var(--border-color)', 
  };

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

    // 🔥 ADMIN CONTROLLED PROJECTS (Instead of raw GitHub fetch) 🔥
    fetch(`https://portfolio-px1j.onrender.com/api/pinned-projects`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sirf top 3 pinned projects Home page par dikhayenge
          setTopProjects(data.slice(0, 3)); 
        }
      })
      .catch(err => console.error("Error fetching pinned projects:", err));

    // 2. Fetch Top Reviews (🔥 Pinned Reviews from Database)
    const fetchReviews = async () => {
      try {
        const res = await fetch("https://portfolio-px1j.onrender.com/api/reviews");
        if (res.ok) {
          const data = await res.json();
          // Sirf wo reviews nikalo jinko Admin ne Pin kiya hai
          const pinnedReviews = data.filter(r => r.isPinned);
          // Agar pinned reviews hain, toh 3 dikhao, warna latest 2 dikhao
          setTopReviews(pinnedReviews.length > 0 ? pinnedReviews.slice(0, 3) : data.slice(0, 2));
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();

    // 3. Fetch Live Skills from DB
    const fetchSkills = async () => {
      try {
        const res = await fetch("https://portfolio-px1j.onrender.com/api/resume-data");
        if (res.ok) {
          const data = await res.json();
          if (data.skills && data.skills.length > 0) {
            // DB ki top 6 skills nikal kar array me daal di
            setPreviewSkills(data.skills.slice(0, 6).map(s => s.name));
          }
        }
      } catch (error) {
        console.log("Error fetching skills:", error);
      }
    };
    fetchSkills();

    return () => {};
  }, []);

  const handleResumeClick = () => {
    navigate('/resume'); 
  };

  return (
    <div style={{ width: '100%', overflowX: 'hidden', background: themeColors.bg, color: themeColors.textMain, position: 'relative', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Page Body Glow */}
      <div style={{
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        background: `radial-gradient(circle at center, var(--accent-glow) 0%, ${themeColors.bg} 70%)`,
        zIndex: 0,
      }} />

      {/* Mouse Pointer Proximity Glow Element */}
      <motion.div style={{
        position: 'fixed', width: '400px', height: '400px', borderRadius: '50%',
        background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
        pointerEvents: 'none', left: cursorGlowX, top: cursorGlowY, zIndex: 1,
      }} />

      <div style={{ position: 'relative', zIndex: 5 }}>
        
        {/* ================= HERO SECTION ================= */}
        <section style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap-reverse', padding: '100px 8vw 50px 8vw', gap: '20px' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ flex: 1, minWidth: '320px', zIndex: 10 }}>
            <p style={{ color: themeColors.accent, fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', margin: '0 0 10px 0', fontFamily: 'monospace' }}>
              WELCOME TO MY WORLD
            </p>
            <h1 style={{ fontSize: 'clamp(40px, 5vw, 65px)', margin: '0 0 10px 0', lineHeight: '1.1', color: themeColors.textMain, fontWeight: 'bold' }}>
              {homeContent.heroTitle}
            </h1>
            <h2 style={{ color: themeColors.textDim, fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: '500', marginBottom: '20px', color: themeColors.accent }}>
              {homeContent.heroSubtitle}
            </h2>
            <p style={{ color: themeColors.textDim, fontSize: '16px', lineHeight: '1.6', maxWidth: '500px', marginBottom: '40px' }}>
              I build high-performance, interactive, and visually stunning web applications using the MERN stack and 3D web technologies.
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: `0px 10px 25px var(--accent-glow)` }} 
                whileTap={{ scale: 0.95 }} onClick={() => navigate('/contact')}
                style={{ padding: '15px 35px', background: themeColors.accent, color: 'var(--bg-main)', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' }}
              >
                Hire Me 🚀
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'var(--accent-glow)', borderColor: themeColors.accent }} 
                whileTap={{ scale: 0.95 }} onClick={handleResumeClick}
                style={{ padding: '15px 35px', background: 'transparent', color: themeColors.textMain, border: `2px solid ${themeColors.border}`, borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' }}
              >
                View Resume 📄
              </motion.button>
            </div>
          </motion.div>

         <motion.div 
            style={{ 
              flex: 1, 
              minWidth: '320px', 
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05, rotateZ: 2 }}
              style={{
                width: 'clamp(280px, 25vw, 380px)',
                height: 'clamp(280px, 25vw, 380px)',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `4px solid ${themeColors.accent}`,
                boxShadow: `0 0 40px var(--accent-glow), 0 20px 60px rgba(0,0,0,0.4)`,
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <img 
                src="/profile.png" 
                alt="Shivam Kumar" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  display: 'block',
                }} 
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ================= ABOUT ME & PHOTO SECTION ================= */}
        <section style={{ padding: '100px 8vw', background: 'rgba(0, 0, 0, 0.2)', borderTop: `1px solid ${themeColors.border}` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateZ: 2, boxShadow: `0px 20px 50px var(--accent-glow)` }}
              style={{ width: '280px', height: '280px', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${themeColors.accent}`, boxShadow: `0px 0px 30px var(--accent-glow)`, transition: 'all 0.3s ease' }}
            >
              <img src="/profile.png" alt="Shivam Kumar" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#333' }} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ flex: 1, minWidth: '300px', maxWidth: '600px' }}>
              <h2 style={{ fontSize: '35px', color: themeColors.textMain, marginBottom: '15px', fontWeight: 'bold' }}>
                About <span style={{ color: themeColors.accent }}>Me</span>
              </h2>
              <p style={{ color: themeColors.textDim, fontSize: '16px', lineHeight: '1.7', marginBottom: '25px' }}>
                {aboutContent.description} {/* 🔥 CMS Se connected */}
              </p>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'var(--accent-glow)' }} onClick={() => navigate('/about')} 
                style={{ padding: '12px 25px', background: 'transparent', color: themeColors.accent, border: `1px solid ${themeColors.accent}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}
              >
                Read More
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ================= SKILLS PREVIEW SECTION ================= */}
        <section style={{ padding: '100px 8vw', textAlign: 'center' }}>
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ fontSize: '35px', color: themeColors.textMain, marginBottom: '50px', fontWeight: 'bold' }}>
            Top <span style={{ color: themeColors.accent }}>Skills</span>
          </motion.h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', maxWidth: '900px', margin: '0 auto', perspective: '1000px' }}>
            {previewSkills.map((skill, index) => (
              <motion.div 
                key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.1, borderColor: themeColors.accent, boxShadow: `0px 10px 20px var(--accent-glow)` }}
                style={{ background: themeColors.cardBg, color: themeColors.textMain, padding: '15px 30px', borderRadius: '12px', border: `1px solid ${themeColors.border}`, fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'border-color 0.3s ease' }}
              >
                {skill}
              </motion.div>
            ))}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05, color: themeColors.accent }} onClick={() => navigate('/skills')} 
            style={{ marginTop: '50px', padding: '10px 20px', background: 'transparent', color: themeColors.textDim, border: 'none', cursor: 'pointer', fontSize: '16px', textDecoration: 'underline', transition: '0.3s' }}
          >
            View All Skills ↗
          </motion.button>
        </section>

        {/* ================= FEATURED PROJECTS SECTION ================= */}
        <section style={{ padding: '100px 8vw', background: 'rgba(0, 0, 0, 0.2)', borderTop: `1px solid ${themeColors.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px', flexWrap: 'wrap', gap: '20px' }}>
            <h2 style={{ fontSize: '35px', color: themeColors.textMain, margin: 0, fontWeight: 'bold' }}>
              Featured <span style={{ color: themeColors.accent }}>Projects</span>
            </h2>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: `0px 10px 20px var(--accent-glow)` }} onClick={() => navigate('/projects')} 
              style={{ padding: '12px 25px', background: themeColors.accent, color: 'var(--bg-main)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
            >
              View All Projects
            </motion.button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', perspective: '2000px' }}>
            {topProjects.length === 0 ? (
              <p style={{ color: themeColors.textDim, textAlign: 'center', width: '100%' }}>No pinned projects yet. Pin them from Admin Panel.</p>
            ) : (
              topProjects.map((repo, i) => (
                <motion.div 
                  key={repo._id || repo.repoId || i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ y: -10, scale: 1.03, rotateX: 10, rotateY: -10, borderColor: themeColors.accent, boxShadow: `0px 20px 60px var(--accent-glow)` }}
                  style={{ background: themeColors.cardBg, padding: '30px', borderRadius: '16px', border: `1px solid ${themeColors.border}`, textAlign: 'left', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'border-color 0.3s ease, box-shadow 0.3s ease', transformStyle: 'preserve-3d' }}
                >
                  <h3 style={{ color: themeColors.textMain, fontSize: '20px', textTransform: 'capitalize', marginTop: 0, marginBottom: '15px', fontWeight: 'bold' }}>
                    {repo.name.replace(/-/g, ' ')}
                  </h3>
                  <p style={{ color: themeColors.textDim, fontSize: '15px', lineHeight: '1.6', flexGrow: 1, marginBottom: '25px' }}>
                    {repo.description || "No description provided for this repository."}
                  </p>
                  
                  <a href={repo.html_url} target="_blank" rel="noreferrer" style={{ 
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px 15px', border: `1px solid ${themeColors.buttonBorder}`, borderRadius: '8px',
                    color: themeColors.accent, fontWeight: 'bold', fontSize: '14px', textDecoration: 'none', marginTop: 'auto'
                  }}>
                    Source Code ↗
                  </a>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* ================= 🔥 UNCOMMENTED & LIVE: CLIENT REVIEWS 🔥 ================= */}
        {topReviews.length > 0 && (
          <section style={{ padding: '100px 8vw', textAlign: 'center', borderTop: `1px solid ${themeColors.border}` }}>
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ fontSize: '35px', color: themeColors.textMain, marginBottom: '20px', fontWeight: 'bold' }}>
              Client <span style={{ color: themeColors.accent }}>Testimonials</span>
            </motion.h2>
            <p style={{ color: themeColors.textDim, fontSize: '16px', marginBottom: '50px' }}>What people are saying about my work.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', perspective: '2000px', marginBottom: '40px' }}>
              {topReviews.map((review, i) => (
                <motion.div 
                  key={review._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02, rotateX: 5, rotateY: -5, borderColor: themeColors.accent, boxShadow: `0px 15px 40px var(--accent-glow)` }}
                  style={{ background: themeColors.cardBg, padding: '30px', borderRadius: '16px', border: `1px solid ${themeColors.border}`, textAlign: 'left', transformStyle: 'preserve-3d', transition: 'all 0.3s' }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '10px' }}>
                    {"⭐".repeat(review.rating)}
                  </div>
                  <p style={{ color: themeColors.textMain, fontSize: '15px', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '20px' }}>
                    "{review.text}"
                  </p>
                  <div style={{ borderTop: `1px solid ${themeColors.border}`, paddingTop: '15px' }}>
                    <h4 style={{ margin: 0, color: themeColors.accent, fontSize: '16px' }}>{review.name}</h4>
                    <span style={{ fontSize: '13px', color: themeColors.textDim }}>{review.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: `0px 10px 20px var(--accent-glow)` }} onClick={() => navigate('/reviews')} 
              style={{ padding: '12px 30px', background: 'transparent', color: themeColors.accent, border: `2px solid ${themeColors.accent}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: '0.3s' }}
            >
              Read More or Leave a Review ✍️
            </motion.button>
          </section>
        )}

      </div>

      {/* --- Floating Button (Standardized) --- */}
      <motion.div style={{
        position: 'fixed', bottom: '40px', right: '40px', width: '50px', height: '50px', borderRadius: '50%',
        background: themeColors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', color: themeColors.bg, boxShadow: `0 0 20px var(--accent-glow)`, cursor: 'pointer', zIndex: 50,
      }}
      whileHover={{ scale: 1.1, rotate: 10 }}
      >
        🚀 
      </motion.div>

    </div>
  );
};

export default Home;