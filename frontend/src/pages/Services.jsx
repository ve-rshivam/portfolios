import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
const Services = () => {
  
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  

  
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

   
  const fallbackServices = [
    {
      id: 1,
      title: "Frontend Development",
      description: "Modern, responsive, and highly interactive user interfaces using React.js, Tailwind CSS, and Framer Motion.",
      price: "",
      icon: "🎨"
    },
    {
      id: 2,
      title: "Backend Development",
      description: "Secure, scalable RESTful APIs, database architecture, and server-side logic using Node.js, Express, and MongoDB.",
      price: "",
      icon: "⚙️"
    },
    {
      id: 3,
      title: "Full-Stack Web App",
      description: "End-to-end custom web application development from UI design to database deployment (MERN Stack).",
      price: "",
      icon: "🚀"
    },
    {
      id: 4,
      title: "3D Web Experiences",
      description: "Immersive 3D elements and interactive canvas experiences using Three.js and React Three Fiber.",
      price: "",
      icon: "🧊"
    },
    {
      id: 5,
      title: "Bug Fixing & Refactoring",
      description: "Performance optimization, code cleanup, and solving complex bugs in your existing React/Node codebase.",
      price: "",
      icon: "🔧"
    },
    {
      id: 6,
      title: "API Integration",
      description: "Seamless integration of third-party services like Stripe, PayPal, Firebase, OpenAI, or any custom API.",
      price: "",
      icon: "🔗"
    }
  ];

  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("https://portfolio-px1j.onrender.com/api/services");
        const data = await res.json();
        
        const serverServices = Array.isArray(data) ? data : [];
        
         
        const combinedServices = [...fallbackServices, ...serverServices];
        const uniqueServicesMap = new Map();
        
        combinedServices.forEach((service) => {
          if (service && service.title) {
            const key = service.title.toLowerCase();
            const existingService = uniqueServicesMap.get(key) || {};
            
            uniqueServicesMap.set(key, {
              ...existingService,
              ...service,
              
              description: service.description || existingService.description,
              icon: service.icon || existingService.icon,
              price: service.price || existingService.price,
            });
          }
        });

        
        setServicesData(Array.from(uniqueServicesMap.values()));

      } catch (err) {
        console.error("Backend fetch error:", err);
       
        setServicesData(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

   
  const handleServiceClick = (serviceTitle) => {
     
    navigate('/payment', { state: { preSelectedService: serviceTitle } });
  };

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
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

       
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1200px', margin: '0 auto' }}>
        
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 style={{ fontSize: 'clamp(35px, 5vw, 50px)', fontWeight: 'bold', margin: '0 0 15px 0' }}>
            Freelance <span style={{ color: 'var(--accent)' }}>Services</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '16px', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            I offer high-quality, scalable web development services tailored to your business needs. Choose a package or contact me for a custom quote.
          </p>
        </motion.div>

         
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Loading services...</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '30px', 
            perspective: '2000px',
            marginBottom: '80px'
          }}>
            {servicesData.map((service, index) => (
              <motion.div 
                key={service._id || service.id} 
                onClick={() => handleServiceClick(service.title)}  
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.03, 
                  y: -10,
                  rotateX: 6,
                  rotateY: -6,
                  boxShadow: "0px 20px 50px var(--accent-glow)",
                  borderColor: "var(--accent)" 
                }}
                style={{ 
                  background: 'var(--bg-card)', 
                  padding: '35px 30px', 
                  borderRadius: '16px', 
                  border: '1px solid var(--border-color)', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  transformStyle: 'preserve-3d',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ fontSize: '36px' }}>{service.icon}</div>
                  <div style={{ 
                    background: 'var(--accent-glow)', 
                    color: 'var(--accent)', 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    border: '1px solid var(--accent)'
                  }}>
                    {service.price || 'Contact for Quote'}
                  </div>
                </div>
                
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold' }}>
                  {service.title}
                </h3>
                
                <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: '1.6', flexGrow: 1, margin: '0 0 20px 0' }}>
                  {service.description}
                </p>

                 
                <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold' }}>Select this service ➔</span>
              </motion.div>
            ))}
          </div>
        )}

        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '50px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <h2 style={{ fontSize: '30px', color: 'var(--text-main)', marginBottom: '20px', fontWeight: 'bold' }}>
            Payment <span style={{ color: 'var(--accent)' }}>Process</span>
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '16px', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.7' }}>
            I believe in a transparent and secure workflow. Projects are broken down into milestones to ensure satisfaction at every step.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', marginBottom: '40px' }}>
            
            <div style={{ flex: '1', minWidth: '250px', textAlign: 'left', background: 'var(--bg-main)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent)', fontSize: '18px', marginBottom: '10px' }}>01. Upfront Deposit</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>A standard 40% - 50% deposit is required to lock in the project timeline and begin development.</p>
            </div>

            <div style={{ flex: '1', minWidth: '250px', textAlign: 'left', background: 'var(--bg-main)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent)', fontSize: '18px', marginBottom: '10px' }}>02. Milestones</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>For larger projects, payments are divided into logical milestones (e.g., UI Design approval, Backend setup).</p>
            </div>

            <div style={{ flex: '1', minWidth: '250px', textAlign: 'left', background: 'var(--bg-main)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent)', fontSize: '18px', marginBottom: '10px' }}>03. Final Handover</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>The final balance is paid upon project completion, right before the source code and production deployment.</p>
            </div>

          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'var(--text-main)', fontWeight: 'bold', margin: '0 0 10px 0' }}>Accepted Payment Methods:</p>
              <div style={{ display: 'flex', gap: '15px', color: 'var(--text-dim)', fontSize: '24px' }}>
                <span title="PayPal">💳</span>
                <span title="Bank Transfer / UPI">🏦</span>
                <span title="Crypto (USDT)">🪙</span>
              </div>
            </div>

            <motion.button 
              onClick={() => navigate('/contact')} 
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px var(--accent-glow)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'var(--accent)',
                color: 'var(--bg-main)',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Discuss a Project
            </motion.button>
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default Services;