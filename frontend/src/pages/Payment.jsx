import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import RefundRules from './RefundRules';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; 

const Payment = () => {
  const location = useLocation(); 
  const navigate = useNavigate();
  
  // Portal Navigation State Extraction
  const portalData = location.state || {};
  const preSelectedService = portalData.preSelectedService || '';
  const isRemainingPayment = portalData.isRemainingPayment || false;

  // Agar remaining payment hai, toh seedha Step 2 dikhayenge
  const [step, setStep] = useState(isRemainingPayment ? 2 : 1);
  const [verifyStatus, setVerifyStatus] = useState("");
  const [servicesList, setServicesList] = useState([]); 
  
  // Feature 1: Slider State
  const [paymentPercent, setPaymentPercent] = useState(100);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState(''); 
  
  // Client Details State
  const [clientDetails, setClientDetails] = useState({
    name: portalData.clientName || '', 
    email: portalData.clientEmail || '', 
    phone: portalData.clientPhone || '', 
    service: portalData.service || preSelectedService || 'Full-Stack Web Development',
    projectId: portalData.projectId || null
  });

  // Ensure Pre-selected Service stays selected
  useEffect(() => {
    if (preSelectedService && !isRemainingPayment) {
      setClientDetails(prev => ({ ...prev, service: preSelectedService }));
    }
  }, [preSelectedService, isRemainingPayment]);

  // Auto-Fetch Services from Backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services");
        if (res.ok) {
          const data = await res.json();
          setServicesList(data);
          
          if (data && data.length > 0 && !preSelectedService && !isRemainingPayment) {
            setClientDetails(prev => ({ ...prev, service: data[0].title }));
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic services", err);
      }
    };
    fetchServices();
  }, [preSelectedService, isRemainingPayment]);

  // --- Mouse Proximity Glow Logic ---
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

  const inputStyle = {
    padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)',
    background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px',
    outline: 'none', fontFamily: 'Inter, monospace', width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.3s ease'
  };

  // ==========================================
  // SMART PAYMENT CALCULATIONS
  // ==========================================
  const selectedSrvForMath = servicesList.find(s => s.title === clientDetails.service);
  const baseTotal = selectedSrvForMath ? parseInt(selectedSrvForMath.price.replace(/\D/g, "") || "100", 10) : 100;
  
  // Custom logic for Portal Remaining Payment
  const totalAmount = isRemainingPayment ? portalData.remainingAmount : baseTotal;
  const amountToPay = isRemainingPayment ? totalAmount : Math.round((totalAmount * paymentPercent) / 100);
  const remainingAmount = isRemainingPayment ? 0 : (totalAmount - amountToPay);

  // ==========================================
  // 🛡️ STRICT VALIDATION & 🔥 LEAD CAPTURE (Step 1)
  // ==========================================
  const handleProceedToPay = (e) => {
    e.preventDefault();

    const clientName = clientDetails.name.trim();
    const clientEmail = clientDetails.email.trim();
    const clientPhone = clientDetails.phone.trim();

    if (!clientName || !clientEmail || !clientPhone) {
      alert("❌ Error: All fields in Step 1 are mandatory!");
      return;
    }
    if (!clientEmail.includes("@") || !clientEmail.includes(".")) {
      alert("❌ Error: Please enter a valid email address!");
      return;
    }
    if (clientPhone.length < 10) {
      alert("❌ Error: Please enter a valid 10-digit mobile number!");
      return;
    }

    try {
      fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          message: `🛒 Checkout Initiated for: ${clientDetails.service} (Payment Pending)`,
          type: 'contact'
        })
      });
    } catch (err) {
      console.log("Silent lead capture failed.");
    }

    setClientDetails({ ...clientDetails, name: clientName, email: clientEmail, phone: clientPhone });
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // 🔥 DATABASE SUBMIT LOGIC (Step 2 Manual Proof)
  // ==========================================
  const handleVerifySubmit = async (e) => {
    e.preventDefault(); 
    setVerifyStatus("Processing data... ⏳");
    
    const formElement = e.target;
    const formData = new FormData(formElement);
    const imageFile = formData.get('attachment');
    
    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = (error) => reject(error);
      });
    };

    let base64Image = "";
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 5 * 1024 * 1024) { 
        setVerifyStatus("❌ Image size must be less than 5MB.");
        return; 
      }
      try {
        base64Image = await convertToBase64(imageFile);
        setVerifyStatus("Sending to server... ⏳");
      } catch (err) {
        setVerifyStatus("❌ Error: Failed to read image file.");
        return;
      }
    }

    const dataForDB = {
      name: clientDetails.name,
      email: clientDetails.email,
      phone: clientDetails.phone,
      transaction_id: formData.get('transaction_id'),
      message: `Service: ${clientDetails.service} | Transaction ID: ${formData.get('transaction_id')}`,
      type: 'payment',
      attachment: base64Image,
      // Pass these securely to verify payment via manual check
      projectId: clientDetails.projectId,
      isRemainingPayment: isRemainingPayment,
      amountPaid: amountToPay
    };

    try {
      const dbRes = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataForDB)
      });

      if (dbRes.ok) {
        setVerifyStatus("✅ Payment Proof Submitted & Admin Notified!");
        formElement.reset(); 
        setTimeout(() => {
          if(isRemainingPayment) {
            navigate('/portal');
          } else {
            setStep(1); 
            setVerifyStatus("");
            const firstService = servicesList.length > 0 ? servicesList[0].title : 'Full-Stack Web Development';
            setClientDetails({name: '', email: '', phone: '', service: firstService});
          }
        }, 3000);
      } else {
        const errorText = await dbRes.text();
        setVerifyStatus(`❌ Server Rejected. Details: ${errorText}`);
      }
    } catch (dbErr) {
      console.error("DB Fetch Error:", dbErr);
      setVerifyStatus(`❌ Network Error: Backend is completely offline.`);
    }
  };

  // ==========================================
  // 🔥 AUTOMATED GATEWAYS LOGIC (RAZORPAY & PAYPAL)
  // ==========================================
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setPaymentStatusMessage("Initializing secure payment...");
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setPaymentStatusMessage("❌ Failed to load Razorpay. Check your internet connection or adblocker.");
      return;
    }
    
    const selectedSrv = servicesList.find(s => s.title === clientDetails.service);
    
    // 🛡️ Request body safely prepared with Smart Payment Amounts
    const requestBody = {
        amount: amountToPay,
        totalAmount: totalAmount,
        currency: "INR",
        serviceName: clientDetails.service,
        projectId: clientDetails.projectId,
        isRemainingPayment: isRemainingPayment
    };
    
    if (selectedSrv && selectedSrv._id && !isRemainingPayment) {
        requestBody.serviceId = selectedSrv._id;
    }

    try {
      const orderRes = await fetch("http://localhost:5000/api/payment/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody) 
      });
      const orderData = await orderRes.json();

      if (!orderData.success) { 
        setPaymentStatusMessage("");
        alert("Server error: " + (orderData.message || orderData.error)); 
        return; 
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        alert("❌ Frontend VITE_RAZORPAY_KEY_ID is missing in .env");
        setPaymentStatusMessage("Payment setup incomplete.");
        return;
      }

      const options = {
        key: razorpayKey, 
        amount: orderData.order.amount,
        currency: "INR",
        name: "Shivam Portfolio",
        description: isRemainingPayment ? `Remaining Balance: ${clientDetails.service}` : clientDetails.service,
        order_id: orderData.order.id, 
        handler: async function (response) {
          setPaymentStatusMessage("Verifying transaction securely on server...");
          try {
            const verifyRes = await fetch("http://localhost:5000/api/payment/gateway-success", {
              method: "POST", 
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: clientDetails.name, 
                email: clientDetails.email,
                serviceName: clientDetails.service, 
                transactionId: response.razorpay_payment_id,
                gateway: 'razorpay',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amountPaid: amountToPay,
                totalAmount: isRemainingPayment ? portalData.originalTotal : totalAmount,
                projectId: clientDetails.projectId,
                isRemainingPayment: isRemainingPayment
              })
            });
            const backendData = await verifyRes.json();
            
            if(backendData.success) {
              setPaymentStatusMessage("✅ Payment Verified!");
              if (isRemainingPayment) {
                alert("Remaining Dues Cleared! Project updated to 100% Paid.");
                navigate('/portal');
              } else {
                alert(`Payment Success! Your Portal Access Key is: ${backendData.accessKey}`);
                navigate('/portal');
              }
            } else {
              setPaymentStatusMessage(`❌ Verification failed: ${backendData.message}`);
            }
          } catch(verifyErr) {
            console.error("Verification Error:", verifyErr);
            setPaymentStatusMessage("❌ Failed to verify with server.");
          }
        },
        prefill: { name: clientDetails.name, email: clientDetails.email, contact: clientDetails.phone },
        theme: { color: "#3399cc" },
        config: {
          display: {
            blocks: {
              upi: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
              card: { name: "Pay via Card", instruments: [{ method: "card" }] }
            },
            sequence: ["block.upi", "block.card"],
            preferences: { show_default_blocks: true }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error("Payment Failed:", response.error);
        alert("Payment failed: " + response.error.description);
        setPaymentStatusMessage("");
      });

      rzp.open();
      
    } catch (err) {
      console.error("🔥 Frontend Razorpay Error:", err);
      setPaymentStatusMessage(`❌ Error: ${err.message}`);
    }
  };

  // ==========================================
  // RENDER JSX (HTML)
  // ==========================================
  return (
    <div style={{ 
      position: 'relative', minHeight: '100vh', padding: '120px 5vw 80px 5vw', 
      background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif',
      transition: 'background 0.3s ease, color 0.3s ease', overflowX: 'hidden'
    }}>
      
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: `radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)`, zIndex: 0, pointerEvents: 'none' }} />
      <motion.div style={{ position: 'fixed', width: '400px', height: '400px', borderRadius: '50%', background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`, pointerEvents: 'none', left: cursorGlowX, top: cursorGlowY, zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 5, maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(35px, 5vw, 50px)', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            Secure <span style={{ color: 'var(--accent)' }}>Checkout</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>
            {step === 1 ? "Step 1: Enter your project details" : "Step 2: Complete your payment"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          
          {/* ================= STEP 1: CLIENT DETAILS ================= */}
          {step === 1 && !isRemainingPayment && (
            <motion.div 
              key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              style={{ background: 'var(--bg-card)', padding: '40px 30px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: "0px 10px 30px rgba(0,0,0,0.1)" }}
            >
              <h2 style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '20px', marginBottom: '25px' }}>// Project Requirements</h2>
              
              <form onSubmit={handleProceedToPay} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>Full Name</label>
                    <input type="text" required style={inputStyle} value={clientDetails.name} onChange={e => setClientDetails({...clientDetails, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>Email Address</label>
                    <input type="email" required style={inputStyle} value={clientDetails.email} onChange={e => setClientDetails({...clientDetails, email: e.target.value})} placeholder="john@example.com" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>Mobile Number</label>
                    <input type="tel" required style={inputStyle} value={clientDetails.phone} onChange={e => setClientDetails({...clientDetails, phone: e.target.value})} placeholder="+91 xxxxxxxxxx" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>Type of Service</label>
                    <select required style={{...inputStyle, cursor: 'pointer'}} value={clientDetails.service} onChange={e => setClientDetails({...clientDetails, service: e.target.value})}>
                      {servicesList.length > 0 ? (
                        servicesList.map(srv => (
                          <option key={srv._id} value={srv.title}>{srv.title}</option>
                        ))
                      ) : (
                        <>
                          <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                          <option value="AI/ML Integration">AI/ML Integration</option>
                        </>
                      )}
                      {preSelectedService && !servicesList.some(s => s.title === preSelectedService) && (
                        <option value={preSelectedService}>{preSelectedService}</option>
                      )}
                      <option value="Other Custom Service">Other Custom Service</option>
                    </select>
                  </div>
                </div>

                <motion.button 
                  type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '15px', background: 'var(--accent)', color: 'var(--bg-main)', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
                >
                  Proceed to Payment ➔
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ================= STEP 2: PAYMENT & VERIFICATION ================= */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {!isRemainingPayment && (
                <button onClick={() => setStep(1)} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
                  ← Edit Details
                </button>
              )}

              <div style={{ background: 'var(--bg-card)', padding: '40px 30px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--text-main)', fontSize: '20px', marginBottom: '10px' }}>Payment for: <span style={{color:'var(--accent)'}}>{clientDetails.service}</span></h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Please complete your payment using one of the methods below.</p>
                
                {paymentStatusMessage && (
                    <div style={{ padding: '15px', background: 'rgba(0,229,255,0.1)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
                      {paymentStatusMessage}
                    </div>
                )}

                {/* --- SMART PAYMENT SLIDER OR REMAINING BALANCE UI --- */}
                {isRemainingPayment ? (
                  <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>Clear Pending Dues</h4>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>You are paying the remaining balance for this project.</p>
                    <div style={{ marginTop: '15px', padding: '15px', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
                      <p style={{ margin: '0', color: 'var(--text-main)', fontSize: '18px' }}>
                        <strong>Amount Due: <span style={{ color: 'var(--accent)' }}>${amountToPay}</span></strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)', marginBottom: '20px', textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--text-main)', margin: '0 0 15px 0' }}>Adjust Payment Amount</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Total Cost: ${totalAmount}</span>
                      <span style={{ color: 'var(--text-dim)' }}>Min: 40%</span>
                    </div>

                    <input 
                      type="range" 
                      min="40" 
                      max="100" 
                      step="1"
                      value={paymentPercent}
                      onChange={(e) => setPaymentPercent(Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                    
                    <div style={{ marginTop: '15px', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
                      <p style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '16px' }}>
                        <strong>Paying Now ({paymentPercent}%): <span style={{ color: 'var(--accent)' }}>${amountToPay}</span></strong>
                      </p>
                      {remainingAmount > 0 && (
                        <p style={{ margin: 0, color: '#ff4d6d', fontSize: '13px' }}>Remaining Balance: ${remainingAmount}</p>
                      )}
                    </div>
                  </div>
                )}
                {/* --- UI END --- */}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', alignItems: 'start' }}>
                  
                  {/* MANUAL UPI / QR BLOCK */}
                  <div style={{ background: 'var(--bg-main)', padding: '30px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '15px' }}>Scan QR Code or Pay via UPI:</span>
                    <img src="/qr_code.png" alt="Payment QR Code" style={{ width: '180px', height: '180px', borderRadius: '10px', border: '2px solid var(--accent)', objectFit: 'cover', margin: '0 auto 15px auto', display: 'block' }} />
                    <span style={{ display: 'block', color: 'var(--accent)', fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px', marginBottom: '15px' }}>
                      paytmqr6ex9gc@ptys
                    </span>
                    <motion.a 
                      href={`upi://pay?pa=paytmqr6ex9gc@ptys&pn=SHIVAM%20KUMAR&cu=INR&am=${amountToPay}`}
                      whileHover={{ scale: 1.05, backgroundColor: "var(--accent)", color: "var(--bg-main)" }}
                      style={{ display: 'inline-block', padding: '10px 15px', background: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none', transition: '0.3s', marginBottom: '10px' }}
                    >
                      Pay via UPI App ↗
                    </motion.a>
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)' }}>Name: SHIVAM KUMAR</span>
                  </div>

                  {/* AUTOMATED GATEWAYS (RAZORPAY & PAYPAL) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ background: 'var(--bg-main)', padding: '25px', borderRadius: '12px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <h3 style={{ color: 'var(--text-main)', marginBottom: '15px', fontSize: '18px' }}>Pay via Razorpay</h3>
                      <motion.button 
                        onClick={handleRazorpayPayment} 
                        whileHover={{ scale: 1.05, backgroundColor: "#3399cc", color: "#fff", borderColor: "#3399cc" }}
                        style={{ padding: '12px 20px', background: 'transparent', color: '#3399cc', border: '2px solid #3399cc', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
                      >
                        Pay with Razorpay ↗
                      </motion.button>
                    </div>

                    {/* PAYPAL BUTTON */}
                    <div style={{ background: 'var(--bg-main)', padding: '25px', borderRadius: '12px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <h3 style={{ color: 'var(--text-main)', marginBottom: '15px', fontSize: '18px' }}>Pay via PayPal (Intl.)</h3>
                      <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb", currency: "USD" }}>
                        <PayPalButtons 
                          style={{ layout: "horizontal", height: 40 }}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              application_context: { shipping_preference: "NO_SHIPPING" },
                              purchase_units: [{ description: clientDetails.service, amount: { value: amountToPay.toString() } }]
                            });
                          }}
                          onApprove={async (data, actions) => {
                            setPaymentStatusMessage("Verifying PayPal transaction on server securely...");
                            try {
                              const details = await actions.order.capture();
                              const res = await fetch("http://localhost:5000/api/payment/gateway-success", {
                                method: "POST", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                  name: clientDetails.name, 
                                  email: clientDetails.email, 
                                  serviceName: clientDetails.service, 
                                  transactionId: details.id, 
                                  gateway: 'paypal',
                                  amountPaid: amountToPay,
                                  totalAmount: isRemainingPayment ? portalData.originalTotal : totalAmount,
                                  projectId: clientDetails.projectId,
                                  isRemainingPayment: isRemainingPayment
                                })
                              });
                              const backendData = await res.json();
                              if(backendData.success) {
                                setPaymentStatusMessage("✅ Payment Verified!");
                                if (isRemainingPayment) {
                                  alert("Remaining Dues Cleared! Project updated to 100% Paid.");
                                  navigate('/portal');
                                } else {
                                  alert(`Payment Success! Your Portal Access Key is: ${backendData.accessKey}`);
                                  setTimeout(() => navigate('/portal'), 2000);
                                }
                              }
                            } catch (err) { setPaymentStatusMessage("❌ Payment capture failed on server."); }
                          }}
                        />
                      </PayPalScriptProvider>
                    </div>

                  </div>
                </div>
              </div>

              {/* ── UPLOAD SCREENSHOT / VERIFY PAYMENT (For QR Code Users) ── */}
              <div style={{ background: 'var(--bg-card)', padding: '40px 30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h2 style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '22px', marginBottom: '10px', textAlign: 'center' }}>// Manual QR Verification</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>If you paid via QR/UPI, submit your transaction details here so I can confirm.</p>
                
                <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input type="text" name="transaction_id" placeholder="Transaction ID / UTR Number" required style={inputStyle} />
                  <div>
                    <label style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block', fontFamily: 'monospace' }}>Upload Screenshot (JPG, PNG - Max 5MB)</label>
                    <input type="file" name="attachment" accept="image/png, image/jpeg" required style={{ ...inputStyle, background: 'var(--bg-card)', cursor: 'pointer', padding: '10px' }} />
                  </div>
                  
                  <motion.button 
                    type="submit" whileHover={{ scale: 1.02, backgroundColor: "var(--accent)", color: "var(--bg-main)", boxShadow: "0px 10px 20px var(--accent-glow)" }} whileTap={{ scale: 0.95 }}
                    style={{ padding: '15px', background: 'transparent', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    Submit Details ↗
                  </motion.button>
                  
                  {verifyStatus && (
                    <p style={{ color: verifyStatus.includes("Error") || verifyStatus.includes("❌") ? '#ff4d4d' : '#00f5a0', fontSize: '14px', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                      {verifyStatus}
                    </p>
                  )}
                </form>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* ── REFUND POLICY SUMMARY ── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ background: 'rgba(255, 77, 109, 0.05)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255, 77, 109, 0.2)', position: 'relative' }}
        >
          <span style={{ position: 'absolute', top: '15px', right: '20px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-dim)' }}>Auto-Synced Policy</span>
          <h3 style={{ color: '#ff4d6d', fontFamily: 'monospace', fontSize: '18px', marginBottom: '15px' }}>Cancellation & Refund</h3>
          <RefundRules fontSize="14px" />
        </motion.div>

      </div>
    </div>
  );
};

export default Payment;