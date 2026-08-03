import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RefundRules = ({ fontSize = '15px' }) => {
  const [refundText, setRefundText] = useState(null);

  // Fetch dynamic content from Admin CMS
  useEffect(() => {
    fetch("https://portfolio-px1j.onrender.com/api/content")
      .then(res => res.json())
      .then(data => {
        if (data && data.policyData && data.policyData.refund) {
          setRefundText(data.policyData.refund);
        }
      })
      .catch(err => console.error("Failed to fetch refund policy:", err));
  }, []);

  const highlightStyle = {
    color: '#00b8ff',
    fontWeight: 'bold'
  };

  // If Admin has added custom text, render it with preserved line breaks
  if (refundText) {
    return (
      <div style={{ color: 'var(--text-dim)', fontSize: fontSize, lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
        {refundText}
      </div>
    );
  }

  // Professional Fallback Content (if database is empty)
  return (
    <ul style={{ color: 'var(--text-dim)', fontSize: fontSize, lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
      <li style={{ marginBottom: '15px' }}>
        <strong style={{ color: 'var(--text-main)' }}>Advance Payment:</strong> A <span style={highlightStyle}>40-50% advance payment</span> is mandatory to secure your project slot and commence initial research and setup.
      </li>
      
      <li style={{ marginBottom: '15px' }}>
        <strong style={{ color: 'var(--text-main)' }}>24-Hour Grace Period:</strong> I offer a brief cooling-off period. If you decide to cancel within <span style={highlightStyle}>24 hours of making the advance payment</span> (provided no actual coding or design work has commenced), you are eligible for a full refund, <span style={highlightStyle}>excluding any third-party payment processing fees (approximately 5%)</span>, as these are non-refundable by gateway providers.
        <br/><br/>
        To initiate a cancellation request during this period, please notify me immediately at: <br/>
        <motion.a 
          href="mailto:support.shivam@gmail.com?subject=Refund Request&body=Hi Shivam Singh, I would like to formally request a refund for my project." 
          whileHover={{ backgroundColor: "rgba(0, 229, 255, 0.1)" }}
          style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'monospace', fontWeight: 'bold', padding: '6px 12px', border: '1px dashed var(--accent)', borderRadius: '6px', display: 'inline-block', marginTop: '10px' }}
        >
          support.shivam@gmail.com ↗
        </motion.a>
      </li>

      <li style={{ marginBottom: '15px' }}>
        <strong style={{ color: 'var(--text-main)' }}>Post Grace Period Cancellation:</strong> If a cancellation is requested after the initial 24 hours:
        <ul style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}><span style={highlightStyle}>If development has NOT started:</span> A <strong>15% administrative fee</strong> will be deducted to cover consultation and scheduling costs. The remaining balance will be refunded.</li>
          <li><span style={highlightStyle}>If development has started:</span> The advance payment becomes strictly <strong>non-refundable</strong>. This compensates for the blocked schedule, consultation time, and development efforts already invested.</li>
        </ul>
      </li>

      <li>
        <strong style={{ color: 'var(--text-main)' }}>Final Settlement & Delivery:</strong> The remaining 50% balance must be settled upon your approval of the final project demonstration. <span style={highlightStyle}>Project ownership rights, API keys, source files, and hosting credentials will ONLY be transferred after the final payment is successfully verified.</span>
      </li>
    </ul>
  );
};

export default RefundRules;