import Email from '../models/emails.js';
import agenda from '../config/agenda.js';
import dotenv from 'dotenv';
dotenv.config();

export const scheduleEmail = async (req, res) => {
  try {
    const { email, subject, body, delayInMinutes = 1, flowData } = req.body;
    
    // Calculate scheduled time (default to 1 minute if delayInMinutes is not provided)
    const delayMs = (delayInMinutes || 1) * 60 * 1000;
    const scheduledAt = new Date(Date.now() + delayMs);
    
    // Include user information if available
    const userId = req.user ? req.user.id : null;

    // Create email document with flow data
    const emailData = {
      email,
      subject, 
      body,
      scheduledAt,
      userId,
      flowData, // Store the flow data for reference
      status: 'scheduled'
    };

    // Save the email to the database first
    const newEmail = await Email.create(emailData);

    // Schedule the email with agenda, including the email ID
    await agenda.schedule(scheduledAt, 'send scheduled email', { 
      email, 
      subject, 
      body,
      emailId: newEmail._id // Pass the email ID to the job
    });

    console.log('Email scheduled with agenda for', scheduledAt);
    return res.status(201).json({ 
      message: 'Email scheduled successfully', 
      data: {
        id: newEmail._id,
        email: newEmail.email,
        scheduledAt: newEmail.scheduledAt,
        status: newEmail.status
      }
    });
    
  } catch (err) {
    console.error('Email scheduling error:', err);
    return res.status(500).json({ 
      message: 'Server Error', 
      error: err.message 
    });
  }
};

// Get all scheduled emails for a user
export const getUserEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const emails = await Email.find({ userId })
      .sort({ scheduledAt: -1 })
      .select('email subject scheduledAt status sentAt');
      
    return res.status(200).json({ 
      message: 'Emails retrieved successfully', 
      data: emails 
    });
  } catch (err) {
    console.error('Error retrieving emails:', err);
    return res.status(500).json({ 
      message: 'Server Error', 
      error: err.message 
    });
  }
};