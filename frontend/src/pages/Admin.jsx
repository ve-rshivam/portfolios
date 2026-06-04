import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

const Admin = () => {
  // ==================== SAFE STORAGE PARSER ====================
  const getSafePerms = () => {
    try {
      const perms = localStorage.getItem("adminPerms");
      return perms ? JSON.parse(perms) : [];
    } catch(e) { return []; }
  };

  // ==================== SECURE AUTH STATES ====================
  const [authStep, setAuthStep] = useState(localStorage.getItem("adminToken") ? 2 : 0);
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [backupPin, setBackupPin] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // 🔥 ROLE-BASED ACCESS CONTROL (RBAC) STATES 🔥
  const [adminRole, setAdminRole] = useState(localStorage.getItem("adminRole") || "team");
  const [adminPerms, setAdminPerms] = useState(getSafePerms());
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || "");

  // Forgot Password States
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // ==================== DASHBOARD STATES ====================
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [inboxData, setInboxData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]); 
  const [skills, setSkills] = useState([]); 
  const [experiences, setExperiences] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [education, setEducation] = useState([]);

  // 🔥 GITHUB PROJECTS CONTROL STATES 🔥
  const [githubProjects, setGithubProjects] = useState([]);
  const [pinnedProjects, setPinnedProjects] = useState([]);
  
  // Form States
  const [newEdu, setNewEdu] = useState({ degree: '', institution: '', duration: '', score: '', description: '' });
  const [newExp, setNewExp] = useState({ duration: '', role: '', company: '', description: '' }); 
  const [newService, setNewService] = useState({ title: '', description: '', icon: '🔧', price: '' });
  const [newSkill, setNewSkill] = useState({ name: '', description: '', icon: '💻', proficiency: 50, category: 'Tech' }); 
  
  // 🔥 TEAM MANAGEMENT STATE 🔥
  const [teamList, setTeamList] = useState([]);
  const [newTeamMember, setNewTeamMember] = useState({ name: '', identifier: '', permissions: [] });

  const [newProject, setNewProject] = useState({ 
    clientName: '', clientEmail: '', projectTitle: '', trackingId: '', 
    progress: 10, status: 'Started', paymentStatus: 'Pending', deliveryDate: '', notes: '' 
  });
  
  const [cmsStatus, setCmsStatus] = useState('');
  const [homeData, setHomeData] = useState({ heroTitle: '', heroSubtitle: '' });
  const [aboutData, setAboutData] = useState({ description: '' });
  const [contactData, setContactData] = useState([]);
  const [policyData, setPolicyData] = useState({ privacy: '', terms: '', refund: '' });

  // 🔥 SELF-SERVICE SECURITY STATES 🔥
  const [securityData, setSecurityData] = useState({ oldPassword: '', newPassword: '', newPin: '' });
  const [securityMsg, setSecurityMsg] = useState('');

  // ====================================
  // 🛡️ SECURITY HELPER: Check Permission
  // ====================================
  const hasPerm = (perm) => adminRole === 'superadmin' || adminPerms.includes(perm);

  // ====================================
  // FETCH DASHBOARD DATA (Safe Fetching Logic)
  // ====================================
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken"); 
      const headers = { "Authorization": `Bearer ${token}` }; 

      // 1. Unconditional Fetches (Because these are public data APIs)
      const srvRes = await fetch("http://localhost:5000/api/services"); 
      if(srvRes.ok) setServices(await srvRes.json());

      const skillRes = await fetch("http://localhost:5000/api/resume-data");
      if(skillRes.ok) {
        const skillData = await skillRes.json();
        setSkills(skillData.skills || []);
        setEducation(skillData.education || []); 
        setExperiences(skillData.experiences || []);
      }

      // 2. Conditional / Protected Fetches
      if (hasPerm('messages') || hasPerm('payments')) {
        const msgRes = await fetch("http://localhost:5000/api/messages", { headers });
        if(msgRes.ok) setInboxData(await msgRes.json());
      }

      if (hasPerm('reviews')) {
        const revRes = await fetch("http://localhost:5000/api/reviews"); 
        if(revRes.ok) setReviews(await revRes.json());
      }
      
      if (hasPerm('projects') || hasPerm('payments')) {
        const projRes = await fetch("http://localhost:5000/api/client-projects", { headers });
        if(projRes.ok) setClientProjects(await projRes.json());
      }

      if (hasPerm('cms')) {
        const contentRes = await fetch("http://localhost:5000/api/content"); 
        if(contentRes.ok) {
          const content = await contentRes.json();
          setHomeData(content.homeData || {});
          setAboutData(content.aboutData || {});
          setContactData(Array.isArray(content.contactData) ? content.contactData : []);
          setPolicyData(content.policyData || {});
        }

        const pinRes = await fetch("http://localhost:5000/api/pinned-projects");
        if (pinRes.ok) setPinnedProjects(await pinRes.json());

        const githubUser = "ve-rshivam";
        const ghRes = await fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=100`);
        if (ghRes.ok) setGithubProjects(await ghRes.json());
      }

      if (adminRole === 'superadmin') {
        const teamRes = await fetch("http://localhost:5000/api/admin/team", { headers });
        if(teamRes.ok) setTeamList(await teamRes.json());
      }

    } catch (err) { console.error("Fetch Data Error:", err); }
  };

  useEffect(() => {
    if (authStep === 2) fetchDashboardData();
  }, [authStep, adminRole]);


  // ====================================
  // PROTECTED ACTIONS (MESSAGES, REVIEWS, CMS)
  // ====================================
  const deleteInboxItem = async (id) => {
    if (window.confirm("Delete this permanently?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/messages/${id}`, { 
          method: 'DELETE', headers: { "Authorization": `Bearer ${token}` }
        });
        fetchDashboardData();
      } catch(err) { alert("Failed to delete"); }
    }
  };

  const saveContent = async (e) => {
    e.preventDefault();
    setCmsStatus("Saving changes to database...");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/content/update", {
        method: "POST", 
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, 
        body: JSON.stringify({ homeData, aboutData, contactData, policyData }) 
      });
      const data = await res.json();
      if (data.success) setCmsStatus("✅ Changes are now LIVE on the website!");
    } catch (err) { setCmsStatus("❌ Error connecting to database."); }
  };

  const toggleGitHubPin = async (repo) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/pinned-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          repoId: repo.id.toString(),
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData(); 
      }
    } catch (err) { 
      alert("Failed to update project visibility."); 
    }
  };

  const togglePinReview = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch(`http://localhost:5000/api/reviews/${id}/pin`, { 
        method: 'PUT', headers: { "Authorization": `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch(err) { console.log(err); }
  };

  const deleteReview = async (id) => {
    if(window.confirm("Delete this review forever?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/reviews/${id}`, { 
          method: 'DELETE', headers: { "Authorization": `Bearer ${token}` }
        });
        fetchDashboardData();
      } catch(err) { console.log(err); }
    }
  };

  const editReviewText = async (id, currentText) => {
    const newText = window.prompt("Edit Review Text:", currentText);
    if(newText && newText !== currentText) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/reviews/${id}/edit`, { 
          method: 'PUT',
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ text: newText })
        });
        fetchDashboardData();
      } catch(err) { alert("Failed to edit review"); }
    }
  };

  const replyToReview = async (id, currentReply) => {
    const reply = window.prompt("Enter your public reply to this review:", currentReply || "");
    if(reply !== null) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/reviews/${id}/reply`, { 
          method: 'PUT',
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ adminReply: reply })
        });
        fetchDashboardData();
      } catch(err) { alert("Failed to reply to review"); }
    }
  };

  // --- SERVICES LOGIC ---
  // --- SERVICES LOGIC ---
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const isEditing = !!newService._id; // Check if we are updating
      const url = isEditing ? `http://localhost:5000/api/services/${newService._id}` : "http://localhost:5000/api/services";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newService)
      });
      if(res.ok) {
        setNewService({ title: '', description: '', icon: '🔧', price: '' }); 
        fetchDashboardData(); 
        alert(`Service ${isEditing ? 'Updated' : 'Added'} Successfully!`);
      }
    } catch(err) { alert("Failed to save service"); }
  };

  const deleteService = async (id) => {
    if(window.confirm("Delete this service?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/services/${id}`, { 
          method: 'DELETE', headers: { "Authorization": `Bearer ${token}` }
        });
        fetchDashboardData();
      } catch(err) { alert("Failed to delete service"); }
    }
  };

  // --- EDUCATION LOGIC --- 
  const handleAddEdu = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/education", { 
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(newEdu)
      });
      if(res.ok) {
        setNewEdu({ degree: '', institution: '', duration: '', score: '', description: '' }); 
        fetchDashboardData(); 
      } else alert("Failed to add education");
    } catch(err) { alert("Failed to add education"); }
  };

  const deleteEdu = async (id) => {
    if(window.confirm("Delete this education record?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/education/${id}`, { method: 'DELETE', headers: { "Authorization": `Bearer ${token}` } });
        fetchDashboardData();
      } catch(err) { alert("Failed to delete"); }
    }
  };

  // --- SKILLS LOGIC --- 
  // --- SKILLS LOGIC --- 
  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const isEditing = !!newSkill._id; // Check if we are updating
      const url = isEditing ? `http://localhost:5000/api/skill/${newSkill._id}` : "http://localhost:5000/api/skill";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, { 
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newSkill)
      });
      if(res.ok) {
        setNewSkill({ name: '', description: '', icon: '💻', proficiency: 50, category: 'Tech' }); 
        fetchDashboardData(); 
        alert(`Skill ${isEditing ? 'Updated' : 'Added'} Successfully!`);
      } else {
        alert("Failed to save skill");
      }
    } catch(err) { alert("Failed to save skill"); }
  };
  const deleteSkill = async (id) => {
    if (!id) {
      alert("Cannot delete: this skill has no ID.");
      return;
    }
    if (window.confirm("Delete this skill? It will be removed from the Skills page.")) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`http://localhost:5000/api/skill/${id}`, {
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          alert("✅ Skill deleted!");
          fetchDashboardData();
        } else {
          alert(`❌ Delete failed. Status: ${res.status}`);
        }
      } catch (err) {
        alert("❌ Server offline ya network error.");
        console.error(err);
      }
    }
  };

  // 🔥 EXPERIENCE LOGIC 🔥
  const handleAddExp = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newExp)
      });
      if(res.ok) {
        setNewExp({ duration: '', role: '', company: '', description: '' });
        fetchDashboardData();
        alert("Experience Added to Timeline!");
      } else {
        alert("Failed to add experience");
      }
    } catch(err) { alert("Failed to add experience"); }
  };

  const deleteExp = async (id) => {
    if(window.confirm("Delete this experience record from Timeline?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/experience/${id}`, {
          method: 'DELETE', headers: { "Authorization": `Bearer ${token}` }
        });
        fetchDashboardData();
      } catch(err) { alert("Failed to delete experience"); }
    }
  };

  // --- CLIENT PROJECTS LOGIC --- 
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/client-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newProject)
      });
      if(res.ok) {
        setNewProject({ clientName: '', clientEmail: '', projectTitle: '', trackingId: '', progress: 10, status: 'Started', paymentStatus: 'Pending', deliveryDate: '', notes: '' });
        fetchDashboardData();
        alert("Project Updated Successfully!");
      }
    } catch(err) { alert("Failed to save project"); }
  };

  const deleteProject = async (id) => {
    if(window.confirm("Delete this client project tracking?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/client-projects/${id}`, { 
          method: 'DELETE', headers: { "Authorization": `Bearer ${token}` }
        });
        fetchDashboardData();
      } catch(err) { alert("Failed to delete project"); }
    }
  };

  const sendMessageToClient = async (projectId) => {
    const msg = window.prompt("Type your message to the client (This will be emailed to them and shown on their portal):");
    if(msg) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`http://localhost:5000/api/client-projects/${projectId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ message: msg })
        });
        if(res.ok) {
          alert("✅ Message sent and emailed to client!");
          fetchDashboardData();
        } else {
          alert("Failed to send message.");
        }
      } catch(err) { alert("Server error."); }
    }
  };

  const verifyAndSendKey = async (projectId) => {
    if(window.confirm("Are you sure? This will generate a secure access key and email it to the client immediately.")) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`http://localhost:5000/api/admin/verify-client-payment/${projectId}`, {
          method: "POST", headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          alert("✅ Payment Verified & Key Emailed Successfully!");
          fetchDashboardData(); 
        } else { alert("Error: " + data.message); }
      } catch (err) { alert("Server error during verification."); }
    }
  };

  const verifyPaymentFromInbox = async (msgId) => {
    const customStatus = window.prompt("Enter exact payment received (e.g., 'Advance ₹5000' or 'Fully Paid'):", "Fully Paid");
    if (customStatus === null) return; 

    if(window.confirm(`Auto-create project with payment status: "${customStatus}"?`)) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`http://localhost:5000/api/admin/approve-payment-message/${msgId}`, {
          method: "POST", 
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ paymentStatus: customStatus })
        });
        const data = await res.json();
        if (data.success) {
          alert("✅ Success: " + data.message);
          fetchDashboardData(); 
        } else { alert("Error: " + data.message); }
      } catch (err) { alert("Server error during verification."); }
    }
  };

  const rejectPaymentFromInbox = async (msgId) => {
    const reason = window.prompt("Enter reason for rejection (This will be emailed to the client):", "Screenshot is unclear or Transaction ID does not match our bank records.");
    if (reason === null) return; 

    if(window.confirm("Are you sure? This will delete the request and email the client that verification failed.")) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`http://localhost:5000/api/admin/reject-payment-message/${msgId}`, {
          method: "POST", 
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ reason: reason }) 
        });
        const data = await res.json();
        if (data.success) {
          alert("✅ " + data.message);
          fetchDashboardData(); 
        } else { alert("Error: " + data.message); }
      } catch (err) { alert("Server error during rejection."); }
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newTeamMember)
      });
      const data = await res.json();
      if(data.success) {
        alert("✅ " + data.message);
        setNewTeamMember({ name: '', identifier: '', permissions: [] });
        fetchDashboardData();
      } else { alert("Error: " + data.message); }
    } catch(err) { alert("Server Error"); }
  };

  const deleteTeamMember = async (id) => {
    if(window.confirm("Remove this member from the team? They will lose dashboard access immediately.")) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`http://localhost:5000/api/admin/team/${id}`, { 
          method: 'DELETE', headers: { "Authorization": `Bearer ${token}` }
        });
        fetchDashboardData();
      } catch(err) { alert("Server Error"); }
    }
  };

  const togglePermission = (perm) => {
    setNewTeamMember(prev => {
      const has = prev.permissions.includes(perm);
      if (has) return { ...prev, permissions: prev.permissions.filter(p => p !== perm) };
      return { ...prev, permissions: [...prev.permissions, perm] };
    });
  };

  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    setSecurityMsg("Updating...");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/admin/update-security", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(securityData)
      });
      const data = await res.json();
      if (data.success) {
        setSecurityMsg("✅ " + data.message);
        setSecurityData({ oldPassword: '', newPassword: '', newPin: '' });
      } else {
        setSecurityMsg("❌ Error: " + data.message);
      }
    } catch (err) {
      setSecurityMsg("❌ Server Error.");
    }
  };

  // ==================== SECURE LOGIN FLOW ====================
  const handleStep1Login = async (e) => {
    e.preventDefault();
    setLoginError("Verifying...");
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (data.success) {
        setAuthStep(1); 
        setLoginError('');
      } else {
        setLoginError(data.message || "Invalid Credentials");
      }
    } catch (err) { setLoginError("Server offline!"); }
  };

  const handleStep2FA = async (e) => {
    e.preventDefault();
    setLoginError("Checking PIN...");
    try {
      const res = await fetch("http://localhost:5000/api/admin/verify-2fa", {
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ identifier: loginData.identifier, pin: backupPin })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminRole", data.role);
        localStorage.setItem("adminPerms", JSON.stringify(data.permissions || []));
        localStorage.setItem("adminName", data.name);
        
        setAdminRole(data.role);
        setAdminPerms(data.permissions || []);
        setAdminName(data.name);

        setAuthStep(2); 
        setLoginError('');
      } else {
        setLoginError(data.message);
      }
    } catch (err) { setLoginError("Server offline!"); }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoginError("Sending OTP...");
    try {
      const res = await fetch("http://localhost:5000/api/admin/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: resetIdentifier })
      });
      const data = await res.json();
      if (data.success) {
        setAuthStep(4); 
        setLoginError('');
        if(data.devOtp) alert(`TESTING OTP: ${data.devOtp}`); 
      } else {
        setLoginError(data.message);
      }
    } catch (err) { setLoginError("Server offline!"); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoginError("Resetting Password...");
    try {
      const res = await fetch("http://localhost:5000/api/admin/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ identifier: resetIdentifier, otp: resetOtp, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setAuthStep(0); 
        setLoginError('');
      } else {
        setLoginError(data.message);
      }
    } catch (err) { setLoginError("Server offline!"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthStep(0); 
    setLoginData({ identifier: '', password: '' }); 
    setBackupPin('');
  };

  // Data Filtering safely
  const contactMessages = (inboxData || []).filter(msg => msg?.type === 'contact' || !msg?.type);
  const paymentMessages = (inboxData || []).filter(msg => msg?.type === 'payment');

  // ==================== RENDER: AUTH SCREENS ====================
  if (authStep !== 2) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '0 5vw', background: 'var(--bg-main)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.4 }}>
          <Canvas><ambientLight intensity={1} /><Float speed={2}><Sphere args={[2, 64, 64]}><MeshDistortMaterial color="var(--accent)" distort={0.5} speed={2} wireframe /></Sphere></Float></Canvas>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '20px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px', textAlign: 'center', zIndex: 10, boxShadow: '0 20px 50px var(--accent-glow)' }}>
          
          {authStep === 0 && (
            <>
              <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Secure Access</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '14px' }}>Admin & Team Portal</p>
              <form onSubmit={handleStep1Login} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Email Identifier" required onChange={(e) => setLoginData({...loginData, identifier: e.target.value})} style={inputStyle} />
                <input type="password" placeholder="Password" required onChange={(e) => setLoginData({...loginData, password: e.target.value})} style={inputStyle} />
                <button type="submit" style={btnStyle}>Next ➔</button>
                <span onClick={() => setAuthStep(3)} style={{ color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', marginTop: '5px' }}>Forgot Password?</span>
              </form>
            </>
          )}

          {authStep === 1 && (
            <>
              <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>2-Step Verification</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '14px' }}>Enter your security PIN.</p>
              <form onSubmit={handleStep2FA} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="password" placeholder="4-Digit PIN" maxLength="4" required onChange={(e) => setBackupPin(e.target.value)} style={{...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '10px'}} />
                <button type="submit" style={btnStyle}>Unlock Dashboard 🔓</button>
                <span onClick={() => setAuthStep(0)} style={{ color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}>← Back to Login</span>
              </form>
            </>
          )}

          {authStep === 3 && (
            <>
              <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Reset Password</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '14px' }}>Enter your registered Email.</p>
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Registered Email" required onChange={(e) => setResetIdentifier(e.target.value)} style={inputStyle} />
                <button type="submit" style={{...btnStyle, background: '#ffbd2e', color: '#000'}}>Send OTP</button>
                <span onClick={() => setAuthStep(0)} style={{ color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}>← Back to Login</span>
              </form>
            </>
          )}

          {authStep === 4 && (
            <>
              <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Verify OTP</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '14px' }}>OTP sent to {resetIdentifier}</p>
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Enter 6-Digit OTP" maxLength="6" required onChange={(e) => setResetOtp(e.target.value)} style={{...inputStyle, textAlign: 'center', letterSpacing: '5px', fontWeight: 'bold'}} />
                <input type="password" placeholder="Enter New Password" required onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
                <button type="submit" style={{...btnStyle, background: '#00f5a0', color: '#000'}}>Save & Login</button>
                <span onClick={() => setAuthStep(3)} style={{ color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}>← Resend OTP</span>
              </form>
            </>
          )}

          {loginError && <p style={{ color: '#ff4d4d', fontSize: '14px', marginTop: '15px' }}>{loginError}</p>}
        </motion.div>
      </div>
    );
  }

  // ==================== RENDER: MAIN DASHBOARD ====================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── SIDEBAR (WITH RBAC HIDING LOGIC) ── */}
      <div style={{ width: '250px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'var(--accent)', fontSize: '20px', margin: '0 0 10px 0', fontFamily: 'monospace' }}>Shivam<span style={{color:'var(--text-main)'}}>.Admin</span></h2>
        <div style={{ padding: '8px', background: 'var(--bg-main)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '30px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
          Log in as: <strong style={{color: adminRole === 'superadmin' ? '#ff4d6d' : '#00e5ff'}}>{adminName} ({adminRole?.toUpperCase()})</strong>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1, overflowY: 'auto' }}>
          <SidebarBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>📊 Overview</SidebarBtn>
          
          {hasPerm('messages') && <SidebarBtn active={activeTab === 'messages'} onClick={() => setActiveTab('messages')}>✉️ Messages</SidebarBtn>}
          {hasPerm('payments') && <SidebarBtn active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>💸 Payments</SidebarBtn>}
          {hasPerm('projects') && <SidebarBtn active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>📂 Client Projects</SidebarBtn>}
          {hasPerm('services') && <SidebarBtn active={activeTab === 'services'} onClick={() => setActiveTab('services')}>🚀 Services</SidebarBtn>}
          
          {hasPerm('skills') && (
            <>
              <SidebarBtn active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>💻 Skills</SidebarBtn>
              <SidebarBtn active={activeTab === 'experience'} onClick={() => setActiveTab('experience')}>⏳ Timeline</SidebarBtn>
              <SidebarBtn active={activeTab === 'education'} onClick={() => setActiveTab('education')}>🎓 Education</SidebarBtn>
            </>
          )}

          {hasPerm('reviews') && <SidebarBtn active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>⭐ Reviews</SidebarBtn>}
          {hasPerm('cms') && (
            <>
              <SidebarBtn active={activeTab === 'cms'} onClick={() => setActiveTab('cms')}>⚙️ Website Content</SidebarBtn>
              <SidebarBtn active={activeTab === 'github'} onClick={() => setActiveTab('github')} style={{color: activeTab === 'github' ? '#00f5a0' : 'var(--text-dim)'}}>🐙 GitHub Projects</SidebarBtn>
            </>
          )}
          
          <SidebarBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} style={{borderLeft: '4px solid #00f5a0'}}>🔒 Security</SidebarBtn>
          {adminRole === 'superadmin' && (
            <SidebarBtn active={activeTab === 'team'} onClick={() => setActiveTab('team')} style={{borderLeft: '4px solid #ff4d6d'}}>👥 Team Access</SidebarBtn>
          )}
        </div>

        <button onClick={handleLogout} style={{ marginTop: '10px', padding: '12px', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ flex: 1, padding: '40px 5vw', overflowY: 'auto' }}>
        
        {/* DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '30px' }}>Dashboard Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {(hasPerm('messages') || hasPerm('payments')) && <StatCard title="Unread Messages" value={contactMessages?.length || 0} color="#00e5ff" />}
              {hasPerm('payments') && <StatCard title="Payment Verifications" value={paymentMessages?.length || 0} color="#ffb84d" />}
              {hasPerm('projects') && <StatCard title="Active Projects" value={clientProjects?.length || 0} color="#9b59b6" />}
              {hasPerm('services') && <StatCard title="Active Services" value={services?.length || 0} color="#ff4d6d" />}
              {hasPerm('skills') && <StatCard title="Total Skills" value={skills?.length || 0} color="#00f5a0" />}
            </div>
          </motion.div>
        )}

        {/* MESSAGES */}
        {activeTab === 'messages' && hasPerm('messages') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '30px' }}>Contact Form Inbox</h1>
            {contactMessages?.length === 0 ? (
              <p style={{ color: 'var(--text-dim)' }}>No new contact messages.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {contactMessages?.map((msg, idx) => {
                  if(!msg) return null;
                  return (
                  <div key={msg._id || idx} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--accent)' }}>{msg.name}</h3>
                    <p style={{ margin: '0 0 15px 0', color: 'var(--text-dim)', fontSize: '13px' }}>Email: {msg.email} | Phone: {msg.phone || 'N/A'}</p>
                    <p style={{ margin: 0 }}>"{msg.message}"</p>
                    <button onClick={() => deleteInboxItem(msg._id)} style={deleteBtnStyle}>Delete</button>
                  </div>
                )})}
              </div>
            )}
          </motion.div>
        )}

        {/* PAYMENTS */}
        {activeTab === 'payments' && hasPerm('payments') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '30px' }}>Payment Verifications</h1>
            {paymentMessages?.length === 0 ? (
              <p style={{ color: 'var(--text-dim)' }}>No pending payment verifications.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {paymentMessages?.map((msg, idx) => {
                  if(!msg) return null;
                  return (
                  <div key={msg._id || idx} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', borderLeft: '4px solid #ffb84d', position: 'relative' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#ffb84d' }}>{msg.name}</h3>
                    <p style={{ margin: '0 0 10px 0', color: 'var(--text-dim)', fontSize: '13px' }}>Email: {msg.email}</p>
                    <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '6px', display: 'inline-block', border: '1px dashed var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Transaction ID: </strong> 
                      <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{msg.transaction_id}</span>
                    </div>
                    
                    {msg.attachment && (
                      <div style={{ marginTop: '15px' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-dim)' }}>Screenshot Attached:</p>
                        <img 
                          src={msg.attachment} 
                          alt="Payment Proof" 
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'contain', backgroundColor: 'var(--bg-main)' }} 
                        />
                      </div>
                    )}
                    
                    <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                      <button onClick={() => verifyPaymentFromInbox(msg._id)} style={{ padding: '10px 20px', background: '#00f5a0', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ✅ Verify & Send Access Key
                      </button>
                      <button onClick={() => rejectPaymentFromInbox(msg._id)} style={{ padding: '10px 20px', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ❌ Reject & Email Client
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </motion.div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && hasPerm('reviews') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '30px' }}>Manage Reviews</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {reviews?.map((review, idx) => {
                if(!review) return null;
                return (
                <div key={review._id || idx} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: 'var(--accent)' }}>{review.name} <span style={{fontSize:'14px', color:'var(--text-dim)'}}>({"⭐".repeat(review.rating || 5)})</span></h3>
                      <p style={{ margin: 0, color: 'var(--text-dim)' }}>"{review.text}"</p>
                      {review.adminReply && (
                        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0, 229, 255, 0.05)', borderLeft: '2px solid var(--accent)', borderRadius: '0 8px 8px 0' }}>
                          <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>Your Reply:</span>
                          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-main)' }}>{review.adminReply}</p>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '250px' }}>
                      <button onClick={() => togglePinReview(review._id)} style={{ padding: '8px 12px', background: review.isPinned ? 'var(--accent)' : 'transparent', color: review.isPinned ? '#000' : 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        {review.isPinned ? '📌 Pinned' : 'Pin'}
                      </button>
                      <button onClick={() => editReviewText(review._id, review.text)} style={{ padding: '8px 12px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit</button>
                      <button onClick={() => replyToReview(review._id, review.adminReply)} style={{ padding: '8px 12px', background: 'transparent', color: '#00e5ff', border: '1px solid #00e5ff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>💬 Reply</button>
                      <button onClick={() => deleteReview(review._id)} style={{ padding: '8px 12px', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </motion.div>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && hasPerm('services') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Manage Services</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Add or edit services. Changes will auto-sync to the Services & Payment pages.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{ flex: '1', minWidth: '300px', ...cmsCardStyle }}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 20px 0' }}>
                  {newService._id ? '✏️ Edit Service' : '➕ Add New Service'}
                </h3>
                <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div><label style={labelStyle}>Service Title</label><input type="text" required value={newService?.title || ''} onChange={e => setNewService({...newService, title: e.target.value})} placeholder="e.g. AI/ML Integration" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Icon (Emoji)</label><input type="text" required value={newService?.icon || ''} onChange={e => setNewService({...newService, icon: e.target.value})} placeholder="💻" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Price Description</label><input type="text" required value={newService?.price || ''} onChange={e => setNewService({...newService, price: e.target.value})} placeholder="e.g. Starting from $100" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Short Description</label><textarea rows="3" required value={newService?.description || ''} onChange={e => setNewService({...newService, description: e.target.value})} placeholder="Describe..." style={{...inputStyle, resize: 'none'}}></textarea></div>
                  
                  <button type="submit" style={btnStyle}>{newService._id ? 'Update Service' : 'Publish Service'}</button>
                  {newService._id && (
                    <button type="button" onClick={() => setNewService({ title: '', description: '', icon: '🔧', price: '' })} style={{...btnStyle, background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', marginTop: '5px'}}>
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Live Services ({services?.length || 0})</h3>
                {services?.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No services added yet.</p> : null}
                {services?.map((srv, idx) => {
                  if(!srv) return null;
                  return (
                  <div key={srv._id || idx} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{srv.icon}</span><h3 style={{ margin: 0, color: 'var(--text-main)' }}>{srv.title}</h3>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: '0 0 10px 0' }}>{srv.description}</p>
                    <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 'bold', fontSize: '14px' }}>{srv.price}</p>
                    
                    {/* EDIT & DELETE BUTTONS */}
                    <button onClick={() => setNewService(srv)} style={{ ...deleteBtnStyle, right: '85px', color: '#00e5ff', borderColor: '#00e5ff' }}>Edit</button>
                    <button onClick={() => deleteService(srv._id)} style={deleteBtnStyle}>Delete</button>
                  </div>
                )})}
              </div>
            </div>
          </motion.div>
        )}
        {/* 🔥 FIX: BULLETPROOF SKILLS TAB 🔥 */}
        {activeTab === 'skills' && hasPerm('skills') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Manage Skills</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Add or modify skills. Changes will auto-sync to the Skills page.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{ flex: '1', minWidth: '300px', ...cmsCardStyle }}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 20px 0' }}>
                  {newSkill._id ? '✏️ Edit Skill' : '➕ Add New Skill'}
                </h3>
                <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div><label style={labelStyle}>Skill Name</label><input type="text" required value={newSkill?.name || ''} onChange={e => setNewSkill({...newSkill, name: e.target.value})} placeholder="e.g. React.js" style={inputStyle} /></div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1 }}><label style={labelStyle}>Icon (Emoji)</label><input type="text" required value={newSkill?.icon || ''} onChange={e => setNewSkill({...newSkill, icon: e.target.value})} placeholder="⚛️" style={inputStyle} /></div>
                      <div style={{ flex: 1 }}><label style={labelStyle}>Proficiency (%)</label><input type="number" required min="1" max="100" value={newSkill?.proficiency || 50} onChange={e => setNewSkill({...newSkill, proficiency: e.target.value})} placeholder="80" style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>Category</label><input type="text" required value={newSkill?.category || ''} onChange={e => setNewSkill({...newSkill, category: e.target.value})} placeholder="e.g. Frontend" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Description</label><textarea rows="3" required value={newSkill?.description || ''} onChange={e => setNewSkill({...newSkill, description: e.target.value})} placeholder="Describe..." style={{...inputStyle, resize: 'none'}}></textarea></div>
                  
                  <button type="submit" style={btnStyle}>{newSkill._id ? 'Update Skill' : 'Publish Skill'}</button>
                  {newSkill._id && (
                    <button type="button" onClick={() => setNewSkill({ name: '', description: '', icon: '💻', proficiency: 50, category: 'Tech' })} style={{...btnStyle, background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', marginTop: '5px'}}>
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Live Skills ({skills?.length || 0})</h3>
                {skills?.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No skills added yet.</p> : null}
                {skills?.map((skill, idx) => {
                  if(!skill) return null; 
                  return (
                  <div key={skill._id || idx} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{skill.icon || '💻'}</span>
                      <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{skill.name || 'Unknown Skill'} <span style={{ color: 'var(--text-dim)', fontSize: '14px', fontWeight: 'normal' }}>({skill.proficiency || 0}%)</span></h3>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: '0 0 10px 0' }}>{skill.description || 'No description'}</p>
                    <span style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{skill.category || 'Tech'}</span>
                    
                    {/* EDIT & DELETE BUTTONS */}
                    <button onClick={() => setNewSkill(skill)} style={{ ...deleteBtnStyle, right: '85px', color: '#00e5ff', borderColor: '#00e5ff', opacity: skill._id ? 1 : 0.4 }} disabled={!skill._id}>Edit</button>
                    <button onClick={() => deleteSkill(skill._id)} disabled={!skill._id} style={{ ...deleteBtnStyle, opacity: skill._id ? 1 : 0.4 }}>Delete</button>
                  </div>
                )})}
              </div>
            </div>
          </motion.div>
        )}

        {/* EDUCATION MANAGEMENT */}
        {activeTab === 'education' && hasPerm('skills') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Manage Education</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Add or remove education details. Syncs to the Resume page.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{ flex: '1', minWidth: '300px', ...cmsCardStyle }}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 20px 0' }}>➕ Add Education</h3>
                <form onSubmit={handleAddEdu} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div><label style={labelStyle}>Degree / Course</label><input type="text" required value={newEdu?.degree || ''} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} placeholder="e.g. 12th @ High School" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Institution</label><input type="text" required value={newEdu?.institution || ''} onChange={e => setNewEdu({...newEdu, institution: e.target.value})} placeholder="e.g. AGMV College" style={inputStyle} /></div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1 }}><label style={labelStyle}>Duration</label><input type="text" required value={newEdu?.duration || ''} onChange={e => setNewEdu({...newEdu, duration: e.target.value})} placeholder="e.g. 2022-2025" style={inputStyle} /></div>
                      <div style={{ flex: 1 }}><label style={labelStyle}>Score (%)</label><input type="text" value={newEdu?.score || ''} onChange={e => setNewEdu({...newEdu, score: e.target.value})} placeholder="e.g. 79.2%" style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>Description (Optional)</label><textarea rows="3" value={newEdu?.description || ''} onChange={e => setNewEdu({...newEdu, description: e.target.value})} placeholder="Any additional details..." style={{...inputStyle, resize: 'none'}}></textarea></div>
                  <button type="submit" style={btnStyle}>Publish Education</button>
                </form>
              </div>

              <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Live Education ({education?.length || 0})</h3>
                {education?.map((edu, idx) => {
                  if(!edu) return null;
                  return (
                  <div key={edu._id || idx} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{edu.degree || 'Unknown'}</h3>
                      <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{edu.duration}</span>
                    </div>
                    <p style={{ color: 'var(--accent)', fontSize: '14px', margin: '0 0 5px 0' }}>{edu.institution}</p>
                    {edu.score && <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: '0 0 10px 0' }}>Score: {edu.score}</p>}
                    <button onClick={() => deleteEdu(edu._id)} style={deleteBtnStyle}>Delete</button>
                  </div>
                )})}
              </div>
            </div>
          </motion.div>
        )}

        {/* EXPERIENCE TIMELINE MANAGEMENT */}
        {activeTab === 'experience' && hasPerm('skills') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Manage Timeline & Experience</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Add milestones, work experience, and educational background here.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{ flex: '1', minWidth: '300px', ...cmsCardStyle }}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 20px 0' }}>➕ Add Experience</h3>
                <form onSubmit={handleAddExp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div><label style={labelStyle}>Time/Duration</label><input type="text" required value={newExp?.duration || ''} onChange={e => setNewExp({...newExp, duration: e.target.value})} placeholder="e.g. 2022 - Present" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Role/Title</label><input type="text" required value={newExp?.role || ''} onChange={e => setNewExp({...newExp, role: e.target.value})} placeholder="e.g. Full Stack Developer" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Company/Client</label><input type="text" required value={newExp?.company || ''} onChange={e => setNewExp({...newExp, company: e.target.value})} placeholder="e.g. TechCorp or Freelance" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Description</label><textarea rows="4" required value={newExp?.description || ''} onChange={e => setNewExp({...newExp, description: e.target.value})} placeholder="What did you do?" style={{...inputStyle, resize: 'none'}}></textarea></div>
                  <button type="submit" style={btnStyle}>Add to Timeline</button>
                </form>
              </div>

              <div style={{ flex: '1.5', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Live Timeline Records ({experiences?.length || 0})</h3>
                {experiences?.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No experience added yet.</p> : null}
                {experiences?.map((exp, idx) => {
                  if(!exp) return null;
                  return (
                  <div key={exp._id || idx} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <div style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent)', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
                      {exp.duration}
                    </div>
                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{exp.role}</h3>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-dim)', fontSize: '14px', fontWeight: 'normal' }}>@ {exp.company}</h4>
                    <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                    <button onClick={() => deleteExp(exp._id)} style={deleteBtnStyle}>Delete</button>
                  </div>
                )})}
              </div>
            </div>
          </motion.div>
        )}

        {/* CLIENT PROJECTS TRACKING */}
        {activeTab === 'projects' && hasPerm('projects') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Client Project Tracking</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Create or update projects. Send direct messages to clients from here.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{ flex: '1', minWidth: '320px', ...cmsCardStyle }}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 20px 0' }}>➕ Add / Update Client Project</h3>
                <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input type="text" required value={newProject?.clientName || ''} onChange={e => setNewProject({...newProject, clientName: e.target.value})} placeholder="Client Name" style={inputStyle} />
                  <input type="email" required value={newProject?.clientEmail || ''} onChange={e => setNewProject({...newProject, clientEmail: e.target.value})} placeholder="Client Email (For Login)" style={inputStyle} disabled={newProject._id ? true : false} />
                  <input type="text" required value={newProject?.projectTitle || ''} onChange={e => setNewProject({...newProject, projectTitle: e.target.value})} placeholder="Project Title" style={inputStyle} />
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Progress (%)</label>
                      <input type="number" min="0" max="100" value={newProject?.progress || 0} onChange={e => setNewProject({...newProject, progress: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Current Phase</label>
                      <input type="text" value={newProject?.status || ''} onChange={e => setNewProject({...newProject, status: e.target.value})} placeholder="e.g. UI Design" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Payment Status</label>
                      <input type="text" value={newProject?.paymentStatus || ''} onChange={e => setNewProject({...newProject, paymentStatus: e.target.value})} placeholder="e.g. 50% Advance Paid" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Expected Delivery</label>
                      <input type="text" value={newProject?.deliveryDate || ''} onChange={e => setNewProject({...newProject, deliveryDate: e.target.value})} placeholder="e.g. 25 Oct 2024" style={inputStyle} />
                    </div>
                  </div>

                  <button type="submit" style={btnStyle}>Save Project to Tracker</button>
                </form>
              </div>

              <div style={{ flex: '1.5', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Active Projects ({clientProjects?.length || 0})</h3>
                {clientProjects?.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No projects tracked yet.</p> : null}
                
                {clientProjects?.map((proj, idx) => {
                  if(!proj) return null;
                  return (
                  <div key={proj._id || idx} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--accent)' }}>{proj.projectTitle}</h3>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-dim)' }}>Client: {proj.clientName} | Email: {proj.clientEmail}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-main)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px' }}>Progress: <strong style={{ color: 'var(--text-main)' }}>{proj.progress}%</strong></span>
                      <span style={{ fontSize: '13px' }}>Phase: <strong style={{ color: 'var(--text-main)' }}>{proj.status}</strong></span>
                      <span style={{ fontSize: '13px' }}>Pay: <strong style={{ color: proj.paymentStatus === 'Pending' ? '#ffbd2e' : '#00f5a0' }}>{proj.paymentStatus}</strong></span>
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      <button onClick={() => sendMessageToClient(proj._id)} style={{ padding: '8px 15px', background: '#3399cc', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        💬 Email & Message Client
                      </button>
                      <button onClick={() => setNewProject(proj)} style={{ padding: '8px 15px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit Tracker</button>
                      <button onClick={() => deleteProject(proj._id)} style={{ padding: '8px 15px', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Delete</button>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </motion.div>
        )}

        {/* WEBSITE CONTENT (CMS EXPANDED) */}
        {activeTab === 'cms' && hasPerm('cms') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Global Website Editor</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Change text, contact details, and policies across your website in one click.</p>
            
            {cmsStatus && <div style={{ padding: '15px', background: 'rgba(0,229,255,0.1)', color: 'var(--accent)', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--accent)' }}>{cmsStatus}</div>}

            <form onSubmit={saveContent} style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '800px' }}>
              
              <div style={cmsCardStyle}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 15px 0' }}>🏠 Home & About Info</h3>
                <label style={labelStyle}>Hero Title</label>
                <input type="text" value={homeData?.heroTitle || ''} onChange={e => setHomeData({...homeData, heroTitle: e.target.value})} style={inputStyle} />
                <label style={labelStyle}>Hero Subtitle</label>
                <input type="text" value={homeData?.heroSubtitle || ''} onChange={e => setHomeData({...homeData, heroSubtitle: e.target.value})} style={inputStyle} />
                <label style={labelStyle}>About Main Description</label>
                <textarea rows="4" value={aboutData?.description || ''} onChange={e => setAboutData({...aboutData, description: e.target.value})} style={{...inputStyle, resize: 'none'}}></textarea>
              </div>

              <div style={cmsCardStyle}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 15px 0' }}>📞 Contact Details & Links</h3>
                {contactData.map((link, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="text" value={link.icon || ''} onChange={e => { const newLinks=[...contactData]; newLinks[idx].icon=e.target.value; setContactData(newLinks); }} placeholder="Emoji" style={{...inputStyle, flex: 0.5, marginBottom: 0}} />
                    <input type="text" value={link.title || ''} onChange={e => { const newLinks=[...contactData]; newLinks[idx].title=e.target.value; setContactData(newLinks); }} placeholder="Link Title" style={{...inputStyle, flex: 1, marginBottom: 0}} />
                    <input type="text" value={link.url || ''} onChange={e => { const newLinks=[...contactData]; newLinks[idx].url=e.target.value; setContactData(newLinks); }} placeholder="URL" style={{...inputStyle, flex: 2, marginBottom: 0}} />
                    <button type="button" onClick={() => { const newLinks=[...contactData]; newLinks.splice(idx,1); setContactData(newLinks); }} style={{...btnStyle, width: 'auto', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '0 10px'}}>X</button>
                  </div>
                ))}
                <button type="button" onClick={() => setContactData([...contactData, { title: '', url: '', icon: '🔗' }])} style={{...btnStyle, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', marginTop: '10px'}}>+ Add Link</button>
              </div>

              <div style={cmsCardStyle}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 15px 0' }}>⚖️ Legal Policies</h3>
                <label style={labelStyle}>Privacy Policy Text</label>
                <textarea rows="5" value={policyData?.privacy || ''} onChange={e => setPolicyData({...policyData, privacy: e.target.value})} placeholder="Enter full privacy policy..." style={{...inputStyle, resize: 'vertical'}}></textarea>
                
                <label style={labelStyle}>Terms & Conditions</label>
                <textarea rows="5" value={policyData?.terms || ''} onChange={e => setPolicyData({...policyData, terms: e.target.value})} placeholder="Enter full terms and conditions..." style={{...inputStyle, resize: 'vertical'}}></textarea>
                
                <label style={labelStyle}>Refund Policy</label>
                <textarea rows="5" value={policyData?.refund || ''} onChange={e => setPolicyData({...policyData, refund: e.target.value})} placeholder="Enter full refund policy..." style={{...inputStyle, resize: 'vertical'}}></textarea>
              </div>

              <button type="submit" style={{ ...btnStyle, padding: '15px', fontSize: '16px' }}>Apply Changes to Website 🚀</button>
            </form>
          </motion.div>
        )}

        {/* 🔥 NEW: GITHUB PROJECTS MANAGEMENT 🔥 */}
        {activeTab === 'github' && hasPerm('cms') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Manage GitHub Projects</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Select which GitHub repositories should be displayed on your Home and Resume pages.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {githubProjects.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>Loading GitHub projects...</p> : null}
              {githubProjects.map(repo => {
                const isPinned = pinnedProjects.some(p => p.repoId === repo.id.toString());
                return (
                  <div key={repo.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: isPinned ? '1px solid #00f5a0' : '1px solid var(--border-color)', position: 'relative' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', textTransform: 'capitalize' }}>{repo.name.replace(/-/g, ' ')}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '20px', minHeight: '40px' }}>{repo.description || "No description available."}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <a href={repo.html_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none' }}>View Repo ↗</a>
                      
                      <button 
                        onClick={() => toggleGitHubPin(repo)}
                        style={{ 
                          padding: '8px 15px', 
                          background: isPinned ? 'rgba(0, 245, 160, 0.1)' : 'transparent', 
                          color: isPinned ? '#00f5a0' : 'var(--text-dim)', 
                          border: isPinned ? '1px solid #00f5a0' : '1px solid var(--border-color)', 
                          borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                          transition: 'all 0.3s'
                        }}
                      >
                        {isPinned ? '✅ Shown on Website' : '❌ Hidden'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 🔥 SECURITY SETTINGS 🔥 */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Security Settings</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Update your own dashboard login password and 2FA PIN.</p>

            <div style={{ maxWidth: '500px', ...cmsCardStyle }}>
              <form onSubmit={handleUpdateSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="password" required placeholder="Current Password" value={securityData.oldPassword} onChange={e => setSecurityData({...securityData, oldPassword: e.target.value})} style={inputStyle} />
                <div style={{ borderTop: '1px solid var(--border-color)', margin: '10px 0' }}></div>
                <label style={labelStyle}>Set New Security Details</label>
                <input type="password" placeholder="New Password" value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="New 4-Digit PIN" maxLength="4" value={securityData.newPin} onChange={e => setSecurityData({...securityData, newPin: e.target.value})} style={inputStyle} />
                <button type="submit" style={{...btnStyle, background: '#00f5a0', color: '#000'}}>Update Security Credentials</button>
              </form>
              {securityMsg && <p style={{ color: securityMsg.includes('Error') ? '#ff4d4d' : '#00f5a0', marginTop: '15px', fontWeight: 'bold' }}>{securityMsg}</p>}
            </div>
          </motion.div>
        )}

        {/* 🔥 TEAM MANAGEMENT (SUPERADMIN ONLY) 🔥 */}
        {activeTab === 'team' && adminRole === 'superadmin' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>Team Role Management</h1>
            <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Add team members and assign specific permissions. They will receive an email with auto-generated credentials.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
              
              <div style={{ flex: '1', minWidth: '320px', ...cmsCardStyle }}>
                <h3 style={{ color: 'var(--accent)', margin: '0 0 20px 0' }}>➕ Add / Edit Team Member</h3>
                <form onSubmit={handleTeamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input type="text" required value={newTeamMember?.name || ''} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} placeholder="Member Name" style={inputStyle} />
                  <input type="email" required value={newTeamMember?.identifier || ''} onChange={e => setNewTeamMember({...newTeamMember, identifier: e.target.value})} placeholder="Email (Used for Login)" style={inputStyle} />
                  
                  <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <label style={{...labelStyle, marginBottom: '15px', color: 'var(--text-main)'}}>Assign Section Permissions:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {['messages', 'payments', 'projects', 'services', 'reviews', 'skills', 'cms'].map(perm => (
                        <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-dim)' }}>
                          <input 
                            type="checkbox" 
                            checked={newTeamMember?.permissions?.includes(perm) || false}
                            onChange={() => togglePermission(perm)}
                            style={{ cursor: 'pointer' }}
                          />
                          {perm.charAt(0).toUpperCase() + perm.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" style={{...btnStyle, background: '#ff4d6d'}}>Grant Access & Email Credentials</button>
                </form>
              </div>

              <div style={{ flex: '1.5', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Active Team Members ({teamList?.length || 0})</h3>
                {teamList?.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No team members added yet.</p> : null}
                
                {teamList?.map((member, idx) => {
                  if(!member) return null;
                  return (
                  <div key={member._id || idx} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--accent)' }}>{member.name}</h3>
                    <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: 'var(--text-dim)' }}>{member.identifier}</p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                      {member.permissions?.length === 0 ? <span style={{fontSize: '12px', color: '#ff4d4d'}}>No Permissions Assigned</span> : null}
                      {member.permissions?.map(p => (
                        <span key={p} style={{ background: 'rgba(255, 77, 109, 0.1)', color: '#ff4d6d', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          {p.toUpperCase()}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setNewTeamMember({ name: member.name, identifier: member.identifier, permissions: member.permissions })} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit Perms</button>
                      <button onClick={() => deleteTeamMember(member._id)} style={{ padding: '6px 12px', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🚫 Revoke Access</button>
                    </div>
                  </div>
                )})}
              </div>

            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

// ==================== HELPER COMPONENTS & STYLES ====================

const SidebarBtn = ({ children, active, onClick, style }) => (
  <button onClick={onClick} style={{ width: '100%', textAlign: 'left', padding: '15px', background: active ? 'var(--accent-glow)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-dim)', border: active ? '1px solid var(--accent)' : '1px solid transparent', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: active ? 'bold' : 'normal', fontSize: '15px', ...style }}>
    {children}
  </button>
);

const StatCard = ({ title, value, color }) => (
  <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', borderLeft: `4px solid ${color}` }}>
    <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-dim)', fontWeight: 'normal' }}>{title}</h4>
    <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '30px' }}>{value}</h2>
  </div>
);

const inputStyle = { padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: '15px' };
const labelStyle = { display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 'bold' };
const btnStyle = { padding: '12px', background: 'var(--accent)', color: 'var(--bg-main)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' };
const cmsCardStyle = { background: 'var(--bg-card)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)' };
const deleteBtnStyle = { position: 'absolute', top: '20px', right: '20px', padding: '6px 12px', background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };

export default Admin;