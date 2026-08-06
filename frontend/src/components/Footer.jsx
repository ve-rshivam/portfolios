import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '50px 5vw 30px 5vw', 
      background: 'var(--bg-main)',  
      borderTop: '1px solid var(--border-color)',
      fontFamily: 'Inter, sans-serif',
      transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease',
      position: 'relative',
      zIndex: 10
    }}>
      
       
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '15px', 
        flexWrap: 'wrap', 
        marginBottom: '25px',
        fontSize: '14px',
        fontWeight: '500'
      }}>
         
        <motion.a href="/privacy" whileHover={{ color: 'var(--accent)' }} style={linkStyle}>
          Privacy Policy
        </motion.a>
        <span style={separatorStyle}>|</span>

        <motion.a href="/terms" whileHover={{ color: 'var(--accent)' }} style={linkStyle}>
          Terms &amp; Conditions
        </motion.a>
        <span style={separatorStyle}>|</span>

        <motion.a href="/refund" whileHover={{ color: 'var(--accent)' }} style={linkStyle}>
          Refund Policy
        </motion.a>
        <span style={separatorStyle}>|</span>

        <motion.a href="/contact" whileHover={{ color: 'var(--accent)' }} style={linkStyle}>
          Contact Us
        </motion.a>
        <span style={separatorStyle}>|</span>

        
        <motion.a href="/payment" whileHover={{ color: 'var(--accent)', scale: 1.05 }} style={{ ...linkStyle, color: 'var(--accent)', fontWeight: 'bold' }}>
          Payment
        </motion.a>
      </div>

       
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '8px', 
        flexWrap: 'wrap', 
        fontSize: '14px', 
        color: 'var(--text-main)' 
      }}>
        <span style={{ fontWeight: '600', opacity: 0.7 }}>© {new Date().getFullYear()}</span>
        
         
        <motion.a 
          href="https://linkedin.com/in/ve-rshivam" 
          target="_blank" 
          rel="noreferrer"
          whileHover={{ scale: 1.05, y: -2 }} 
          style={{ 
            color: 'var(--accent)', 
            fontWeight: '800', 
            textDecoration: 'none', 
            display: 'inline-block',
            letterSpacing: '1px',
            transition: 'color 0.3s ease'
          }}
        >
          SHIVAM KUMAR SINGH
        </motion.a>
        
        <span style={{ opacity: 0.7 }}>— All rights reserved.</span>
      </div>

    </footer>
  );
};

 
const linkStyle = {
  color: 'var(--text-dim)', 
  textDecoration: 'none',
  transition: 'color 0.3s ease'
};

const separatorStyle = {
  color: 'var(--text-dim)', 
  opacity: 0.3
};

export default Footer;