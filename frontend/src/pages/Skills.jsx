import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

 
const localSkillsData = [
  {
    name: 'C++',
    icon: '⚡',
    description: 'Core language for competitive programming. Deeply covers STL, pointers, OOP, and memory management.',
    proficiency: 80
  },
  {
    name: 'Python',
    icon: '🐍',
    description: 'Ideal for scripting, automation, and quick prototyping. Frequently used for complex algorithms and data handling.',
    proficiency: 75
  },
  {
    name: 'Java',
    icon: '☕',
    description: 'Strong foundation in Object-Oriented Programming. Extensively uses the Collections framework for efficient problem-solving.',
    proficiency: 65
  },
  {
    name: 'Data Structures',
    icon: '🌲',
    description: 'The building blocks of efficient code. Solid grasp on Arrays, Linked Lists, Trees, Graphs, Stacks, and Hash Tables.',
    proficiency: 85
  },
  {
    name: 'Algorithms',
    icon: '🧠',
    description: 'Techniques for optimizing complex solutions. Experienced in Sorting, Searching, DP, Greedy, and Divide & Conquer.',
    proficiency: 70
  },
  {
    name: 'Competitive Programming',
    icon: '🏆',
    description: 'Consistent practice on platforms like LeetCode and Codeforces. Highly sharpens logic and algorithmic thinking.',
    proficiency: 60
  },
  {
    name: 'Tools & Git',
    icon: '🔧',
    description: 'Essential environment setup for modern development. Proficient with VS Code, Git, GitHub workflows, and Linux basics.',
    proficiency: 90
  },
  {
    name: 'HTML & CSS',
    icon: '🌐',
    description: 'Crafting responsive and beautiful web pages. Utilizes modern Flexbox/Grid layouts and custom CSS animations.',
    proficiency: 85
  }
];

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

   
  const themeColors = {
    bg: 'var(--bg-main)',
    cardBg: 'var(--bg-card)',
    textMain: 'var(--text-main)',
    textDim: 'var(--text-dim)',
    accent: 'var(--accent)',
    border: 'var(--border-color)',
    buttonBorder: 'var(--button-border)',
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
    
    const fetchData = async () => {
      try {
         
        const resumeRes = await fetch("https://portfolio-px1j.onrender.com/api/resume-data").catch(() => null);
        const resumeData = resumeRes ? await resumeRes.json() : { skills: [] };
        const serverSkills = resumeData.skills && resumeData.skills.length > 0 ? resumeData.skills : [];

        
        const linkedinRes = await fetch("https://portfolio-px1j.onrender.com/api/linkedin-skills").catch(() => null);
        const linkedinData = linkedinRes ? await linkedinRes.json() : [];
        const linkedinSkills = Array.isArray(linkedinData) ? linkedinData : [];

        
        const combinedSkills = [...localSkillsData, ...serverSkills, ...linkedinSkills];
        const uniqueSkillsMap = new Map();
        
         
        combinedSkills.forEach((skill) => {
          if (skill && skill.name) {
            const key = skill.name.toLowerCase();
            const existingSkill = uniqueSkillsMap.get(key) || {};
            
            uniqueSkillsMap.set(key, {
              ...existingSkill,
              ...skill,
              
              icon: skill.icon || existingSkill.icon,
              description: skill.description || existingSkill.description,
              proficiency: skill.proficiency || existingSkill.proficiency || 50,
            });
          }
        });

        setSkills(Array.from(uniqueSkillsMap.values()));
        setLoading(false);
      } catch (err) {
        console.error("Data fetch error:", err);
        setSkills(localSkillsData); 
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '0', minHeight: '100vh', background: themeColors.bg, color: themeColors.textMain, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
       
      <div style={{
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        background: `radial-gradient(circle at center, rgba(0, 229, 255, 0.05) 0%, ${themeColors.bg} 70%)`,
        zIndex: 0,
      }} />

       
      <motion.div style={{
        position: 'fixed',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(0, 229, 255, 0.12) 0%, rgba(0, 229, 255, 0) 70%)`,
        pointerEvents: 'none',
        left: cursorGlowX, top: cursorGlowY,
        zIndex: 1,
      }} />

    
      <section style={{ padding: '120px 8vw 80px 8vw', zIndex: 5, position: 'relative' }}>
        
         
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          style={{ textAlign: 'center', marginBottom: '80px' }}
        >
          <h1 style={{ fontSize: 'clamp(35px, 5vw, 50px)', color: themeColors.textMain, margin: '0 0 15px 0', fontWeight: 'bold' }}>
            My Technical <span style={{ color: themeColors.accent }}>Arsenal</span>
          </h1>
          <p style={{ color: themeColors.textDim, fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Technologies and tools I use to build high-performance, interactive, and scalable software solutions.
          </p>
        </motion.div>

         
        {loading ? (
          <p style={{ textAlign: 'center', color: themeColors.textDim }}>Loading skills...</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '30px',
            justifyContent: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            perspective: '2000px',  
          }}>
            {skills.map((skill, index) => (
              <motion.div
                key={skill._id || `skill-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                
                 
                whileHover={{ 
                  y: -10, 
                  scale: 1.03, 
                  rotateX: 10,   
                  rotateY: -10,  
                  borderColor: themeColors.accent,
                  boxShadow: `0px 20px 60px rgba(0, 229, 255, 0.4)`
                }}
                
                style={{
                  background: themeColors.cardBg,
                  border: `1px solid ${themeColors.border}`,
                  borderRadius: '16px',
                  padding: '40px 30px', 
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left', 
                  cursor: 'pointer',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                  boxSizing: 'border-box',
                  transformStyle: 'preserve-3d', 
                  minHeight: '280px' 
                }}
              >
                
                <div style={{ fontSize: '32px', marginBottom: '20px' }}>
                  {skill.icon || '💻'} 
                </div>
                
                 
                <h3 style={{ 
                  color: themeColors.textMain, 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  margin: '0 0 15px 0', 
                  letterSpacing: '1px'
                }}>
                  {skill.name}
                </h3>

                 
                <p style={{ 
                  color: themeColors.textDim, 
                  fontSize: '15px', 
                  lineHeight: '1.6', 
                  margin: '0 0 25px 0',
                  flexGrow: 1 
                }}>
                  {skill.description || skill.category || 'Continuously expanding my knowledge and practical experience in this technology.'}
                </p>

                
                <div style={{ 
                  width: '100%', 
                  height: '4px', 
                  background: themeColors.buttonBorder, 
                  borderRadius: '4px',
                  marginTop: 'auto', 
                  overflow: 'hidden'
                }}>
                   
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.proficiency || 50}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #00ff9d 0%, #00b8ff 100%)', 
                      borderRadius: '4px'
                    }}
                  />
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </section>

       
      <motion.div style={{
        position: 'fixed', bottom: '40px', right: '40px',
        width: '50px', height: '50px',
        borderRadius: '50%',
        background: themeColors.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', color: themeColors.bg,
        boxShadow: `0 0 20px rgba(0, 229, 255, 0.6)`,
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

export default Skills;