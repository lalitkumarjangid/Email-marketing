import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (recipients, subject, body) => {
  const transporter = createTransporter();
  
  // Handle different formats of recipients (string, array, or comma-separated)
  let toAddresses = recipients;
  if (Array.isArray(recipients)) {
    toAddresses = recipients.join(',');
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Futurebink" <${process.env.EMAIL_USER}>`,
      to: toAddresses, // Will work with a single email or comma-separated list
      subject,
      html: body,
      text: body.replace(/<[^>]*>?/gm, ''),
    });

    console.log(`Email sent to ${toAddresses}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;