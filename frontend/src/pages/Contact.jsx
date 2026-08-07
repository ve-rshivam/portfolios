import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshWobbleMaterial, Torus } from '@react-three/drei';

const Contact = () => {
  const [result, setResult] = useState("");
  const [contactLinks, setContactLinks] = useState([]);

  
  useEffect(() => {
    fetch("https://portfolio-px1j.onrender.com/api/content")
      .then(res => res.json())
      .then(data => {
        if (data && data.contactData && Array.isArray(data.contactData)) {
          setContactLinks(data.contactData);
        }
      })
      .catch(err => console.log("Content fetch error", err));
  }, []);

  
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

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending message...");

    const formData = new FormData(event.target);

    
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      type: 'contact'
    };

    try {
      
      const web3FormData = new FormData(event.target);
      web3FormData.append("access_key", "WEB3FORMS_ACCESS_KEY"); 

      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3FormData
      });

      
      const response = await fetch("https://portfolio-px1j.onrender.com/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const resultData = await response.json();

      if (resultData.success) {
        setResult("Message Sent! ");
        event.target.reset(); 
      } else {
        setResult("Error: The message was sent but was not saved in the Inbox.");
      }
    } catch (error) {
      setResult("Error: The backend server is offline or there is a network issue. Please try again later.");
    }
  };

 
  const socials = [
    { name: "LinkedIn", url: "https://linkedin.com/in/ve-rshivam", color: "#0077b5" },
    { name: "GitHub", url: "https://github.com/ve-rshivam", color: "#2aa10f" },
    { name: "Instagram", url: "https://instagram.com/ve.rshivam", color: "#e4405f" },
    { name: "Email", url: "mailto:getus.shivam@gmail.com", color: "#ea4335" },
    { name: "Twitter / X", url: "https://x.com/ve8rshivam", color: "#1da1f2" },
  ];

  const inputStyle = {
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-main)',
    color: 'var(--text-main)',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    fontFamily: 'Inter, sans-serif'
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      padding: '120px 8vw 80px 8vw',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>

     
      <div style={{
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        background: `radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

     
      <motion.div style={{
        position: 'fixed',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`,
        pointerEvents: 'none',
        left: cursorGlowX, top: cursorGlowY,
        zIndex: 1,
      }} />

    
      <div style={{ position: 'relative', zIndex: 5, width: '100%', display: 'flex', flexWrap: 'wrap', gap: '50px', alignItems: 'center' }}>

       
        <div style={{ flex: 1.2, minWidth: '320px', perspective: '2000px' }}>
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ color: 'var(--text-main)', fontSize: 'clamp(35px, 5vw, 50px)', margin: '0 0 10px 0', fontWeight: 'bold' }}
          >
            Let's <span style={{ color: 'var(--accent)' }}>Connect</span>
          </motion.h1>
          <p style={{ color: 'var(--text-dim)', marginBottom: '40px', fontSize: '16px', lineHeight: '1.6' }}>
            Please fill out the form or connect on social media.
          </p>

          
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{
              y: -10,
              scale: 1.02,
              rotateX: 2,   
              rotateY: -2,  
              boxShadow: "0px 20px 50px var(--accent-glow)",
              borderColor: "var(--accent)"
            }}
            style={{
              display: 'flex', flexDirection: 'column', gap: '20px',
              background: 'var(--bg-card)', padding: '40px',
              borderRadius: '20px', border: '1px solid var(--border-color)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              transformStyle: 'preserve-3d'
            }}
          >
            <input type="text" name="name" placeholder="Full Name" required style={inputStyle} />
            <input type="email" name="email" placeholder="Email Address" required style={inputStyle} />
            <input type="tel" name="phone" placeholder="Mobile (Optional)" style={inputStyle} />
            <textarea name="message" placeholder="Your Message..." required rows="4" style={{ ...inputStyle, resize: 'none' }}></textarea>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, backgroundColor: "var(--accent)", color: "var(--bg-main)", boxShadow: "0px 10px 20px var(--accent-glow)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '15px', background: 'transparent', color: 'var(--accent)',
                border: '2px solid var(--accent)', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px',
                cursor: 'pointer', transition: 'all 0.3s ease', marginTop: '10px'
              }}
            >
              Send Message
            </motion.button>
            <span style={{ color: 'var(--text-main)', fontSize: '14px', textAlign: 'center', marginTop: '10px', fontWeight: '500' }}>{result}</span>
          </motion.form>

          
          <div style={{ marginTop: '40px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {socials.map((social, index) => (
              <motion.a
                key={`social-${index}`}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                whileHover={{ y: -5, scale: 1.05, borderColor: social.color, boxShadow: `0px 10px 20px ${social.color}40` }}
                style={{
                  padding: '12px 24px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: `1px solid var(--border-color)`,
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: social.color, boxShadow: `0 0 10px ${social.color}` }}></span>
                {social.name}
              </motion.a>
            ))}

            {contactLinks.map((link, index) => {
              const dynColor = ["#ff0055", "#00e5ff", "#8a2be2", "#ffaa00", "#00ff66", "#e4405f"][index % 6];
              return (
              <motion.a
                key={`custom-${index}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + ((socials.length + index) * 0.1) }}
                whileHover={{ y: -5, scale: 1.05, borderColor: dynColor, boxShadow: `0px 10px 20px ${dynColor}40` }}
                style={{
                  padding: '12px 24px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: `1px solid var(--border-color)`,
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dynColor, boxShadow: `0 0 10px ${dynColor}` }}></span>
                {link.icon && link.icon.trim() !== '' ? <span>{link.icon}</span> : null}
                {link.title}
              </motion.a>
              );
            })}
          </div>
        </div>

        
        <div style={{ flex: 1, height: '500px', minWidth: '320px' }}>
          <Canvas>
            <ambientLight intensity={1} />
            <directionalLight position={[2, 5, 2]} intensity={2} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            <Torus args={[1, 0.4, 16, 100]} scale={1.8}>
              <MeshWobbleMaterial color="#00e5ff" factor={0.6} speed={1.5} roughness={0.2} metalness={0.8} />
            </Torus>
          </Canvas>
        </div>

      </div>

     
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

export default Contact;