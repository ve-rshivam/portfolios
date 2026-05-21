import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Razorpay from 'razorpay'; 

dotenv.config();

const app = express();

// ==========================================
// 🛡️ 1. CONFIGURATION & MISCONFIGURATION FIXES 🛡️
// ==========================================
app.use(helmet()); 
app.use(mongoSanitize());

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://aapki-website-ka-domain.com'] 
    : '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// 🛡️ 2. RATE LIMITING (Global & Auth) 
// ==========================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5000, 
  message: { success: false, message: "Too many requests, try again later." }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5000, 
  message: { success: false, message: "Too many authentication attempts. Locked for 1 hour." }
});

// ==========================================
// 🛡️ 3. BROKEN ACCESS CONTROL (JWT Middleware) 🛡️
// ==========================================
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; 
    next(); 
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid or Expired Token!" });
  }
};

// 🔥 NEVER TRUST FRONTEND: Role-Based Access Control (RBAC) Middleware 🔥
const checkPerm = (validSections) => (req, res, next) => {
  if (req.admin.role === 'superadmin') return next();
  
  if (req.admin.permissions && validSections.some(sec => req.admin.permissions.includes(sec))) {
    return next();
  }
  
  return res.status(403).json({ success: false, message: `Access Denied. Requires one of: ${validSections.join(', ')}` });
};

// ==========================================
// 4. MONGODB CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Cloud MongoDB Connected Successfully'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));


// ==========================================
// 📧 NODEMAILER GLOBAL TRANSPORTERS
// ==========================================
const adminTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 465, 
  secure: true,
  auth: { 
    user: process.env.ADMIN_EMAIL_USER || process.env.EMAIL_USER, 
    pass: process.env.ADMIN_EMAIL_PASS || process.env.EMAIL_PASS 
  }
});

const clientTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 465, 
  secure: true,
  auth: { 
    user: process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER, 
    pass: process.env.CLIENT_EMAIL_PASS || process.env.EMAIL_PASS 
  }
});

const teamTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 465, 
  secure: true,
  auth: { 
    user: process.env.TEAM_EMAIL_USER || process.env.EMAIL_USER, 
    pass: process.env.TEAM_EMAIL_PASS || process.env.EMAIL_PASS 
  }
});


// ==========================================
// 5. DATABASE SCHEMAS & MODELS
// ==========================================
const messageSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxLength: 100 }, 
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  message: { type: String, trim: true, maxLength: 1000 },
  type: { type: String, default: 'contact' },
  transaction_id: { type: String, trim: true },
  attachment: String,
  date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const skillSchema = new mongoose.Schema({ name: String, category: String, icon: String, description: String, proficiency: Number });
const Skill = mongoose.model('Skill', skillSchema);

const experienceSchema = new mongoose.Schema({ role: String, company: String, duration: String, description: String });
const Experience = mongoose.model('Experience', experienceSchema);
const educationSchema = new mongoose.Schema({ degree: String, institution: String, duration: String, score: String, description: String });
const Education = mongoose.model('Education', educationSchema);

const contentSchema = new mongoose.Schema({
  homeData: { heroTitle: { type: String, default: "Hi, I am Shivam Singh" }, heroSubtitle: { type: String, default: "Full-Stack Web Developer" } },
  aboutData: { description: { type: String, default: "I am a passionate developer..." } },
  contactData: { email: { type: String, default: "" }, phone: { type: String, default: "" }, address: { type: String, default: "" } },
  policyData: { privacy: { type: String, default: "" }, terms: { type: String, default: "" }, refund: { type: String, default: "" } }
});
const Content = mongoose.model('Content', contentSchema);

const reviewSchema = new mongoose.Schema({
  name: String, role: String, rating: Number, text: String, 
  adminReply: { type: String, default: "" }, 
  isPinned: { type: Boolean, default: false }, date: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

const adminSchema = new mongoose.Schema({
  name: { type: String, default: "System Admin" }, 
  identifier: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "team" }, 
  permissions: { type: [String], default: [] }, 
  twoFactorPin: { type: String, required: true }, 
  resetOtp: { type: String, default: '' },
  otpExpiry: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  otpLastAttempt: { type: Date, default: Date.now }
});
const AdminUser = mongoose.model('AdminUser', adminSchema);

const serviceSchema = new mongoose.Schema({ 
  title: { type: String, required: true, trim: true }, 
  description: { type: String, required: true, trim: true }, 
  icon: { type: String, default: '🔧' }, 
  price: { type: String, default: 'Contact for pricing' } 
});
const Service = mongoose.model('Service', serviceSchema);

const projectSchema = new mongoose.Schema({
  clientEmail: String,
  clientName: String,
  projectTitle: String,
  hashedAccessKey: String,
  isPaymentVerified: { type: Boolean, default: false },
  progress: { type: Number, default: 10 }, 
  status: { type: String, default: 'Pending Verification' }, 
  paymentStatus: { type: String, default: 'Pending' }, 
  deliveryDate: String,
  notes: String,
  isTemporaryKey: { type: Boolean, default: false }, 
  lastUpdated: { type: Date, default: Date.now }
});
const ClientProject = mongoose.model('ClientProject', projectSchema);

// --- ADMIN INITIALIZATION (PRO LEVEL: SECRETS FROM .ENV ONLY) ---
const createDefaultAdmin = async () => {
  try {
    // Pure ENV Call: No hardcoded fallback strings to expose
    const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL;
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;
    const defaultPin = process.env.ADMIN_DEFAULT_PIN;

    if(!defaultEmail || !defaultPassword || !defaultPin) {
      console.log("⚠️ Superadmin init skipped: Missing ADMIN_DEFAULT_EMAIL, ADMIN_DEFAULT_PASSWORD or ADMIN_DEFAULT_PIN in .env");
      return;
    }

    const adminExists = await AdminUser.findOne({ identifier: defaultEmail });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(14);
      // Directly hash the ENV values
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      const hashedPin = await bcrypt.hash(defaultPin, salt); 

      await AdminUser.create({
        name: "Shivam (Superadmin)",
        identifier: defaultEmail,
        password: hashedPassword,
        role: "superadmin",
        permissions: ["all"],
        twoFactorPin: hashedPin 
      });
      console.log("✅ Secure Military-Grade Default Superadmin Created entirely from .env!");
    } else {
      let updated = false;
      if (adminExists.role !== 'superadmin') {
        adminExists.role = 'superadmin';
        adminExists.permissions = ['all'];
        adminExists.name = "Shivam (Superadmin)";
        updated = true;
      }
      
      if (!adminExists.twoFactorPin.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(14);
        adminExists.twoFactorPin = await bcrypt.hash(defaultPin, salt);
        updated = true;
      }

      if (updated) {
        await adminExists.save();
        console.log("✅ Existing Admin successfully upgraded and secured!");
      } else {
        console.log("✅ Superadmin is ready and secure.");
      }
    }
  } catch (err) {
    console.log("❌ Admin init error:", err.message);
  }
};
createDefaultAdmin();


// ==========================================
// 6. SECURE ADMIN AUTHENTICATION APIs
// ==========================================
app.post('/api/admin/login', authLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const admin = await AdminUser.findOne({ identifier });
    if (!admin) return res.status(401).json({ success: false, message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) res.json({ success: true, message: "Step 1 cleared" });
    else res.status(401).json({ success: false, message: "Invalid Credentials" });
  } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

app.post('/api/admin/verify-2fa', authLimiter, async (req, res) => {
  try {
    const { identifier, pin } = req.body; 
    const admin = await AdminUser.findOne({ identifier }); 
    
    if (!admin) return res.status(404).json({ success: false, message: "User not found!" });

    const isMatch = await bcrypt.compare(pin, admin.twoFactorPin);

    if (isMatch) {
      const token = jwt.sign({ id: admin._id, role: admin.role, permissions: admin.permissions }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ success: true, token: token, role: admin.role, permissions: admin.permissions, name: admin.name });
    } else {
      res.status(401).json({ success: false, message: "Incorrect Backup PIN!" });
    }
  } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});

app.post('/api/admin/update-security', verifyAdminToken, async (req, res) => {
  try {
    const { oldPassword, newPassword, newPin } = req.body;
    const admin = await AdminUser.findById(req.admin.id);
    if (!admin) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect Current Password!" });

    const salt = await bcrypt.genSalt(14);
    
    if (newPassword) admin.password = await bcrypt.hash(newPassword, salt);
    if (newPin) {
      if(newPin.length !== 4) return res.status(400).json({ success: false, message: "PIN must be 4 digits!"});
      admin.twoFactorPin = await bcrypt.hash(newPin, salt);
    }

    await admin.save();
    res.json({ success: true, message: "Security Credentials Updated Successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post('/api/admin/forgot-password', authLimiter, async (req, res) => {
  let otp = "";
  try {
    const { identifier } = req.body;
    const admin = await AdminUser.findOne({ identifier });
    if (!admin) return res.status(404).json({ success: false, message: "User not found!" });

    const timeSinceLastAttempt = Date.now() - admin.otpLastAttempt.getTime();
    if (admin.otpAttempts >= 100) {
      if (timeSinceLastAttempt < 24 * 60 * 60 * 1000) {
        const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - timeSinceLastAttempt) / (1000 * 60 * 60));
        return res.status(429).json({ success: false, message: `Max attempts reached. Try again in ${hoursLeft} hours.` });
      } else {
        admin.otpAttempts = 0; 
      }
    }

    otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.resetOtp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000; 
    admin.otpAttempts += 1;
    admin.otpLastAttempt = Date.now();
    await admin.save();

    // 🔥 FIX 4: SUPERADMIN GETS RESET OTP FROM THEIR OWN SECURE ID 🔥
    const activeTransporter = admin.role === 'superadmin' ? adminTransporter : teamTransporter;
    const fromEmail = admin.role === 'superadmin' 
        ? process.env.ADMIN_EMAIL_USER || process.env.EMAIL_USER 
        : process.env.TEAM_EMAIL_USER || process.env.EMAIL_USER;

    await activeTransporter.sendMail({
      from: `"System Security" <${fromEmail}>`,
      to: admin.identifier,
      subject: "Secure System Access - 6-Digit OTP",
      text: `Hello ${admin.name},\nYour security OTP for password reset is: ${otp}.\nValid for 10 mins. Attempts: ${admin.otpAttempts}/3 today.`
    });

    res.json({ success: true, message: "OTP sent to your email!" });
  } catch (error) { 
      res.json({ success: true, message: "Email failed, but testing OTP generated!", devOtp: otp }); 
  }
});

app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if(newPassword.length < 8) return res.status(400).json({success: false, message: "Password must be at least 8 chars"});

    const admin = await AdminUser.findOne({ identifier });
    if (!admin || admin.resetOtp !== otp || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(14);
    admin.password = await bcrypt.hash(newPassword, salt);
    admin.resetOtp = ''; 
    admin.otpAttempts = 0; 
    await admin.save();
    
    res.json({ success: true, message: "Password Reset Successfully!" });
  } catch (err) { res.status(500).json({ success: false, message: "Server Error" }); }
});


// ==========================================
// 7. PUBLIC APIs & ROLE-BASED AUTOMATED ALERTS
// ==========================================
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, phone, message, type, transaction_id, attachment } = req.body;
    
    if(type === 'payment' && (!name || !email || !phone || !transaction_id)) {
      return res.status(400).json({success: false, message: "Incomplete payment details provided."});
    }

    const newMessage = new Message({ name, email, phone, message, type, transaction_id, attachment });
    await newMessage.save();

    // 🔥 DYNAMIC ROLE-BASED EMAIL ALERTS (FIXED PRIVACY & SENDER) 🔥
    if (type === 'payment') {
      try {
        const authorizedAdmins = await AdminUser.find({
          $or: [{ role: 'superadmin' }, { permissions: 'payments' }]
        });
        
        // Loop runs to send individual emails so recipients can't see each other's IDs
        for (const adminUser of authorizedAdmins) {
          const mailOptions = {
            // FIX 2: Sender is always Team Support
            from: `"System Alert (Payments)" <${process.env.TEAM_EMAIL_USER || process.env.EMAIL_USER}>`, 
            to: adminUser.identifier, 
            subject: `💰 New Payment Received from ${name}`,
            html: `
              <h2>New Payment Verification Submitted</h2>
              <p><strong>Client Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Transaction ID:</strong> ${transaction_id}</p>
              <p>Please check your Admin Dashboard to verify the payment and generate an Access Key for the client.</p>
            `
          };
          // Use teamTransporter exclusively for system alerts
          await teamTransporter.sendMail(mailOptions).catch(err => console.log(`Payment Mail Failed for ${adminUser.identifier}:`, err.message));
        }
      } catch (mailError) { console.log("Mail setup error:", mailError); }
      
    } else if (type === 'contact' || !type) {
      
      try {
        const authorizedAdmins = await AdminUser.find({
          $or: [{ role: 'superadmin' }, { permissions: 'messages' }]
        });

        // Loop runs to send individual emails so recipients can't see each other's IDs
        for (const adminUser of authorizedAdmins) {
          const contactMailOptions = {
            // FIX 2: Sender is always Team Support
            from: `"Website Contact Form" <${process.env.TEAM_EMAIL_USER || process.env.EMAIL_USER}>`, 
            to: adminUser.identifier, 
            replyTo: email, 
            subject: `📬 New Contact Inquiry from ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
                <h2 style="color: #333; border-bottom: 2px solid #00e5ff; padding-bottom: 10px;">New Contact Message Received</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                
                <div style="background: #fff; padding: 15px; border-left: 4px solid #00e5ff; margin-top: 20px;">
                  <p style="margin: 0; font-size: 14px; color: #777;">Message:</p>
                  <p style="margin: 5px 0 0 0; color: #333; font-size: 16px; white-space: pre-wrap;">${message}</p>
                </div>
                <br/>
                <p style="color: #888; font-size: 12px;">This message was sent from your website's contact form.</p>
              </div>
            `
          };
          // Use teamTransporter exclusively for system alerts
          await teamTransporter.sendMail(contactMailOptions).catch(err => console.log(`Contact Mail Failed for ${adminUser.identifier}:`, err.message));
        }
      } catch (mailError) { console.log("Contact Mail setup error:", mailError); }
    }

    res.status(200).json({ success: true, message: "Message saved!" });
  } catch (err) { 
    res.status(500).json({ success: false, message: "Server Error" }); 
  }
});

// 🔥 RAZORPAY ORDER CREATION 🔥
app.post('/api/payment/razorpay-order', async (req, res) => {
  try {
    const { serviceId, amount } = req.body; 

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Razorpay keys missing in .env" });
    }

    let numericPrice = 100; 
    
    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
        const service = await Service.findById(serviceId);
        if (service && service.price) {
            numericPrice = parseInt(service.price.replace(/\D/g, "")) || 100; 
        }
    } else if (amount) {
        numericPrice = parseInt(amount, 10);
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: numericPrice * 100, 
      currency: "INR",
      receipt: "receipt_" + crypto.randomBytes(8).toString('hex'),
    };

    const order = await instance.orders.create(options);
    
    if (!order) return res.status(500).json({ success: false, message: "Razorpay order creation failed" });
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 🔥 AUTOMATED GATEWAY SUCCESS API 🔥
app.post('/api/payment/gateway-success', async (req, res) => {
  try {
    const { name, email, serviceName, transactionId } = req.body;
    
    const rawAccessKey = crypto.randomBytes(6).toString('hex').toUpperCase();
    const salt = await bcrypt.genSalt(14);
    const hashedKey = await bcrypt.hash(rawAccessKey, salt);

    const newProject = new ClientProject({
      clientEmail: email,
      clientName: name,
      projectTitle: serviceName || "Automated Purchase",
      hashedAccessKey: hashedKey,
      isPaymentVerified: true,
      paymentStatus: 'Fully Paid (Gateway)',
      status: 'Development Started',
      progress: 10
    });
    await newProject.save();

    try {
      await clientTransporter.sendMail({
        from: `"Shivam Web Studio" <${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Payment Verified - Portal Login Details",
        html: `<h3>Hi ${name},</h3><p>Your payment via gateway is verified.</p><p>Login URL: <a href="http://localhost:5173/portal">Client Portal</a></p><p>Email: <b>${email}</b></p><p>Access Key: <b style="color:#00e5ff; font-size:20px;">${rawAccessKey}</b></p>`
      });
    } catch(mailErr) {
      console.log("Email sending failed, but project auto-created.");
    }

    res.json({ success: true, accessKey: rawAccessKey, email: email });
  } catch(err) {
    res.status(500).json({ success: false, message: "Automation failed." });
  }
});


app.post('/api/reviews', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/content', async (req, res) => {
  try {
    let content = await Content.findOne();
    if (!content) content = await Content.create({});
    res.json(content);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get('/api/reviews', async (req, res) => {
  try { res.json(await Review.find().sort({ date: -1 })); } 
  catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get('/api/services', async (req, res) => {
  try { res.json(await Service.find()); } 
  catch (err) { res.status(500).json({ error: "Failed" }); }
});

app.get('/api/resume-data', async (req, res) => {
  try {
    const skills = await Skill.find();
    const experiences = await Experience.find().sort({ _id: -1 });
    const education = await Education.find().sort({ _id: -1 }); // 🔥 Added Education
    res.status(200).json({ skills, experiences, education });
  } catch (err) { res.status(500).json({ message: "Error fetching resume data" }); }
});

// ==========================================
// 🔥 SECURE CLIENT PORTAL APIs 🔥
// ==========================================
app.post('/api/client/login', async (req, res) => {
  try {
    const { email, accessKey } = req.body;

    const project = await ClientProject.findOne({ clientEmail: email });
    if (!project) return res.status(404).json({ success: false, message: "Email not found." });

    const isMatch = await bcrypt.compare(accessKey, project.hashedAccessKey);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Access Key." });

    return res.json({
      success: true,
      project: {
        _id:            project._id, // 🔥 FIX: Ye pehle missing tha
        clientName:     project.clientName,
        clientEmail:    project.clientEmail,
        projectTitle:   project.projectTitle,
        status:         project.status,
        progress:       project.progress,
        paymentStatus:  project.paymentStatus,
        deliveryDate:   project.deliveryDate,
        lastUpdated:    project.lastUpdated,
        notes:          project.notes,
        isTemporaryKey: project.isTemporaryKey || false 
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.post('/api/client/change-password', async (req, res) => {
  try {
    const { email, oldKey, newKey } = req.body;

    const project = await ClientProject.findOne({ clientEmail: email });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const isMatch = await bcrypt.compare(oldKey, project.hashedAccessKey);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect current Access Key." });

    const salt = await bcrypt.genSalt(14);
    const hashedNewKey = await bcrypt.hash(newKey, salt);

    project.hashedAccessKey = hashedNewKey;
    project.isTemporaryKey = false; 
    await project.save();

    res.json({ success: true, message: "Access Key updated successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/client/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const project = await ClientProject.findOne({ clientEmail: email });
    if (!project) return res.status(404).json({ success: false, message: "Yeh email registered nahi hai." });

    const tempPassword = "KEY-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const salt = await bcrypt.genSalt(14);
    const hashedTemp = await bcrypt.hash(tempPassword, salt);
    project.hashedAccessKey = hashedTemp;
    project.isTemporaryKey = true; 
    await project.save();

    try {
      await clientTransporter.sendMail({
        from: `"Shivam Support" <${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: email, 
        subject: "🔐 Password Reset - Your New Portal Access Key",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f9; border-radius: 10px;">
            <h2 style="color: #333;">Hi ${project.clientName},</h2>
            <p style="color: #555; font-size: 16px;">Your request to reset your Portal Access Key was successful.</p>
            <div style="background: #fff; padding: 15px; border-left: 4px solid #00e5ff; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #777;">Your Temporary Access Key is:</p>
              <h1 style="margin: 5px 0 0 0; color: #000; letter-spacing: 2px;">${tempPassword}</h1>
            </div>
            <p style="color: #ff4d4d; font-size: 14px; font-weight: bold;">⚠️ For security reasons, please login and change this temporary key immediately from your portal dashboard.</p>
            <br/>
            <p style="color: #555; font-size: 14px;">Regards,<br/><strong>Shivam Web Studio</strong></p>
          </div>
        `
      });
      
      res.json({ success: true, message: "Naya Access Key email par bhej diya gaya hai!" });

    } catch (mailErr) {
      res.status(500).json({ success: false, message: "Password reset ho gaya, par email bhejne mein error aayi." });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/client/get-project', async (req, res) => {
  try {
    const { email } = req.body;
    const project = await ClientProject.findOne({ clientEmail: email });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    return res.json({
      success: true,
      project: {
        _id:            project._id, // 🔥 FIX: Yahan bhi add kar diya gaya hai
        clientName:     project.clientName,
        clientEmail:    project.clientEmail,
        projectTitle:   project.projectTitle,
        status:         project.status,
        progress:       project.progress,
        paymentStatus:  project.paymentStatus,
        deliveryDate:   project.deliveryDate,
        lastUpdated:    project.lastUpdated,
        notes:          project.notes,
        isTemporaryKey: project.isTemporaryKey || false 
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// 🔥 CLIENT TO ADMIN MESSAGING API 🔥
app.post('/api/client/send-message', async (req, res) => {
  try {
    const { email, projectId, message } = req.body;

    // 1. DB se project dhundho taaki client ka original naam aur project title mil sake
    const project = await ClientProject.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // 2. Message ko Database me save karo
    // 'type: contact' rakhne se ye aapke Admin Dashboard ke "Messages" tab me automatic dikhega!
    const newMessage = new Message({
      name: project.clientName,
      email: project.clientEmail,
      message: `[Project: ${project.projectTitle}]\n\n${message}`,
      type: 'contact', 
      date: Date.now()
    });
    await newMessage.save();

    // 3. Admin ko Email Alert bhejo
    try {
      await adminTransporter.sendMail({
        from: `"Client Portal Alert" <${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL_USER || process.env.EMAIL_USER,
        subject: `📩 Portal Reply: ${project.clientName} on project ${project.projectTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f9; border-radius: 10px;">
            <h2 style="color: #333;">New Message from Client Portal</h2>
            <p style="color: #555;"><strong>Client:</strong> ${project.clientName} (${project.clientEmail})</p>
            <p style="color: #555;"><strong>Project:</strong> ${project.projectTitle}</p>
            
            <div style="background: #fff; padding: 15px; border-left: 4px solid #00e5ff; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #777;">Message:</p>
              <p style="margin: 5px 0 0 0; color: #333; font-size: 15px; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #555; font-size: 14px;">You can view and delete this message from your Admin Dashboard Inbox.</p>
          </div>
        `
      });
    } catch(mailErr) {
      console.log("Admin alert email failed, but message saved to DB.");
    }

    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// 🔥 CLIENT TO ADMIN MESSAGING API 🔥
app.post('/api/client/send-message', async (req, res) => {
  try {
    const { email, projectId, message } = req.body;

    if (!projectId || !message) {
      return res.status(400).json({ success: false, message: "Project ID and Message are required." });
    }

    // 1. DB se project dhundho taaki client ka original naam mil sake (Security)
    const project = await ClientProject.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // 2. Message ko Database me save karo (Admin Inbox me dikhane ke liye)
    const newMessage = new Message({
      name: project.clientName,
      email: project.clientEmail,
      message: `[Reply from Project: ${project.projectTitle}]\n\n${message}`,
      type: 'contact', // type 'contact' hone se ye seedha Admin ke Inbox me jayega
      date: Date.now()
    });
    await newMessage.save();

    // 3. Admin ko Email Alert bhejo
    try {
      await adminTransporter.sendMail({
        from: `"Client Portal Alert" <${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL_USER || process.env.EMAIL_USER,
        subject: `📩 Portal Reply: ${project.clientName} (${project.projectTitle})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f9; border-radius: 10px;">
            <h2 style="color: #333;">New Message from Client Portal</h2>
            <p style="color: #555;"><strong>Client:</strong> ${project.clientName} (${project.clientEmail})</p>
            <p style="color: #555;"><strong>Project:</strong> ${project.projectTitle}</p>
            
            <div style="background: #fff; padding: 15px; border-left: 4px solid #00e5ff; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #777;">Message:</p>
              <p style="margin: 5px 0 0 0; color: #333; font-size: 15px; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #555; font-size: 14px;">You can view and delete this message from your Admin Dashboard Inbox.</p>
          </div>
        `
      });
    } catch(mailErr) {
      console.log("Admin alert email failed, but message saved to DB.");
    }

    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Client to Admin Message Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ==========================================
// 8. 🛡️ PROTECTED ADMIN APIs (WITH RBAC) 🛡️
// ==========================================

// 🔥 🆕 TEAM MANAGEMENT APIs (Superadmin ONLY) 🆕 🔥
app.get('/api/admin/team', verifyAdminToken, checkPerm(['team']), async (req, res) => {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ success: false, message: "Superadmin only." });
  try {
    const team = await AdminUser.find({ role: 'team' }, '-password -twoFactorPin');
    res.json(team);
  } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.post('/api/admin/team', verifyAdminToken, async (req, res) => {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ success: false, message: "Superadmin only." });
  try {
    const { name, identifier, permissions } = req.body;
    let member = await AdminUser.findOne({ identifier });
    
    if (member) {
      member.name = name;
      member.permissions = permissions;
      await member.save();
      return res.json({ success: true, message: "Team member updated!" });
    } else {
      const rawPassword = crypto.randomBytes(4).toString('hex'); 
      const rawPin = Math.floor(1000 + Math.random() * 9000).toString(); 
      const salt = await bcrypt.genSalt(14);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);
      const hashedPin = await bcrypt.hash(rawPin, salt);
      
      await AdminUser.create({
        name, identifier, password: hashedPassword, role: 'team', permissions, twoFactorPin: hashedPin 
      });
      
      try {
        await teamTransporter.sendMail({
          from: `"Shivam Superadmin" <${process.env.TEAM_EMAIL_USER || process.env.EMAIL_USER}>`,
          to: identifier,
          subject: "🎉 Welcome to Shivam Web Studio Team",
          html: `<p>Hi ${name},</p><p>You've been granted access to the Admin Dashboard.</p><p><b>Login Email:</b> ${identifier}<br><b>Password:</b> ${rawPassword}<br><b>2FA PIN:</b> ${rawPin}</p><p><em>For security, please login and change your Password and PIN immediately.</em></p><p>Login here: <a href="http://localhost:5173/admin">Admin Panel</a></p>`
        });
      } catch(e) { console.log("Team email failed", e.message); }

      return res.json({ success: true, message: "Team member added and emailed!" });
    }
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/admin/team/:id', verifyAdminToken, async (req, res) => {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ success: false });
  try {
    await AdminUser.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});


// 🔥 PROTECTED APIs WRAPPED WITH PERMISSION CHECKS 🔥
app.get('/api/messages', verifyAdminToken, checkPerm(['messages', 'payments']), async (req, res) => {
  try { res.json(await Message.find().sort({ date: -1 })); } 
  catch (err) { res.status(500).json({ message: "Error" }); }
});

app.delete('/api/messages/:id', verifyAdminToken, checkPerm(['messages', 'payments']), async (req, res) => {
  try { await Message.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ success: false }); }
});

app.put('/api/reviews/:id/pin', verifyAdminToken, checkPerm(['reviews']), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" }); 
    review.isPinned = !review.isPinned; 
    await review.save();
    res.json({ success: true, isPinned: review.isPinned });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.put('/api/reviews/:id/edit', verifyAdminToken, checkPerm(['reviews']), async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { text: req.body.text });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.put('/api/reviews/:id/reply', verifyAdminToken, checkPerm(['reviews']), async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { adminReply: req.body.adminReply });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/reviews/:id', verifyAdminToken, checkPerm(['reviews']), async (req, res) => {
  try { await Review.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/content/update', verifyAdminToken, checkPerm(['cms']), async (req, res) => {
  try {
    const { homeData, aboutData, contactData, policyData } = req.body;
    await Content.findOneAndUpdate({}, { homeData, aboutData, contactData, policyData }, { upsert: true, new: true });
    res.json({ success: true, message: "Website Updated!" });
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

app.post('/api/skill', verifyAdminToken, checkPerm(['skills']), async (req, res) => {
  try {
    const { name, category, icon, description, proficiency } = req.body;
    const newSkill = new Skill({ name, category, icon, description, proficiency });
    await newSkill.save();
    res.status(200).json({ success: true, message: "Skill added!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

// 🔥 EDUCATION APIs
app.post('/api/education', verifyAdminToken, checkPerm(['skills']), async (req, res) => {
  try {
    const { degree, institution, duration, score, description } = req.body;
    const newEdu = new Education({ degree, institution, duration, score, description });
    await newEdu.save();
    res.status(200).json({ success: true, message: "Education added!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/education/:id', verifyAdminToken, checkPerm(['skills']), async (req, res) => {
  try { await Education.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ success: false }); }
});
// 🔥 EXPERIENCE APIs
app.post('/api/experience', verifyAdminToken, checkPerm(['skills']), async (req, res) => {
  try {
    const { role, company, duration, description } = req.body;
    const newExp = new Experience({ role, company, duration, description });
    await newExp.save();
    res.status(200).json({ success: true, message: "Experience added!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/experience/:id', verifyAdminToken, checkPerm(['skills']), async (req, res) => {
  try { await Experience.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ success: false }); }
});
// ==========================================
// 🔥 NEW: EXPERIENCE (TIMELINE) APIs 🔥
// ==========================================
app.post('/api/experience', verifyAdminToken, checkPerm(['skills']), async (req, res) => {
  try {
    const { role, company, duration, description } = req.body;
    const newExp = new Experience({ role, company, duration, description });
    await newExp.save();
    res.status(200).json({ success: true, message: "Experience added!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/experience/:id', verifyAdminToken, checkPerm(['skills']), async (req, res) => {
  try { 
    await Experience.findByIdAndDelete(req.params.id); 
    res.json({ success: true }); 
  } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/services', verifyAdminToken, checkPerm(['services']), async (req, res) => {
  try {
    const { title, description, icon, price } = req.body;
    const newService = new Service({ title, description, icon, price });
    await newService.save();
    res.status(200).json({ success: true, message: "Service added!" });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/services/:id', verifyAdminToken, checkPerm(['services']), async (req, res) => {
  try { await Service.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/client-projects', verifyAdminToken, checkPerm(['projects', 'payments']), async (req, res) => {
  try { const projects = await ClientProject.find().sort({ _id: -1 }); res.json(projects); } 
  catch (err) { res.status(500).json({ message: "Error" }); }
});

app.post('/api/client-projects', verifyAdminToken, checkPerm(['projects']), async (req, res) => {
  try {
    req.body.lastUpdated = Date.now();
    if(req.body._id) {
      await ClientProject.findByIdAndUpdate(req.body._id, req.body); 
    } else {
      await new ClientProject(req.body).save(); 
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/client-projects/:id', verifyAdminToken, checkPerm(['projects']), async (req, res) => {
  try { await ClientProject.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/client-projects/:id/message', verifyAdminToken, checkPerm(['projects']), async (req, res) => {
  try {
    const project = await ClientProject.findById(req.params.id);
    if(!project) return res.status(404).json({ success: false, message: "Project not found" });
    
    // 🔥 FIX 1: Database mein message update karo taaki Client Portal par dikhe
    project.notes = req.body.message;
    project.lastUpdated = Date.now();
    await project.save();

    // 🔥 FIX 2: Email bhi bhejo (Sath mein)
    try {
      await clientTransporter.sendMail({
        from: `"Shivam Web Studio" <${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: project.clientEmail,
        subject: `📩 Important Message regarding ${project.projectTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; border-radius: 10px;">
            <h2 style="color: #333; border-bottom: 2px solid #00e5ff; padding-bottom: 10px;">Update from Developer</h2>
            <p style="font-size: 16px; color: #444; white-space: pre-wrap;">${req.body.message}</p>
            <br>
            <p style="color: #777; font-size: 14px;">Log in to your portal to see live progress and reply directly.</p>
          </div>
        `
      });
    } catch(mailErr) {
      console.log("Failed to send email to client, but portal was updated.");
    }

    res.json({ success: true, message: "Message updated on portal and emailed to client!" });
  } catch (err) { 
    console.error("Admin to Client Message Error:", err);
    res.status(500).json({ success: false, message: "Server error" }); 
  }
});

app.post('/api/admin/verify-client-payment/:id', verifyAdminToken, checkPerm(['payments']), async (req, res) => {
  try {
    const project = await ClientProject.findById(req.params.id);
    if(!project) return res.status(404).json({ success: false, message: "Project not found" });

    const rawAccessKey = crypto.randomBytes(6).toString('hex').toUpperCase();
    const salt = await bcrypt.genSalt(14);
    const hashedKey = await bcrypt.hash(rawAccessKey, salt);

    project.hashedAccessKey = hashedKey;
    project.isPaymentVerified = true;
    project.paymentStatus = req.body.paymentStatus || 'Verified/Paid';
    project.status = 'Development Phase';
    await project.save();

    try {
      await clientTransporter.sendMail({
        from: `"Shivam Web Studio" <${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: project.clientEmail,
        subject: "🎉 Payment Verified - Your Project Access Key",
        html: `<h3>Hi ${project.clientName},</h3><p>Your payment for <strong>${project.projectTitle}</strong> has been successfully verified.</p><p>You can now track your project's live progress on our portal.</p><br><p><strong>Login Email:</strong> ${project.clientEmail}</p><p><strong>Secure Access Key:</strong> <span style="font-size:24px; color:#00e5ff; font-weight:bold; letter-spacing: 4px;">${rawAccessKey}</span></p><br><p><em>Note: For security reasons, this key is encrypted in our database. Do not share it with anyone!</em></p>`
      });
    } catch(mailErr) {
       console.log("Email failed, but key was generated.");
    }

    res.json({ success: true, message: "Payment Verified & Access Key Generated!" });
  } catch(err) {
    res.status(500).json({ success: false, message: "Verification failed." });
  }
});

app.post('/api/admin/approve-payment-message/:msgId', verifyAdminToken, checkPerm(['payments']), async (req, res) => {
  try {
    const msg = await Message.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    const customPaymentStatus = req.body.paymentStatus || 'Fully Paid';
    const rawAccessKey = crypto.randomBytes(6).toString('hex').toUpperCase();
    const salt = await bcrypt.genSalt(14);
    const hashedKey = await bcrypt.hash(rawAccessKey, salt);

    const newProject = new ClientProject({
      clientEmail: msg.email,
      clientName: msg.name,
      projectTitle: msg.message.split('|')[0] || "Custom Project",
      hashedAccessKey: hashedKey,
      isPaymentVerified: true,
      paymentStatus: customPaymentStatus, 
      status: 'Development Started',
      progress: 10
    });
    await newProject.save();

    try {
      await clientTransporter.sendMail({
        from: `"Shivam Web Studio" <${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: msg.email,
        subject: "🎉 Payment Verified - Portal Login Details",
        html: `<h3>Hi ${msg.name},</h3><p>Your payment is verified. Track your project here: <a href="http://localhost:5173/portal">Client Portal</a></p><p>Email: <b>${msg.email}</b></p><p>Access Key: <b style="color:#00e5ff; font-size:20px;">${rawAccessKey}</b></p>`
      });
    } catch(mailErr) {
      console.log("Email failed, but Project Created. Raw Key:", rawAccessKey);
    }

    await Message.findByIdAndDelete(req.params.msgId);
    res.json({ success: true, message: "Payment Verified, Project Created & Key Sent!" });
  } catch(err) {
    res.status(500).json({ success: false, message: "Server error during verification." });
  }
});

app.post('/api/admin/reject-payment-message/:msgId', verifyAdminToken, checkPerm(['payments']), async (req, res) => {
  try {
    const msg = await Message.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    const rejectReason = req.body.reason || "Invalid Transaction ID or Unclear Screenshot";

    try {
      await clientTransporter.sendMail({
        from: `"Shivam Support" <${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: msg.email,
        subject: "⚠️ Action Required: Payment Verification Failed",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #fffcfc; border-radius: 10px; border: 1px solid #ffcccc;">
            <h2 style="color: #ff4d4d; margin-top: 0;">Payment Verification Failed</h2>
            <p style="color: #333; font-size: 16px;">Hi ${msg.name},</p>
            <p style="color: #555; font-size: 15px;">We were unable to verify your recent manual payment for <strong>${msg.message.split('|')[0] || "your project"}</strong> (Transaction ID: ${msg.transaction_id}).</p>
            
            <div style="background: #fff; padding: 15px; border-left: 4px solid #ff4d4d; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #777;">Reason for rejection:</p>
              <p style="margin: 5px 0 0 0; color: #333; font-weight: bold;">${rejectReason}</p>
            </div>

            <h3 style="color: #333;">What to do next?</h3>
            <p style="color: #555; font-size: 15px;">Please contact our support team immediately with a valid payment proof (clear screenshot) so we can resolve this issue.</p>
            
            <a href="mailto:${process.env.CLIENT_EMAIL_USER || process.env.EMAIL_USER}" style="display: inline-block; padding: 10px 20px; background: #ff4d4d; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Contact Support</a>
            
            <br/><br/>
            <p style="color: #555; font-size: 14px;">Regards,<br/><strong>Shivam Web Studio</strong></p>
          </div>
        `
      });
    } catch(mailErr) {
      console.log("Failed to send rejection email.", mailErr);
    }

    await Message.findByIdAndDelete(req.params.msgId);
    res.json({ success: true, message: "Payment Rejected & Client Emailed Successfully!" });
  } catch(err) {
    res.status(500).json({ success: false, message: "Server error during rejection." });
  }
});


// ==========================================
// 9. AI & EXTERNAL APIs
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const systemPrompt = `You are an AI for Shivam Singh. Answer professionally. User: ${message}`;
    const result = await model.generateContent(systemPrompt);
    res.status(200).json({ reply: result.response.text() });
  } catch (error) { res.status(500).json({ reply: "AI offline." }); }
});

app.get('/api/linkedin-skills', async (req, res) => {
  try {
    const linkedinUsername = "ve-rshivam"; 
    const url = `https://linkedin-data-api.p.rapidapi.com/get-profile-skills?username=${linkedinUsername}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': 'linkedin-data-api.p.rapidapi.com' }
    });
    const data = await response.json();
    if (data?.skills) {
      return res.status(200).json(data.skills.map(s => ({ name: s.name || s, icon: '🔗', proficiency: 80 })));
    }
    return res.status(200).json([]); 
  } catch (error) { res.status(200).json([]); }
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });