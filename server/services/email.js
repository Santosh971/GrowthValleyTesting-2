const nodemailer = require('nodemailer');
const config = require('../config');

// Log SMTP configuration (without password)
console.log('📧 SMTP Configuration:', {
  host: config.smtp.host,
  port: config.smtp.port,
  user: config.smtp.user ? '***configured***' : '***missing***',
  from: config.smtp.from,
  nodeEnv: config.nodeEnv
});

// Create a fresh transporter each time to avoid stale connection issues
const createTransporter = () => {
  // Validate SMTP configuration
  if (!config.smtp.host || !config.smtp.port) {
    console.error('❌ SMTP configuration missing: host or port not set');
    throw new Error('SMTP configuration incomplete');
  }

  if (!config.smtp.user || !config.smtp.pass) {
    console.error('❌ SMTP credentials missing: user or password not set');
    throw new Error('SMTP credentials incomplete');
  }

  console.log('📧 Creating SMTP transporter for:', config.smtp.host, ':', config.smtp.port);

  // Create transporter with explicit configuration
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: parseInt(config.smtp.port, 10),
    secure: false, // false for port 587 (STARTTLS), true for port 465
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    },
    // Connection timeout settings
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    // TLS settings for Gmail
    tls: {
      rejectUnauthorized: true
    }
  });

  return transporter;
};

/**
 * Verify SMTP connection
 */
const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection verification failed:', error.message);
    return false;
  }
};

/**
 * Send email
 */
const sendEmail = async (options) => {
  const { to, subject, html, text, attachments } = options;

  // Log email attempt
  console.log('📧 Attempting to send email to:', to);
  console.log('📧 Subject:', subject);

  // Validate required fields
  if (!to || !subject || (!html && !text)) {
    console.error('❌ Missing required email fields');
    return { success: false, error: 'Missing required email fields' };
  }

  // Create fresh transporter for each send (avoids stale connection issues)
  let transporter;
  try {
    transporter = createTransporter();
  } catch (error) {
    console.error('❌ Failed to create transporter:', error.message);
    return { success: false, error: error.message };
  }

  const mailOptions = {
    from: config.smtp.from || config.smtp.user,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
    attachments
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Command:', error.command);

    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check SMTP username and password (use Gmail App Password)';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Check SMTP host and port';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timed out. Check network connectivity';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid recipient email address';
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const subject = 'Password Reset Request - Growth Valley';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Growth Valley</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you did not request this password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Growth Valley. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send new enquiry notification to admin
 */
const sendEnquiryNotification = async (enquiry, adminEmail) => {
  console.log('📧 Sending enquiry notification to admin:', adminEmail);

  const subject = `New Enquiry from ${enquiry.name} - Growth Valley`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .info-row { padding: 10px; border-bottom: 1px solid #ddd; }
        .label { font-weight: bold; color: #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Enquiry</h1>
        </div>
        <div class="content">
          <div class="info-row">
            <span class="label">Name:</span> ${enquiry.name}
          </div>
          <div class="info-row">
            <span class="label">Email:</span> ${enquiry.email}
          </div>
          <div class="info-row">
            <span class="label">Phone:</span> ${enquiry.phone || 'Not provided'}
          </div>
          <div class="info-row">
            <span class="label">Company:</span> ${enquiry.company || 'Not provided'}
          </div>
          <div class="info-row">
            <span class="label">Service:</span> ${enquiry.service || 'Not specified'}
          </div>
          <div class="info-row">
            <span class="label">Message:</span>
            <p>${enquiry.message}</p>
          </div>
        </div>
        <div class="footer">
          <p>Received at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: adminEmail, subject, html });
};

/**
 * Send enquiry confirmation to user
 */
const sendEnquiryConfirmation = async (enquiry) => {
  console.log('📧 Sending confirmation email to user:', enquiry.email);

  const subject = 'Thank you for contacting Growth Valley';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Growth Valley</h1>
        </div>
        <div class="content">
          <h2>Thank You for Reaching Out!</h2>
          <p>Hi ${enquiry.name},</p>
          <p>Thank you for contacting Growth Valley. We have received your enquiry and will get back to you within 24-48 hours.</p>
          <p>Here's a summary of your message:</p>
          <ul>
            <li><strong>Company:</strong> ${enquiry.company || 'Not provided'}</li>
            <li><strong>Service:</strong> ${enquiry.service || 'General Enquiry'}</li>
            <li><strong>Message:</strong> ${enquiry.message.substring(0, 100)}${enquiry.message.length > 100 ? '...' : ''}</li>
          </ul>
          <p>In the meantime, feel free to explore our <a href="https://growthvalley.com/case-studies">case studies</a> to see how we've helped businesses like yours.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Growth Valley. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: enquiry.email, subject, html });
};

module.exports = {
  sendEmail,
  verifyConnection,
  sendPasswordResetEmail,
  sendEnquiryNotification,
  sendEnquiryConfirmation
};