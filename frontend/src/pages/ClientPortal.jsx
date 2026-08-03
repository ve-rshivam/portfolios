import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ClientPortal = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('clientLoggedIn') === 'true';
  });
  const [loginData, setLoginData] = useState({ email: '', accessKey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Feature 2: Projects Array State instead of single project object
  const [projectsList, setProjectsList] = useState(() => {
    const saved = localStorage.getItem('clientProjectsList');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Active Project Selection State
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  // ✅ Welcome Popup State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isTempKey, setIsTempKey] = useState(false);

  // 🔥 NEW: Settings & Modals States 🔥
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // 🔥 NEW: Client Reply States 🔥
  const [clientReply, setClientReply] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Helper to get currently active project
  const projectData = projectsList.find(p => p._id === activeProjectId) || projectsList[0];

  useEffect(() => {
    const refreshProjectData = async () => {
      const savedEmail = localStorage.getItem('clientEmail');
      if (!isLoggedIn || !savedEmail) return;
      try {
        const res = await fetch("https://portfolio-px1j.onrender.com/api/client/get-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: savedEmail })
        });
        const data = await res.json();
        if (data.success && data.projects && data.projects.length > 0) {
          setProjectsList(data.projects);
          localStorage.setItem('clientProjectsList', JSON.stringify(data.projects));
          
          if (!activeProjectId) {
            setActiveProjectId(data.projects[0]._id);
          }
        }
      } catch (err) {
        console.log("Refresh failed, using cached data.");
      }
    };
    refreshProjectData();
  }, [isLoggedIn, activeProjectId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch("https://portfolio-px1j.onrender.com/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      console.log("Backend response:", JSON.stringify(data, null, 2));

      if (data.success) {
        if (!data.projects || data.projects.length === 0) {
          setError("Please contact the administrator. Your project data is missing.");
          setLoading(false);
          return;
        }
        localStorage.setItem('clientLoggedIn', 'true');
        localStorage.setItem('clientEmail', loginData.email);
        localStorage.setItem('clientProjectsList', JSON.stringify(data.projects));
        
        setProjectsList(data.projects);
        setActiveProjectId(data.projects[0]._id);
        setIsLoggedIn(true);

        // Security check via the first mapped project
        setIsTempKey(data.projects[0].isTemporaryKey || false);
        setShowWelcomePopup(true);

      } else {
        setError(data.message || "Invalid credentials. Ensure your payment is verified.");
      }
    } catch (err) {
      setError("Server connection error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientLoggedIn');
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('clientProjectsList');
    setIsLoggedIn(false);
    setProjectsList([]);
    setActiveProjectId(null);
    setLoginData({ email: '', accessKey: '' });
    setShowWelcomePopup(false);
    setShowSettings(false);
    setShowPasswordModal(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    setForgotError('');
    try {
      const res = await fetch("https://portfolio-px1j.onrender.com/api/client/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) {
        setForgotMsg("✅ The new password has been sent successfully. Please check your inbox.");
        setForgotEmail('');
      } else {
        setForgotError(data.message || "Email not found.");
      }
    } catch (err) {
      setForgotError("Server connection error. Please try again later.");
    } finally {
      setForgotLoading(false);
    }
  };

  // 🔥 NEW: Handle Client Reply Submission 🔥
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!clientReply.trim() || !projectData) return;
    
    setIsSendingReply(true);
    try {
      const res = await fetch("https://portfolio-px1j.onrender.com/api/client/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: projectData.clientEmail, projectId: projectData._id, message: clientReply })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Your message has been sent to the developer!");
        setClientReply('');
      } else {
        alert("❌ Failed to send message. Please try again.");
      }
    } catch(err) {
      alert("Server error while sending message.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // 🔥 FEATURE: Pay Remaining Dues Redirect
  const handlePayRemaining = () => {
    if (!projectData) return;
    
    navigate('/payment', { 
      state: { 
        isRemainingPayment: true,
        projectId: projectData._id,
        service: projectData.projectTitle,
        clientName: projectData.clientName,
        clientEmail: projectData.clientEmail,
        remainingAmount: projectData.balanceDue,
        originalTotal: projectData.totalCost
      } 
    });
  };

  const inputStyle = { padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', width: '100%', boxSizing: 'border-box', fontSize: '15px' };
  const btnStyle = { padding: '16px', background: 'var(--accent)', color: 'var(--bg-main)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '16px' };
  const cardStyle = { background: 'var(--bg-card)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };

  return (
    <div style={{ minHeight: '100vh', padding: '120px 8vw 80px 8vw', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif' }}>

      {/* ✅ WELCOME POPUP */}
      <AnimatePresence>
        {showWelcomePopup && projectData && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '20px', border: isTempKey ? '1px solid #ffaa00' : '1px solid var(--accent)', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            >
              {isTempKey ? (
                <>
                  <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
                  <h2 style={{ margin: '0 0 10px 0', color: '#ffaa00', fontSize: '22px' }}>
                    Please change your password!
                  </h2>
                  <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '25px', fontSize: '15px' }}>
                    You are currently logged in with a <strong style={{ color: '#ffaa00' }}>temporary access key</strong>.<br /><br />
                    For security reasons, please change your password from the <strong style={{ color: 'var(--text-main)' }}>⚙️ Settings</strong> menu.
                  </p>
                  <button
                    onClick={() => { setShowWelcomePopup(false); setShowSettings(true); }}
                    style={{ padding: '14px 30px', background: '#ffaa00', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%' }}
                  >
                   Got it, I’ll change it. 🔐
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '50px', marginBottom: '15px' }}>👋</div>
                  <h2 style={{ margin: '0 0 10px 0', color: 'var(--accent)', fontSize: '24px' }}>
                    Welcome Back, {projectData.clientName}!
                  </h2>
                  <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '25px', fontSize: '15px' }}>
                    You have <strong style={{ color: 'var(--text-main)' }}>{projectsList.length}</strong> active project(s) on your dashboard.<br /><br />
                    You can view the latest updates below.
                  </p>
                  <button
                    onClick={() => setShowWelcomePopup(false)}
                    style={{ padding: '14px 30px', background: 'var(--accent)', color: 'var(--bg-main)', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%' }}
                  >
                    View Dashboard 🚀
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 NEW: PASSWORD CHANGE MODAL 🔥 */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              style={{ background: 'var(--bg-card)', padding: '35px', borderRadius: '20px', border: '1px solid var(--border-color)', maxWidth: '400px', width: '90%', position: 'relative' }}
            >
              <button onClick={() => setShowPasswordModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '20px', cursor: 'pointer' }}>✖</button>
              
              <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '22px' }}>Change Password</h2>
              {isTempKey && (
                <p style={{ color: '#ffaa00', fontSize: '13px', margin: '0 0 15px 0' }}>
                  ⚠️ You are using a temporary key — please change it immediately!
                </p>
              )}
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const oldK = e.target.oldKey.value;
                const newK = e.target.newKey.value;
                try {
                  const res = await fetch("https://portfolio-px1j.onrender.com/api/client/change-password", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: projectData.clientEmail, oldKey: oldK, newKey: newK })
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("Password Changed Successfully! ✅");
                    setIsTempKey(false); 
                    setShowPasswordModal(false);
                  } else {
                    alert(data.message);
                  }
                } catch(err) { alert("Server error"); }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input type="password" name="oldKey" placeholder="Current Password" required style={inputStyle} />
                <input type="password" name="newKey" placeholder="New Password" required style={inputStyle} />
                <button type="submit" style={{ ...btnStyle, background: isTempKey ? '#ffaa00' : 'var(--accent)', color: isTempKey ? '#000' : 'var(--bg-main)' }}>
                  Update Secure Key 🔐
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {!isLoggedIn ? (
        // ================= LOGIN SCREEN =================
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
          >
            <AnimatePresence mode="wait">
              {!showForgot ? (
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Client <span style={{ color: 'var(--accent)' }}>Portal</span></h2>
                  <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '15px' }}>Enter your Email and the Secure Access Key sent to you.</p>

                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                      type="email" required placeholder="Registered Email ID"
                      id="email" name="email"
                      value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      style={inputStyle}
                    />
                    <input
                      type="password" required placeholder="Secure Access Key"
                      id="accessKey" name="accessKey"
                      value={loginData.accessKey} onChange={(e) => setLoginData({...loginData, accessKey: e.target.value})}
                      style={inputStyle}
                    />
                    <button type="submit" disabled={loading} style={btnStyle}>
                      {loading ? 'Verifying...' : 'Access Dashboard 🚀'}
                    </button>
                  </form>

                  {error && <p style={{ color: '#ff4d4d', marginTop: '15px', fontSize: '14px', fontWeight: 'bold' }}>{error}</p>}

                  <p
                    onClick={() => { setShowForgot(true); setError(''); }}
                    style={{ color: 'var(--accent)', marginTop: '20px', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Forgot Password?
                  </p>
                </motion.div>

              ) : (
                <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Forgot <span style={{ color: 'var(--accent)' }}>Access Key?</span></h2>
                  <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '15px' }}>
                    Enter your registered email address — a new password will be sent to you.
                  </p>

                  <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                      type="email" required placeholder="Registered Email ID"
                      value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      style={inputStyle}
                    />
                    <button type="submit" disabled={forgotLoading} style={btnStyle}>
                      {forgotLoading ? 'Sending...' : 'Send New Access Key 📧'}
                    </button>
                  </form>

                  {forgotMsg && <p style={{ color: '#00f5a0', marginTop: '15px', fontSize: '14px', fontWeight: 'bold' }}>{forgotMsg}</p>}
                  {forgotError && <p style={{ color: '#ff4d4d', marginTop: '15px', fontSize: '14px', fontWeight: 'bold' }}>{forgotError}</p>}

                  <p
                    onClick={() => { setShowForgot(false); setForgotMsg(''); setForgotError(''); }}
                    style={{ color: 'var(--accent)', marginTop: '20px', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ← Back to Login
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      ) : !projectData ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '18px' }}>Loading project data...</p>
        </div>

      ) : (
        // ================= CLIENT DASHBOARD =================
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '32px' }}>Welcome, <span style={{ color: 'var(--accent)' }}>{projectData.clientName}</span></h1>
            </div>
            
            {/* 🔥 NEW: GEAR ICON & SETTINGS DROPDOWN / SIDEBAR 🔥 */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                style={{ background: 'transparent', border: 'none', fontSize: '28px', cursor: 'pointer', padding: '5px' }}
              >
                ⚙️
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, x: 10 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -10, x: 10 }}
                    style={{ position: 'absolute', top: '50px', right: '0', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '200px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 50 }}
                  >
                    <button 
                      onClick={() => { setShowSettings(false); setShowPasswordModal(true); }}
                      style={{ width: '100%', padding: '15px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      🔐 Change Password
                    </button>
                    <button 
                      onClick={handleLogout}
                      style={{ width: '100%', padding: '15px', background: 'rgba(255, 77, 77, 0.05)', border: 'none', color: '#ff4d4d', textAlign: 'left', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      🚪 Secure Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 🔥 FEATURE 2: MULTI-PROJECT TABS NAVIGATION 🔥 */}
          {projectsList && projectsList.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '30px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              {projectsList.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setActiveProjectId(p._id)}
                  style={{
                    padding: '10px 20px',
                    background: activeProjectId === p._id ? 'var(--accent-glow)' : 'transparent',
                    color: activeProjectId === p._id ? 'var(--accent)' : 'var(--text-dim)',
                    border: activeProjectId === p._id ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s'
                  }}
                >
                  {p.projectTitle}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

            {/* PROGRESS CARD */}
            <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)', gridColumn: '1 / -1' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dim)', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Progress</h3>
                <span style={{ fontSize: '14px', color: 'var(--text-main)', background: 'var(--bg-main)', padding: '5px 15px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                  Active Project: <strong style={{ color: 'var(--accent)' }}>{projectData.projectTitle}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{projectData.status}</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{projectData.progress}%</span>
              </div>

              <div style={{ width: '100%', height: '12px', background: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${projectData.progress ?? 0}%` }} transition={{ duration: 1, ease: "easeOut" }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #00ff9d 0%, #00b8ff 100%)', borderRadius: '10px' }}
                />
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '15px', textAlign: 'right' }}>
                Last updated: {projectData.lastUpdated ? new Date(projectData.lastUpdated).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {/* DETAILS CARDS */}
            <div style={cardStyle}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>💳</div>
              <h4 style={{ color: 'var(--text-dim)', margin: '0 0 5px 0' }}>Payment Status</h4>
              <h2 style={{ margin: '0 0 15px 0', color: projectData.balanceDue > 0 ? '#ffaa00' : '#00f5a0' }}>{projectData.paymentStatus}</h2>
              
              {/* Feature: Pay Remaining Dues */}
              {projectData.balanceDue > 0 && (
                <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-main)' }}>Remaining Due: <strong style={{ color: '#ff4d6d' }}>${projectData.balanceDue}</strong></p>
                  <button 
                    onClick={handlePayRemaining}
                    style={{ padding: '10px 15px', background: 'transparent', color: '#ffaa00', border: '1px solid #ffaa00', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
                  >
                    Pay Remaining Balance ➔
                  </button>
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>📅</div>
              <h4 style={{ color: 'var(--text-dim)', margin: '0 0 5px 0' }}>Expected Delivery</h4>
              <h2 style={{ margin: 0, color: 'var(--text-main)' }}>{projectData.deliveryDate || 'TBD'}</h2>
            </div>

            {/* ADMIN NOTES & CLIENT REPLY SECTION */}
            <div style={{ ...cardStyle, gridColumn: '1 / -1', background: 'rgba(0, 229, 255, 0.05)', border: '1px dashed var(--accent)', padding: '30px' }}>
              <h3 style={{ color: 'var(--accent)', margin: '0 0 10px 0', fontSize: '20px' }}>🔔 Latest Update from Shivam</h3>
              <p style={{ color: 'var(--text-main)', margin: '0 0 25px 0', lineHeight: '1.6', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                {projectData.notes || 'No new updates right now. Working on your project!'}
              </p>
              
              {/* 🔥 NEW: CLIENT REPLY BOX 🔥 */}
              <div style={{ width: '100%', borderTop: '1px solid rgba(0, 229, 255, 0.2)', paddingTop: '20px' }}>
                <h4 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>Message your developer directly:</h4>
                <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea 
                    rows="3" 
                    placeholder="Type your message, feedback, or question here..." 
                    value={clientReply}
                    onChange={(e) => setClientReply(e.target.value)}
                    style={{ ...inputStyle, background: 'var(--bg-main)', border: '1px solid var(--border-color)', resize: 'vertical' }}
                    required
                  ></textarea>
                  <button type="submit" disabled={isSendingReply} style={{ ...btnStyle, width: 'auto', alignSelf: 'flex-end', padding: '12px 25px', fontSize: '14px' }}>
                    {isSendingReply ? 'Sending...' : 'Send Message ✉️'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </motion.div>
      )}

    </div>
  );
};

export default ClientPortal;