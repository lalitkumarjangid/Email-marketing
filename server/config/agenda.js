import Agenda from 'agenda';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables before using them
dotenv.config();

// Create an instance of agenda
// Use the MONGO_URI from environment variables
const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: 'agendaJobs'
  },
  processEvery: '1 minute'
});

// Define the job to send emails
agenda.define('send scheduled email', async (job) => {
  const { email, subject, body } = job.attrs.data;

  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Send email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: body
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
});

// Start agenda
(async function() {
  try {
    await agenda.start();
    console.log('Agenda started successfully');
  } catch (error) {
    console.error('Failed to start Agenda:', error);
  }
})();

export default agenda;