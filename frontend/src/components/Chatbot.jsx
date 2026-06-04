import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Welcome message me clear kar diya hai ki Contact aur Resume ke liye shortcuts use karein
  const [messages, setMessages] = useState([{ 
    sender: 'ai', 
    text: "Hi! I am Shivam's AI Assistant. Ask me anything about his skills or projects! 🚀 (For Resume or Contact, please use the shortcuts on the page)." 
  }]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to UI
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Send to your Backend API
      const res = await fetch("https://portfolio-h37w.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      
      // Add AI response to UI
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Connection error. The backend might be sleeping!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            style={{ 
              width: '320px', height: '450px', 
              background: 'var(--bg-card)', // Theme variable
              borderRadius: '20px', 
              border: '1px solid var(--border-color)', 
              boxShadow: '0 15px 40px var(--accent-glow)', // Premium glow shadow
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              marginBottom: '15px' 
            }}
          >
            {/* Chat Header */}
            <div style={{ background: 'var(--accent)', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--bg-main)', fontSize: '16px', fontWeight: 'bold' }}>🤖 Shivam's AI</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--bg-main)', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>×</button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-main)' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ 
                    background: msg.sender === 'user' ? 'var(--accent)' : 'var(--bg-card)', 
                    color: msg.sender === 'user' ? 'var(--bg-main)' : 'var(--text-main)', 
                    padding: '10px 15px', 
                    borderRadius: msg.sender === 'user' ? '15px 15px 0px 15px' : '15px 15px 15px 0px', // iMessage style corners
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    fontSize: '14px', lineHeight: '1.5'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic', marginLeft: '5px' }}>AI is typing...</div>}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendMessage} style={{ display: 'flex', padding: '12px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <input 
                type="text" value={input} onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask something..." 
                style={{ 
                  flex: 1, padding: '10px 15px', borderRadius: '20px', 
                  border: '1px solid var(--border-color)', background: 'var(--bg-main)', 
                  color: 'var(--text-main)', outline: 'none', fontSize: '14px' 
                }} 
              />
              <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '20px', cursor: 'pointer', padding: '0 10px', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                ➤
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: isOpen ? 90 : 0 }} 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '60px', height: '60px', borderRadius: '50%', 
          background: 'var(--accent)', 
          color: 'var(--bg-main)', // Icon color matches background
          border: 'none', cursor: 'pointer', 
          boxShadow: '0 10px 20px var(--accent-glow)', // Premium glow
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          fontSize: '24px', float: 'right',
          transition: 'background 0.3s ease'
        }}
      >
        {isOpen ? '❌' : '💬'}
      </motion.button>
    </div>
  );
};

export default Chatbot;