import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const AuthRouter = express.Router();

AuthRouter.post('/register', registerUser);
AuthRouter.post('/login', loginUser);

export default AuthRouter;
