import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

// ============================================================
// 🎓 LATEX-STYLE ACADEMIC RESUME — Matching Reference Image
// ============================================================

const Resume = () => {
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [homeContent, setHomeContent] = useState({ heroTitle: 'Shivam Kumar' });
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
    // 1. Fetch Pinned Projects (same as Home page — NOT all GitHub repos)
    fetch(`https://portfolio-h37w.onrender.com/api/pinned-projects`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPinnedProjects(data);
      })
      .catch(err => console.error("Pinned Projects Fetch Error:", err));

    // 2. Fetch Skills, Experience, Education from backend
    fetch("https://portfolio-h37w.onrender.com/api/resume-data")
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

    // 3. Fetch CMS content for name
    fetch("https://portfolio-h37w.onrender.com/api/content")
      .then(res => res.json())
      .then(data => {
        if (data?.homeData?.heroTitle) {
          // Extract name from "Hi, I am Shivam Singh" -> "Shivam Singh"
          const title = data.homeData.heroTitle;
          const nameMatch = title.match(/I\s*(?:am|'m)\s+(.+)/i);
          setHomeContent({ heroTitle: nameMatch ? nameMatch[1].trim() : title });
        }
      })
      .catch(err => console.log("Content fetch error", err));
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  // ============================================================
  // 🎨 GROUP SKILLS BY CATEGORY (for LaTeX-style "Technical Skills")
  // ============================================================
  const groupSkillsByCategory = (skillsList) => {
    const groups = {};
    skillsList.forEach(skill => {
      const cat = skill.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill.name);
    });
    return groups;
  };

  const skillGroups = groupSkillsByCategory(skills);

  // ============================================================
  // 📐 COMMON STYLES (LaTeX Academic Resume Style)
  // ============================================================
  const s = {
    // Section title with bottom border (like LaTeX \section)
    sectionTitle: {
      fontSize: '11.5pt',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      color: '#000',
      borderBottom: '1.5px solid #000',
      paddingBottom: '3px',
      marginBottom: '8px',
      marginTop: '14px',
      fontFamily: "'Times New Roman', 'Georgia', serif",
    },
    // Entry row: title left, date right
    entryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      gap: '5px',
    },
    entryTitle: {
      fontSize: '10.5pt',
      fontWeight: 'bold',
      color: '#000',
      fontFamily: "'Times New Roman', 'Georgia', serif",
    },
    entrySubtitle: {
      fontSize: '10pt',
      fontStyle: 'italic',
      color: '#333',
      fontFamily: "'Times New Roman', 'Georgia', serif",
    },
    entryDate: {
      fontSize: '10pt',
      color: '#333',
      fontStyle: 'italic',
      textAlign: 'right',
      fontFamily: "'Times New Roman', 'Georgia', serif",
      whiteSpace: 'nowrap',
    },
    entryLocation: {
      fontSize: '10pt',
      color: '#333',
      textAlign: 'right',
      fontFamily: "'Times New Roman', 'Georgia', serif",
    },
    bulletList: {
      margin: '3px 0 8px 0',
      paddingLeft: '18px',
      listStyleType: 'disc',
      fontSize: '10pt',
      lineHeight: '1.45',
      color: '#222',
      fontFamily: "'Times New Roman', 'Georgia', serif",
    },
    bulletItem: {
      marginBottom: '1px',
    },
    techTag: {
      fontSize: '10pt',
      fontStyle: 'italic',
      color: '#444',
      fontFamily: "'Times New Roman', 'Georgia', serif",
    },
    skillLine: {
      fontSize: '10pt',
      color: '#222',
      lineHeight: '1.55',
      marginBottom: '2px',
      fontFamily: "'Times New Roman', 'Georgia', serif",
    },
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
      fontFamily: "'Times New Roman', 'Georgia', serif",
      transition: 'background 0.3s ease'
    }}>

      {/* 🔥 PRODUCTION-GRADE PRINT CSS 🔥 */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          * {
            transition: none !important;
            animation: none !important;
            box-shadow: none !important;
            text-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
          }

          body > *:not(#root) {
            display: none !important;
          }

          #root,
          #root div:not(#printable-resume):not(#printable-resume *) {
            background: transparent !important;
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            overflow: visible !important;
            min-height: auto !important;
            height: auto !important;
            max-height: none !important;
            display: block !important;
            position: static !important;
            transform: none !important;
            opacity: 1 !important;
          }

          nav, footer, header,
          .no-print,
          [style*="position: fixed"],
          [style*="position:fixed"] {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          #printable-resume {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
            color: #000 !important;
            overflow: visible !important;
            transform: none !important;
            opacity: 1 !important;
            font-family: 'Times New Roman', 'Georgia', serif !important;
          }

          #printable-resume * {
            position: static !important;
            background: transparent !important;
            overflow: visible !important;
            transform: none !important;
            opacity: 1 !important;
            color: #000 !important;
          }

          #printable-resume h1 {
            color: #000 !important;
          }

          #printable-resume a {
            text-decoration: none !important;
            color: #000 !important;
          }

          /* Force proper section border visibility */
          #printable-resume .resume-section-title {
            border-bottom: 1.5px solid #000 !important;
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
      {/* 📄 RESUME A4 CONTAINER                                    */}
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
          maxWidth: '800px',
          background: '#ffffff',
          color: '#000000',
          padding: '35px 45px',
          boxShadow: '0px 10px 40px rgba(0,0,0,0.3)',
          borderRadius: '2px',
          fontFamily: "'Times New Roman', 'Georgia', serif",
          lineHeight: '1.3',
        }}
      >

        {/* Print Action Button (Web Only) */}
        <div className="no-print" style={{ textAlign: 'right', marginBottom: '15px' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            style={{
              padding: '10px 22px',
              background: '#1a1a2e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'Inter, Arial, sans-serif',
            }}
          >
            🖨️ Download PDF
          </motion.button>
        </div>

        {/* ============================== */}
        {/* 1. HEADER — Name + Contact     */}
        {/* ============================== */}
        <div style={{ textAlign: 'center', marginBottom: '5px' }}>
          <h1 style={{
            fontSize: '22pt',
            fontWeight: 'bold',
            margin: '0 0 6px 0',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#000',
            fontFamily: "'Times New Roman', 'Georgia', serif",
            fontVariant: 'small-caps',
          }}>
            {homeContent.heroTitle}
          </h1>
          <p style={{
            margin: 0,
            fontSize: '9.5pt',
            color: '#333',
            fontFamily: "'Times New Roman', 'Georgia', serif",
            lineHeight: '1.5',
          }}>
            getus.shivam@gmail.com{' | '}
            +91 81028 69061{' | '}
            <a href={`https://github.com/${githubUser}`} style={{ color: '#333', textDecoration: 'none' }}>
              github.com/{githubUser}
            </a>{' | '}
            <a href="https://linkedin.com/in/ve-rshivam" style={{ color: '#333', textDecoration: 'none' }}>
              LinkedIn
            </a>
          </p>
        </div>

        {/* ============================== */}
        {/* 2. EDUCATION                   */}
        {/* ============================== */}
        {education.length > 0 && (
          <div>
            <div className="resume-section-title" style={s.sectionTitle}>Education</div>
            {education.map((edu) => (
              <div key={edu._id} style={{ marginBottom: '6px' }}>
                <div style={s.entryRow}>
                  <span style={s.entryTitle}>{edu.institution}</span>
                  <span style={s.entryLocation}>{edu.location || ''}</span>
                </div>
                <div style={s.entryRow}>
                  <span style={s.entrySubtitle}>
                    {edu.degree}{edu.score ? ` (${edu.score})` : ''}
                  </span>
                  <span style={s.entryDate}>{edu.duration}</span>
                </div>
                {edu.description && (
                  <ul style={s.bulletList}>
                    <li style={s.bulletItem}>{edu.description}</li>
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ============================== */}
        {/* 3. EXPERIENCE                  */}
        {/* ============================== */}
        {experiences.length > 0 && (
          <div>
            <div className="resume-section-title" style={s.sectionTitle}>Experience</div>
            {experiences.map((exp) => {
              // Split description by newline or bullet character for multi-point display
              const descLines = exp.description
                ? exp.description.split(/\n|•|●/).map(l => l.trim()).filter(Boolean)
                : [];
              return (
                <div key={exp._id} style={{ marginBottom: '6px' }}>
                  <div style={s.entryRow}>
                    <span style={s.entryTitle}>{exp.role}{exp.company ? `, ${exp.company}` : ''}</span>
                    <span style={s.entryDate}>{exp.duration}</span>
                  </div>
                  {descLines.length > 0 && (
                    <ul style={s.bulletList}>
                      {descLines.map((line, idx) => (
                        <li key={idx} style={s.bulletItem}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ============================== */}
        {/* 4. PROJECTS (Pinned/Home only) */}
        {/* ============================== */}
        {pinnedProjects.length > 0 && (
          <div>
            <div className="resume-section-title" style={s.sectionTitle}>Projects</div>
            {pinnedProjects.map((repo) => {
              // Split description into bullet points
              const descLines = repo.description
                ? repo.description.split(/\n|•|●/).map(l => l.trim()).filter(Boolean)
                : ['Developed and deployed a modern web application.'];
              return (
                <div key={repo._id || repo.repoId} style={{ marginBottom: '6px' }}>
                  <div style={s.entryRow}>
                    <span>
                      <span style={s.entryTitle}>
                        {repo.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      {repo.techStack && (
                        <span style={s.techTag}>{' | '}{repo.techStack}</span>
                      )}
                    </span>
                    <span style={s.entryDate}>{repo.dateRange || ''}</span>
                  </div>
                  <ul style={s.bulletList}>
                    {descLines.map((line, idx) => (
                      <li key={idx} style={s.bulletItem}>{line}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================== */}
        {/* 5. TECHNICAL SKILLS            */}
        {/* ============================== */}
        {skills.length > 0 && (
          <div>
            <div className="resume-section-title" style={s.sectionTitle}>Technical Skills</div>
            <div style={{ marginTop: '4px' }}>
              {Object.keys(skillGroups).length > 1 ? (
                // If skills have categories, show grouped format
                Object.entries(skillGroups).map(([category, skillNames]) => (
                  <div key={category} style={s.skillLine}>
                    <strong>{category}</strong>: {skillNames.join(', ')}
                  </div>
                ))
              ) : (
                // Single-category fallback: just list all skills in a comma-separated line
                <div style={s.skillLine}>
                  <strong>Skills</strong>: {skills.map(sk => sk.name).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================== */}
        {/* LOADING STATE                  */}
        {/* ============================== */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888',
            fontSize: '14px',
            fontFamily: 'Inter, Arial, sans-serif',
          }}>
            Loading resume data...
          </div>
        )}

        {/* Empty state when everything loaded but nothing exists */}
        {!loading && education.length === 0 && experiences.length === 0 &&
          pinnedProjects.length === 0 && skills.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999',
              fontSize: '15px',
              fontFamily: 'Inter, Arial, sans-serif',
            }}>
              <p style={{ fontSize: '40px', margin: '0 0 15px 0' }}>📄</p>
              <p style={{ margin: 0 }}>No resume data found. Add sections from the Admin Panel.</p>
            </div>
          )}

      </motion.div>
    </div>
  );
};

export default Resume;