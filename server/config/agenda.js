import Agenda from 'agenda';
import sendEmail from '../services/emailService.js';
import Email from '../models/emails.js'; // Import the Email model
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create an instance of agenda
const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: 'agendaJobs'
  },
  processEvery: '30 seconds' // Process more frequently for better responsiveness
});

// Define the job to send emails
agenda.define('send scheduled email', async (job) => {
  const { email: recipientEmail, subject, body, emailId } = job.attrs.data;

  try {
    // Send the email
    await sendEmail(recipientEmail, subject, body);
    
    // Update the email status in the database
    if (emailId) {
      await Email.findByIdAndUpdate(
        emailId,
        { 
          status: 'sent', 
          sentAt: new Date() 
        },
        { new: true }
      );
      console.log(`Email ${emailId} status updated to "sent"`);
    }
    
    console.log(`Scheduled email successfully sent to ${email}`);
  } catch (error) {
    console.error('Error in scheduled email job:', error);
    
    // Update the status to failed if there's an error
    if (emailId) {
      await Email.findByIdAndUpdate(
        emailId,
        { 
          status: 'failed', 
          error: error.message 
        },
        { new: true }
      );
      console.log(`Email ${emailId} status updated to "failed"`);
    }
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