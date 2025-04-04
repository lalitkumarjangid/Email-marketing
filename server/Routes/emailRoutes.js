import express from 'express';
import { getUserEmails, scheduleEmail } from '../controllers/emailController.js';
import { authenticate } from '../middlewares/authMiddlewares.js';

const emailRoutes  = express.Router();

emailRoutes.post('/schedule', authenticate, scheduleEmail);
emailRoutes.get("/allmails" , authenticate , getUserEmails)

export default emailRoutes;
