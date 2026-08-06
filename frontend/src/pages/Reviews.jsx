import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [formStatus, setFormStatus] = useState("");

  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const cursorGlowX = useTransform(mouseX, (x) => `${x - 200}px`);
  const cursorGlowY = useTransform(mouseY, (y) => `${y - 200}px`);
 
  const fetchAllReviews = async () => {
    try {
      const res = await fetch("https://portfolio-px1j.onrender.com/api/reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

   
  useEffect(() => {
    fetchAllReviews();
  }, []);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("Submitting review...");
    
    const formData = new FormData(e.target);
    const newReview = {
      name: formData.get('name'),
      role: formData.get('role'),
      rating: parseInt(formData.get('rating')),
      text: formData.get('message')
    };

    try {
      const response = await fetch("https://portfolio-px1j.onrender.com/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        setFormStatus("✅ Thank you! Your review has been published.");
        e.target.reset();  
        fetchAllReviews();  
      } else {
        setFormStatus("❌ Error: Could not save your review.");
      }
    } catch (error) {
      setFormStatus("❌ Error: Backend server is offline.");
    }
  };

  const inputStyle = {
    padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)',
    background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px',
    outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.3s ease'
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '120px 8vw 80px 8vw', background: 'var(--bg-main)', color: 'var(--text-main)', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: `radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)`, zIndex: 0, pointerEvents: 'none' }} />
      <motion.div style={{ position: 'fixed', width: '400px', height: '400px', borderRadius: '50%', background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`, pointerEvents: 'none', left: cursorGlowX, top: cursorGlowY, zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1000px', margin: '0 auto' }}>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: 'clamp(35px, 5vw, 50px)', fontWeight: 'bold', margin: '0 0 10px 0' }}>Client <span style={{ color: 'var(--accent)' }}>Reviews</span></h1>
          <p style={{ color: 'var(--text-dim)' }}>Read what my clients and colleagues have to say about my work.</p>
        </motion.div>

         
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '60px' }}
        >
          <h2 style={{ fontSize: '22px', color: 'var(--accent)', marginBottom: '20px' }}>Leave a Review</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <input type="text" name="name" placeholder="Your Name" required style={inputStyle} />
              <input type="text" name="role" placeholder="Your Role / Company" required style={inputStyle} />
              <select name="rating" required style={inputStyle}>
                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                <option value="3">⭐⭐⭐ (3/5)</option>
                <option value="2">⭐⭐ (2/5)</option>
                <option value="1">⭐ (1/5)</option>
              </select>
            </div>
            <textarea name="message" placeholder="Write your experience working with me..." required rows="4" style={{ ...inputStyle, resize: 'none' }}></textarea>
            <motion.button type="submit" whileHover={{ scale: 1.02, backgroundColor: "var(--accent)", color: "var(--bg-main)" }} whileTap={{ scale: 0.95 }} style={{ padding: '15px', background: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' }}>
              Submit Review ↗
            </motion.button>
            {formStatus && <p style={{ color: 'var(--accent)', textAlign: 'center', margin: 0 }}>{formStatus}</p>}
          </form>
        </motion.div>

         
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', perspective: '2000px' }}>
          {reviews.map((review, i) => (
            <motion.div 
              key={review._id || i}  
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02, rotateX: 5, rotateY: -5, borderColor: 'var(--accent)', boxShadow: `0px 15px 40px var(--accent-glow)` }}
              style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'left', transformStyle: 'preserve-3d', transition: 'all 0.3s' }}
            >
              <div style={{ fontSize: '20px', marginBottom: '10px' }}>{"⭐".repeat(review.rating)}</div>
              
              <p style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '20px', flexGrow: 1 }}>
                "{review.text}"
              </p>
              
               
              {review.adminReply && (
                <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0, 229, 255, 0.05)', borderLeft: '3px solid var(--accent)', borderRadius: '0 8px 8px 0' }}>
                  <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Reply from Developer</span>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: 'var(--text-dim)', lineHeight: '1.5' }}>{review.adminReply}</p>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <h4 style={{ margin: 0, color: 'var(--accent)', fontSize: '16px' }}>{review.name}</h4>
                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{review.role}</span>
              </div>
            </motion.div>
          ))}
          
          {reviews.length === 0 && (
            <p style={{ color: 'var(--text-dim)', gridColumn: '1 / -1', textAlign: 'center' }}>No reviews yet. Be the first to leave one!</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reviews;