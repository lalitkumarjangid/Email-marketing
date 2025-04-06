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

const sendEmail = async (email, subject, body) => {
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Futurebink" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: body, // Using HTML instead of text for better formatting
      text: body.replace(/<[^>]*>?/gm, ''), // Fallback plain text
    });

    console.log(`Email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw for proper error handling upstream
  }
};

export default sendEmail;