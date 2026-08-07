import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';


import Education from '../components/Education';

const About = () => {
  const navigate = useNavigate();


  const themeColors = {
    bg: 'var(--bg-main)',
    cardBg: 'var(--bg-card)',
    textMain: 'var(--text-main)',
    textDim: 'var(--text-dim)',
    accent: 'var(--accent)',
    border: 'var(--border-color)',
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

  return (
    <section 
      id="about" 
      style={{ 
        position: 'relative',
        display: 'flex', 
        minHeight: '100vh', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        padding: '120px 8vw 80px 8vw', 
        background: themeColors.bg,
        color: themeColors.textMain,
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif'
      }}
    >

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


      <div style={{ position: 'relative', zIndex: 5, width: '100%', display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
        

        <div style={{ flex: 1.5, minWidth: '320px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            
            <div style={{ 
              fontFamily: 'monospace', fontSize: '15px', color: themeColors.accent, 
              letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '15px', fontWeight: 'bold'
            }}>
              About Me
            </div>
            
          
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 'bold', margin: '0 0 40px 0', color: themeColors.textMain, lineHeight: '1.1' }}>
              Passionate About<br/>
              <span style={{ color: themeColors.accent }}>Problem Solving</span>
            </h2>
            
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
            
              <motion.div 
                whileHover={{ scale: 1.05, rotateZ: -3, boxShadow: `0px 20px 50px rgba(0, 229, 255, 0.4)`, borderColor: themeColors.accent }}
                style={{ 
                  width: '200px', height: '220px', 
                  borderRadius: '20px', 
                  border: `2px solid ${themeColors.border}`, 
                  overflow: 'hidden', 
                  flexShrink: 0,
                  background: themeColors.cardBg,
                  transition: 'border-color 0.3s ease'
                }}
              >
                <img src="/profile.png" alt="Shivam Kumar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </motion.div>

<div style={{ flex: 1, minWidth: '250px' }}>
  <p style={{ color: themeColors.textDim, lineHeight: '1.8', fontSize: '16px', margin: '0 0 20px 0' }}>
    <strong style={{ color: themeColors.textMain, display: 'block', marginBottom: '4px' }}>The Intersection of Creativity and Code</strong>
    Hello! I am <strong style={{ color: themeColors.textMain }}>Shivam Kumar</strong>, an 18-year-old B.Tech Computer Science and Engineering student at Gurukula Kangri Vishwavidyalaya. I approach technology not just as a developer, but as a creative thinker. For me, computer science is a canvas where complex algorithms and innovative ideas come together to solve real-world problems.
  </p>

  <p style={{ color: themeColors.textDim, lineHeight: '1.8', fontSize: '16px', margin: '0 0 20px 0' }}>
    <strong style={{ color: themeColors.textMain, display: 'block', marginBottom: '4px' }}>Driven by Artificial Intelligence</strong>
    My primary technical focus is on <strong style={{ color: themeColors.accent }}>Artificial Intelligence and Machine Learning</strong>. I am currently diving deep into the AI/ML ecosystem, building the foundational skills needed to train intelligent models and develop smart, scalable applications. While my foundational learning spans various aspects of development, my true ambition lies in shaping the future of AI and discovering how machines can learn, adapt, and drive meaningful innovation.
  </p>

  <p style={{ color: themeColors.textDim, lineHeight: '1.8', fontSize: '16px', margin: '0 0 20px 0' }}>
    <strong style={{ color: themeColors.textMain, display: 'block', marginBottom: '4px' }}>Community, Leadership & Open Source</strong>
    Beyond writing code, I am deeply committed to growing alongside the global tech ecosystem. I actively bridge the gap between industry-leading platforms and student developers through my roles as a <strong style={{ color: themeColors.textMain }}>Google Student Ambassador</strong> and a <strong style={{ color: themeColors.textMain }}>Microsoft Learn Student Ambassador</strong>. Furthermore, my active memberships in the <strong style={{ color: themeColors.textMain }}>Google Developer Club</strong> and the <strong style={{ color: themeColors.textMain }}>GitHub Developer Program</strong> keep me grounded in collaborative, community-driven development. Whether I am contributing to open-source projects, organizing community initiatives, or sharing knowledge with peers, I thrive in environments that foster technological growth and teamwork.
  </p>

  <p style={{ color: themeColors.textDim, lineHeight: '1.8', fontSize: '16px', margin: '0' }}>
    <strong style={{ color: themeColors.textMain, display: 'block', marginBottom: '4px' }}>Looking Ahead</strong>
    I am constantly experimenting, exploring new AI frameworks, and looking for my next big challenge. Whether I am architecting a new machine learning model, representing major tech communities, or brainstorming my next project, I am driven by a singular goal: to build impactful technology that makes a difference.
  </p>


                
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: `0px 10px 20px rgba(0, 229, 255, 0.3)`, backgroundColor: 'rgba(0, 229, 255, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/contact')}
                  style={{
                    marginTop: '30px',
                    padding: '12px 30px',
                    background: 'transparent',
                    color: themeColors.accent,
                    border: `2px solid ${themeColors.accent}`,
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  Get In Touch
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        
        <div style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '40px', perspective: '2000px' }}>
          
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            
            
            whileHover={{ 
              y: -10, 
              scale: 1.02, 
              rotateX: 5,  
              rotateY: -5, 
              borderColor: themeColors.accent,
              boxShadow: `0px 20px 60px rgba(0, 229, 255, 0.4)`
            }}
            
            style={{ 
              background: themeColors.cardBg, 
              border: `1px solid ${themeColors.border}`, 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              transformStyle: 'preserve-3d',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
          >
           
            <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${themeColors.border}` }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }}></div>
              <span style={{ fontFamily: 'monospace', fontSize: '13px', color: themeColors.textDim, marginLeft: '10px' }}>guest@shivam:~</span>
            </div>
            
            
            <div style={{ padding: '25px', fontFamily: 'monospace', fontSize: '15px', lineHeight: '2' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: themeColors.accent }}>➜</span>
                <span style={{ color: 'white' }}>Who am I</span>
              </div>
              <div style={{ color: '#00f5a0', paddingLeft: '20px', marginBottom: '15px' }}>
                Shivam Kumar | CS Student, MERN Dev & AIML
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: themeColors.accent }}>➜</span>
                <span style={{ color: 'white' }}>cat current_focus.txt</span>
              </div>
              <div style={{ color: '#00b8ff', paddingLeft: '20px', marginBottom: '15px' }}>
                Mastering JAVA & Python for DSA
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: themeColors.accent }}>➜</span>
                <motion.span 
                  animate={{ opacity: [1, 0, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{ display: 'inline-block', width: '10px', height: '18px', background: themeColors.accent }}
                />
              </div>
            </div>
          </motion.div>

          
          <div style={{ height: '350px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${themeColors.border}`, background: 'rgba(0,0,0,0.2)' }}>
            <Canvas>
              <ambientLight intensity={0.5} />
              <directionalLight position={[3, 2, 1]} intensity={1.5} />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={3} />
              
              <Icosahedron args={[1.5, 4]} scale={1.4}>
                <MeshDistortMaterial 
                  color={themeColors.accent} 
                  attach="material" 
                  distort={0.4} 
                  speed={2} 
                  roughness={0.2} 
                  metalness={0.8}
                  wireframe={true} 
                />
              </Icosahedron>
            </Canvas>
          </div>
        </div>
      </div>

      
      <div style={{ width: '100%', marginTop: '100px', zIndex: 10 }}>
        <Education />
      </div>

    </section>
  );
};

export default About;