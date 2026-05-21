import React from 'react';
import { motion } from 'framer-motion';

const Preloader = () => {
  return (
    <motion.div
      exit={{ opacity: 0, y: -50, transition: { duration: 0.3, ease: "easeInOut" } }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
        background: 'var(--bg-main)', 
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        zIndex: 99999, color: 'var(--text-main)', fontFamily: 'Inter, sans-serif'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }} 
        style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '4px' }}
      >
        SHIVAM<span style={{ color: 'var(--accent)' }}>.</span>
      </motion.div>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "150px" }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        style={{ 
          height: '3px', 
          background: 'var(--accent)', 
          marginTop: '15px', 
          borderRadius: '5px',
          boxShadow: '0px 0px 10px var(--accent)' 
        }}
      />
    </motion.div>
  );
};

export default Preloader;