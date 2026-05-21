import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import RefundRules from './RefundRules'; 

const Refund = () => {
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
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      padding: '120px 8vw 80px 8vw', 
      background: 'var(--bg-main)', 
      color: 'var(--text-main)', 
      overflow: 'hidden', 
      fontFamily: 'Inter, sans-serif'
    }}>
      
      <div style={{
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        background: `radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)`,
        zIndex: 0, pointerEvents: 'none'
      }} />

      <motion.div style={{
        position: 'fixed', width: '400px', height: '400px', borderRadius: '50%',
        background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
        pointerEvents: 'none', left: cursorGlowX, top: cursorGlowY, zIndex: 1,
      }} />

      <div style={{ position: 'relative', zIndex: 5, maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <motion.h1 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(35px, 5vw, 50px)', fontWeight: 'bold', margin: 0 }}
          >
            Refund <span style={{ color: 'var(--accent)' }}>Policy</span>
          </motion.h1>

          <motion.a 
            href="/"
            whileHover={{ scale: 1.05, borderColor: 'var(--accent)', color: 'var(--accent)' }}
            style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-main)', textDecoration: 'none', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '6px', transition: '0.3s' }}
          >
            ← Back to Home
          </motion.a>
        </div>

        <motion.section 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          whileHover={{ y: -5, scale: 1.02, rotateX: 2, rotateY: -2, boxShadow: "0px 20px 50px var(--accent-glow)", borderColor: "var(--accent)" }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '40px',
            transformStyle: 'preserve-3d',
            transition: '0.3s'
          }}
        >
          <h2 style={{ fontFamily: 'monospace', fontSize: '24px', color: 'var(--accent)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            // Payment & Refund Directives
          </h2>
          
          <RefundRules fontSize="16px" />
          
        </motion.section>

      </div>
    </div>
  );
};

export default Refund;