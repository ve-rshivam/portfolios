import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// 🔥 REUSABLE COMPONENT FOR THE 2-COLUMN LAYOUT 🔥
const ResumeSection = ({ title, children, isLast }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: '180px 1fr', 
    paddingBottom: '20px', 
    marginBottom: '20px',
    borderBottom: isLast ? 'none' : '1px solid #b0c4de' // Thin blue line between sections
  }}>
    <h3 style={{ 
      color: '#24537b', // Navy Blue from your reference image
      textTransform: 'uppercase', 
      fontSize: '13px', 
      letterSpacing: '1px', 
      margin: 0, 
      fontWeight: 'bold' 
    }}>
      {title}
    </h3>
    <div style={{ paddingLeft: '10px' }}>
      {children}
    </div>
  </div>
);

const Resume = () => {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const githubUser = "ve-rshivam";

  // --- Mouse Proximity Glow Logic (Web only) ---
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
    // 1. Fetch live projects from GitHub
    fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data.slice(0, 4));
      })
      .catch(err => console.error("GitHub Fetch Error:", err));

    // 2. Fetch Skills & Experience from your backend
    fetch("http://localhost:5000/api/resume-data")
      .then(res => res.json())
      .then(data => {
        setSkills(data.skills || []);
        setExperiences(data.experiences || []);
        setEducation(data.education || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Backend Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div style={{ 
      position: 'relative',
      padding: '120px 5vw 80px 5vw', 
      display: 'flex', 
      justifyContent: 'center', 
      background: 'var(--bg-main)', 
      minHeight: '100vh',
      overflow: 'hidden',
      fontFamily: 'Arial, Helvetica, sans-serif', // Standard Professional Font
      transition: 'background 0.3s ease'
    }}>
      
      {/* 🔥 PROFESSIONAL PRINT CSS STYLES - FIXED 🔥 */}
      <style>{`
        @media print {
          /* 1. Hide browser default header and footer */
          @page {
            size: A4 portrait;
            margin: 0; /* Remove browser default margins */
          }
          
          body, html {
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 2. Hide everything else */
          body * {
            visibility: hidden;
          }
          
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          
          #printable-resume {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 40px !important; /* Resume ka apna padding */
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }

          .no-print, .no-print * {
            display: none !important;
          }
        }
      `}</style>

      {/* --- Page Body Glow (Web Only) --- */}
      <div className="no-print" style={{
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        background: `radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <motion.div className="no-print" style={{
        position: 'fixed',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
        pointerEvents: 'none',
        left: cursorGlowX, top: cursorGlowY,
        zIndex: 1,
      }} />

      {/* ========================================================= */}
      {/* 📄 RESUME A4 CONTAINER (Looks like paper on web & print) */}
      {/* ========================================================= */}
      <motion.div 
        id="printable-resume" 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          position: 'relative',
          zIndex: 5,
          width: '100%', 
          maxWidth: '850px', // A4 aspect ratio approximation for web
          background: '#ffffff', // Pure white like real paper
          color: '#333333', // Dark grey text for readability
          padding: '40px 50px', 
          boxShadow: '0px 10px 40px rgba(0,0,0,0.3)', // Shadow for web presentation
          borderRadius: '4px' // Very slight curve, mostly square like paper
        }}
      >
        
        {/* Print Action Button (Web Only) */}
        <div className="no-print" style={{ textAlign: 'right', marginBottom: '20px' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            style={{ 
              padding: '10px 20px', 
              background: '#24537b', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🖨️ Download PDF Format
          </motion.button>
        </div>

        {/* 1. HEADER SECTION (Matches your reference image) */}
        <div style={{ borderBottom: '2px solid #24537b', paddingBottom: '15px', marginBottom: '25px' }}>
          <h1 style={{ 
            color: '#24537b', 
            fontSize: '36px', 
            margin: '0 0 8px 0', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            fontWeight: '900'
          }}>
            Shivam Kumar
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>
            getus.shivam@gmail.com | +91 81028 69061 | 
            <a href={`https://github.com/${githubUser}`} style={{color: '#444', textDecoration: 'none', marginLeft: '5px'}}>github.com/{githubUser}</a> | 
            <a href="https://ve-rshivam.github.io/Portfolio" style={{color: '#444', textDecoration: 'none', marginLeft: '5px'}}>Portfolio</a>
          </p>
        </div>

        {/* 2. SUMMARY SECTION */}
        <ResumeSection title="Summary">
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#333' }}>
            Detail-oriented and highly motivated Full-Stack Developer specializing in the MERN stack. 
            Passionate about building scalable web applications, interactive 3D interfaces, and writing clean, efficient code. 
            Proven ability to design robust backend systems and seamless frontend user experiences.
          </p>
        </ResumeSection>
        {/* Education Section */}
        <div style={{ marginBottom: '35px' }}>
          <h2 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
            Education
          </h2>
          {education.length === 0 && !loading && <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Education will be added from Admin panel...</p>}
          {education.map((edu) => (
            <div key={edu._id} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', marginBottom: '5px' }}>
                <strong style={{ fontSize: '14px', color: '#111', textTransform: 'capitalize' }}>
                  {edu.degree}
                </strong>
                <span style={{ fontSize: '13px', color: '#333', fontWeight: 'bold' }}>{edu.duration}</span>
              </div>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '18px', color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                <li><span className="dynamic-text" style={{ fontWeight: 'bold' }}>{edu.institution}</span></li>
                {edu.score && <li>Score: {edu.score}</li>}
                {edu.description && <li>{edu.description}</li>}
              </ul>
            </div>
          ))}
        </div>

        {/* 3. WORK EXPERIENCE SECTION */}
        <ResumeSection title="Work Experience">
          {experiences.length === 0 && !loading && <p style={{ fontSize: '13px' }}>Loading experience...</p>}
          {experiences.map((exp) => (
            <div key={exp._id} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#111' }}>{exp.role}, {exp.company}</strong>
                <span style={{ fontSize: '13px', color: '#333', fontWeight: 'bold' }}>{exp.duration}</span>
              </div>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '18px', color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                <li>{exp.description}</li>
              </ul>
            </div>
          ))}
        </ResumeSection>

        {/* 4. RECENT PROJECTS SECTION */}
        <ResumeSection title="Key Projects">
          {projects.length === 0 ? <p style={{ fontSize: '13px' }}>Loading GitHub projects...</p> : projects.map((repo) => (
            <div key={repo.id} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#111', textTransform: 'capitalize' }}>
                  {repo.name.replace(/-/g, ' ')}
                </strong>
                <a href={repo.html_url} className="no-print" target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#24537b', textDecoration: 'none', fontWeight: 'bold' }}>
                  View Code ↗
                </a>
              </div>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '18px', color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
                <li>{repo.description || "Developed robust web application integrating modern frontend and backend technologies."}</li>
              </ul>
            </div>
          ))}
        </ResumeSection>

        {/* 5. KEY SKILLS SECTION (2 Column Bullet List) */}
        <ResumeSection title="Key Skills" isLast={true}>
          {skills.length === 0 && !loading && <span style={{ fontSize: '13px' }}>Loading skills...</span>}
          <ul style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px', 
            margin: 0, 
            paddingLeft: '18px', 
            color: '#333', 
            fontSize: '13px' 
          }}>
            {skills.map(skill => (
              <li key={skill._id}>{skill.name}</li>
            ))}
          </ul>
        </ResumeSection>

      </motion.div>
    </div>
  );
};

export default Resume;